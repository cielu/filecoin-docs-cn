---
title: 'Lotus Miner: 密封工作者'
description: 'Lotus Seal Worker密封工作者是一个单独的应用程序，可用于将密封过程中所有阶段的一部分卸载到单独的机器或进程中。本指南说明了如何设置一个或几个 Lotus Seal Worker密封工作者'
breadcrumb: '密封工作者'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

尽管 Lotus Miner 可以自己运行每个密封阶段（并且默认配置为运行），但是Lotus Worker 工作者可以创建密封管道 _Sealing Pipeline_，以提高资源利用率并使主矿工程序从 CPU 密集型任务中解放出来，从而可以专注于执行并将 _WindowPoSTs_ 和 _WinningPoSTs_ 提交给链。

[[TOC]]

## 工作者资源配置

Lotus根据可用资源和特定作业估计使用的资源将任务分配给Lotus Workers。考虑到的资源有:

- 任务将使用的CPU线程数。
- 获得良好性能所需的最小内存量。
- 运行任务所需的最大内存量，系统可以将部分内存量交换到磁盘，对性能不会有太大影响。
- 系统是否可以使用图形处理器。

### 任务资源表

默认的资源表位于[resources.go](https://github.com/filecoin-project/lotus/blob/master/extern/sector-storage/resources.go#L47) 中，可以对其进行编辑，以调整调度行为，以更好地适应特定的密封集群。

默认资源值表。其中一些值是相当 _fairly_ 保守的:

|   扇区大小   |  任务类型   |  线程   | 最小RAM  | 最小Memory | GPU        |
|-------------|------------|---------|---------|------------|------------|
|     32G     | AddPiece   | 1*      | 4G      | 4G         |            |
|             | PreCommit1 | 1**     | 56G     | 64G        |            |
|             | PreCommit2 | 92%***  | 15G     | 15G        | If Present |
|             | Commit1    | 0****   | 1G      | 1G         |            |
|             | Commit2    | 92%***  | 32G+30G | 32G+150G   | If Present |
|     64G     | AddPiece   | 1*      | 8G      | 8G         |            |
|             | PreCommit1 | 1**     | 112G    | 128G       |            |
|             | PreCommit2 | 92%***  | 30G     | 30G        | If Present |
|             | Commit1    | 0****   | 1G      | 1G         |            |
|             | Commit2    | 92%***  | 64G+60G | 64G+190G   | If Present |

\* AddPiece可以使用多个线程，这个值很可能在不久的将来会改变\
**当与 `FIL_PROOFS_USE_MULTICORE_SDR=1` 环境变量一起使用时，PreCommit1可以使用多个内核(最多为共享L3缓存的内核数)\
***根据可用线程的数量，这些值表示:

```
 12  * 0.92 = 11
 16  * 0.92 = 14
 24  * 0.92 = 22
 32  * 0.92 = 29
 64  * 0.92 = 58
 128 * 0.92 = 117
```

**** Commit1步骤在CPU时间方面非常低，并且阻塞了Commit2步骤。将它分配给零线程将使它更有可能以更高的优先级进行调度。

Unseal任务与PreCommit1任务使用的资源相同。

### 资源窗口

调度器使用资源窗口的概念来防止需要大量资源的任务出现资源短缺，而需要较少资源的任务出现资源短缺。

资源窗口只是一个密封任务的容器，当没有任务运行时，给定的工作人员可以基于其可用资源并行地运行这些任务。

在调度程序中，每个worker有:
- 调度窗口——两个资源窗口用于分配要从全局队列中执行的任务
- 准备窗口——一个准备执行任务的资源窗口(例如，扇区数据在需要时被获取)
- 执行窗口——一个用于当前执行任务的资源窗口

当任务到达全局调度队列时，调度程序将寻找空的调度窗口，基于很多因素，比如 worker是否已经可以直接访问扇区数据，worker支持的任务类型，worker是否可以直接访问扇区数据，根据任务优先级，将任务分配给调度窗口。

在工人完全处理一个调度窗口之后，它被发送回全局调度程序以获得更多的密封任务。

### 任务优先级

当调度程序决定要运行哪些任务时，它会考虑运行特定任务的优先级。

有两个优先级-高优先级，用于执行成本低但会阻碍其他操作的任务，和普通优先级用于所有其他任务。下表中定义了默认优先级。

|   任务类型    | 优先级    |
|--------------|----------|
| AddPiece     | 6        |
| PreCommit1   | 5        |
| PreCommit2   | 4        |
| Commit2      | 3        |
| Commit1      | 2        |
| Unseal       | 1        |
| Fetch        | -1       |
| ReadUnsealed | -1       |
| Finalize     | -2       |

- 较低的数字表示较高的优先级。
- 负数表示最高的优先级。

比较任务优先级时:
- 高优先级的任务优先考虑
- 有交易的扇区排名第二(交易越多，优先级越高)
- 如果以上相同，则根据表中的优先级选择任务
- 如果上述相等，则选择具有较低扇区数的扇区(这可以在向链提交消息时略微优化燃气使用)

## 安装

::: callout
在密封期间，大量数据在workers之间移动/复制，因此它们之间必须有良好的网络连接。
:::

遵循[安装指南](../../get-started/lotus/installation.md)时，应该已经与其他程序一起构建并安装了 `lotus-worker` 应用程序。 为了简单起见，我们建议在将要运行 Lotus Workers 的计算机中遵循相同的步骤（即使在那里未使用 Lotus Miner 和 Lotus 守护程序）

## 设置矿工程序

Lotus 矿工（Miner）程序需要准备好接受工作者（Worker）程序的 API 连接。

### 允许外部连接到矿工程序的 API

如[此文档](miner-configuration.md#api-section) 所述，将 `ListenAddress`和`RemoteListenAddress`设置为本地网络接口的IP。 为了安全起见，API端口不应向Internet开放。

### 获取身份验证令牌

```sh
lotus-miner auth api-info --perm admin
```

Lotus Workers将需要这个令牌连接到Lotus Miner。更多信息请查看[API文档](../../build/lotus/api-tokens.md)。写下输出，以便在下一步中使用。

### Configuring the Lotus Miner sealing capabilities

Lotus Miner本身就是一名工作者(_Worker_)，将像其他工作者(_Worker_)一样为密封作业做出贡献。根据您希望您的工作者(_Worker_)执行密封过程的哪个阶段，您可以选择配置Lotus Miner将直接执行哪些阶段。这是在Lotus Miner `config.toml` 的 `Storage` 部分完成的:

```toml
[Storage]
  AllowAddPiece = true
  AllowPreCommit1 = true
  AllowPreCommit2 = true
  AllowCommit = true
  AllowUnseal = true
```

如果要将这些操作中的任何一个完全委派给工作者(_Worker_)程序，请将其设置为 `false`。

## 启动 Lotus workers

### 环境变量

确保工作者(_Worker_)程序在运行时可以访问以下环境变量。 这些类似于 Lotus Miner 矿工守护程序使用的设置（在[安装指南中说明](miner-setup.md)）：

```sh
# MINER_API_INFO as obtained before
export TMPDIR=/fast/disk/folder3                    # 密封的时候使用
export MINER_API_INFO:<TOKEN>:/ip4/<miner_api_address>/tcp/<port>/http`
export BELLMAN_CPU_UTILIZATION=0.875      #  根据硬件可选
export FIL_PROOFS_MAXIMIZE_CACHING=1
export FIL_PROOFS_USE_GPU_COLUMN_BUILDER=1 # gpu 可用时
export FIL_PROOFS_USE_GPU_TREE_BUILDER=1   # gpu 可用时
export FIL_PROOFS_PARAMETER_CACHE=/fast/disk/folder # > 100GiB!
export FIL_PROOFS_PARENT_CACHE=/fast/disk/folder2   # > 50GiB!

# The following increases speed of PreCommit1 at the cost of using a full
# CPU core-complex rather than a single core.
# See https://github.com/filecoin-project/rust-fil-proofs/ and the
# "Worker co-location" section below.
export FIL_PROOFS_USE_MULTICORE_SDR=1
```

::: tip
从国内运行时，请设置[`IPFS_GATEWAY`](tips-running-in-china.md)环境变量
:::

### 运行工作者（Worker）程序

```sh
lotus-worker run <flags>
```

上面的命令将启动工作者（Worker）程序。 根据您希望工作者（Worker）程序执行的操作及其运行的硬件，您将要指定工作者（Worker）程序将在哪些密封阶段使自己可用：

```sh
   --addpiece                    enable addpiece (default: true)
   --precommit1                  enable precommit1 (32G 扇区: 1 核, 128GiB 内存) (default: true)
   --unseal                      enable unsealing (32G 扇区: 1 核, 128GiB 内存) (default: true)
   --precommit2                  enable precommit2 (32G 扇区: 所有核, 96GiB 内存) (default: true)
   --commit                      enable commit (32G 扇区: 所有核 或者 GPU, 128GiB 内存 + 64GiB swap) (default: true)
```

::: tip
如果您在同一主机上运行多个工作者 (_Worker_) 程序，则需要指定 `--listen` 标志，并确保每个工作者 (_Worker_) 程序都在不同的端口上。
:::

工作者运行后，它应该已连接到Lotus miner。 您可以使用以下方法进行验证：

```sh
$ lotus-miner sealing workers
Worker 0, host computer
        CPU:  [                                                                ] 0 core(s) in use
        RAM:  [||||||||||||||||||                                              ] 28% 18.1 GiB/62.7 GiB
        VMEM: [||||||||||||||||||                                              ] 28% 18.1 GiB/62.7 GiB
        GPU: GeForce RTX 2080, not used

Worker 1, host othercomputer
        CPU:  [                                                                ] 0 core(s) in use
        RAM:  [||||||||||||||                                                  ] 23% 14 GiB/62.7 GiB
        VMEM: [||||||||||||||                                                  ] 23% 14 GiB/62.7 GiB
        GPU: GeForce RTX 2080, not used
```

### 矿工（Miner）程序与工作者（Worker）的 Co-Location 模式

您可以将 _Lotus Worker_ 与 _Lotus Miner_ 在同一台计算机上运行。 这有助于管理进程之间的优先级，或者更好地为每个任务分配可用的CPU。 为避免冲突，我们建议在矿工密封配置中禁用所有任务类型。

此外，要注意密封过程所使用的本地资源(特别是CPU)。_WindowPoST_ 占用大量CPU，需要miner定期提交。如果一个miner正在并行执行其他CPU绑定的密封操作，它可能无法及时提交 _WindowPoSTs_，会在这个过程中[丢失抵押品](../slashing.md)。因此，我们建议仔细分配可用的CPU内核，并将密封阶段分配给Lotus Miners和Lotus Workers。

请注意，如果你将miner和worker(s)放在一起，你不需要打开miner API，它可以继续在本地接口上侦听。

### Lotus Worker Co-Location 的模式

在大多数情况下，每台计算机仅应运行一个Lotus Worker，因为`lotus-worker`会尝试使用所有可用资源。在一个操作系统上下文中运行多个Lotus Workers将导致资源分配问题，这将导致调度程序分配的工作量超过可用资源。

最好在每台计算机上运行多个worker程序的唯一的情况是,当有多个可用的GPU, lotus目前只支持一个GPU ，在这种情况下,建议在不重叠资源的单独容器中运行worker程序(CPU分离,单独的内存分配,单独的GPU)

#### Separating Nvidia GPUs

当使用专有的Nvidia驱动程序时，可以通过 `NVIDIA_VISIBLE_DEVICES=[device number]` env 变量选择Lotus将使用哪个GPU设备。

设备号可以通过 `nvidia-smi -L` 命令获取。