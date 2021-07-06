---
title: 'Lotus Miner: 安装一个高性能的矿工程序'
description: '本节描述了在生产环境中配置Lotus miner所需的步骤。'
breadcrumb: 'Miner 安装'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

::: warning
只有完全满足[最低硬件要求](../hardware-requirements.md)时，Mining才能在您将要挖掘的网络起作用。由于挖掘过程在几个方面对机器的要求非常高，并且依赖于精确的配置，因此我们强烈建议在开始之前具有Linux系统管理经验。
:::

[[TOC]]

## 先决条件

在尝试本指南之前:

- 确保您已满足[最低硬件要求](../hardware-requirements.md).
- 确保您是按照说明安装来[安装Lotus套件](../../get-started/lotus/installation.md),并确保已使用["Native Filecoin FFI"](../../get-started/lotus/installation.md#native-filecoin-ffi)构建了 Lotus。安装完成后，将安装`lotus`, `lotus-miner` 以及 `lotus-worker`。
- 确保您的 Lotus 节点正在运行，否则矿工程序将无语与其通信而导致无法正常工作。
- 如果您在国内，请先阅读[在国内运行的小建议](tips-running-in-china.md)。

::: callout
请注意：如果您决定跳过以下任何部分，都可能无法正常工作！ 仔细阅读并小心实践。
:::

## 在启动矿工程序之前

### 性能调整

建议在您的系统环境中设置以下环境变量，以便在**每次启动任何Lotus应用程序时**定义它们（即启动守护进程时）：

```sh
# 查看 https://github.com/filecoin-project/bellman
export BELLMAN_CPU_UTILIZATION=0.875
```

`BELLMAN_CPU_UTILIZATION`是一个可选变量，用于指定多幂运算的一部分，以将其移至与 GPU 并行的 CPU 中。 这是为了使所有硬件都处于占用状态。 间隔必须为 0 到 1 之间的数字。0.875 值是一个很好的起点，但是如果需要最佳设置，则应该尝试一下。 不同的硬件设置将导致不同的值是最佳的。 忽略此环境变量也可能是最佳选择。

```sh
# 查看 https://github.com/filecoin-project/rust-fil-proofs/
export FIL_PROOFS_MAXIMIZE_CACHING=1 # 以RAM为代价换取更高的运行速度（RAM - 32GB 的 1 倍扇区大小）。
export FIL_PROOFS_USE_GPU_COLUMN_BUILDER=1 # PreCommit2 GPU 加速
export FIL_PROOFS_USE_GPU_TREE_BUILDER=1

# 以下内容以使用完整的 CPU Core-Complex 而不是单个内核为代价提高了 PreCommit1 的速度。 应与 CPU 关联设置一起使用！
# 查看 https://github.com/filecoin-project/rust-fil-proofs/ 以及密封工作者指南。
export FIL_PROOFS_USE_MULTICORE_SDR=1
```

### 在与 **Lotus节点** 不同的服务器上运行矿工程序

如果您选择在与 Lotus 节点不同的服务器上运行矿工程序，请设置：

```sh
export FULLNODE_API_INFO=<api_token>:/ip4/<lotus_daemon_ip>/tcp/<lotus_daemon_port>/http
```

并 **确保 `ListenAddress` 已[启用远程访问](../../build/lotus/enable-remote-api-access.md)**。 有关如何获取令牌的说明，请[参考此处](../../build/lotus/api-tokens.md)。

同样，`lotus-miner`（作为 Lotus Miner 矿工守护程序的客户端应用程序）可以通过设置以下内容与远程矿工程序进行对话：

```sh
export MINER_API_INFO="TOKEN:/ip4/<IP>/tcp/<PORT>/http"
```

### 添加必要的交换空间（Swap）

如果您**只有128GiB的RAM内存**，则需要确保系统至少提供额外的 256GiB 读写非常快的交换空间（最好是 NVMe SSD），否则您将无法密封扇区：

```sh
sudo fallocate -l 256G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# 显示当前交换空间并注意当前最高优先级
swapon --show
# 将以下行附加到 /etc/fstab（确保最高优先级），然后重新启动
# /swapfile swap swap pri=50 0 0
sudo reboot
# 检查 256GB 交换文件是否自动挂载并具有最高优先级
swapon --show
```

### 创建矿工钱包

您将至少需要一个 BLS 钱包（用于主网 `f3...`）进行挖矿。 我们建议您使用[单独的所有者（Owner）和工作者（Worker）地址](miner-addresses.md)。 因此，您至少要创建两个钱包（除非您已经有一些钱包）：

```sh
# 用作所有者（Owner）地址的新 BLS 地址：
lotus wallet new bls
t3...

# 用作工作者（Worker）地址的新 BLS 地址：
lotus wallet new bls
t3...
```

::: callout
接下来，确保[发送一些资金](../../get-started/lotus/send-and-receive-fil.md)到**工作者(Worker)地址**，以完成矿工程序设置。
:::

有关矿工如何使用的不同钱包以及如何配置它们的更多信息，请阅读[矿工地址指南](miner-addresses.md)。

::: tip
安全地[备份你的钱包](../../get-started/lotus/send-and-receive-fil.md#导出和导入地址)!
:::

### 下载参数

对于矿工来说，它需要读取并验证 Filecoin 证明参数。 这些可以预先下载（推荐），否则可以通过初始化过程下载。 验证参数由几个文件组成，在 32GiB 扇区的情况下，总计超过 **100GiB**。

我们建议设置一个自定义的位置，以存储在第一次运行时创建的参数和校对的父缓存：

```sh
export FIL_PROOFS_PARAMETER_CACHE=/path/to/folder/in/fast/disk
export FIL_PROOFS_PARENT_CACHE=/path/to/folder/in/fast/disk2
```

在每次(重新)启动时都会读取参数，因此使用具有非常快速访问权限的磁盘（例如 NVMe 驱动器）将加快矿工程序（lotus-miner）和工作者（lotus-worker）(重新)的启动的速度。 如果未设置上述变量，则默认情况下，它们将以 `/var/tmp/` 结尾，**通常空间不足**。

开始下载参数：

```sh
# 将矿工程序加入并使用 Filecoin 网络支持的扇区。
# lotus-miner fetch-params <sector-size>
lotus-miner fetch-params 32GiB
lotus-miner fetch-params 64GiB
```

您可以在[网络仪表板](https://networks.filecoin.io)中验证网络的扇区大小。 `FIL_PROOFS_*_CACHE` 变量不仅应在下载时保持定义，而且在启动 Lotus 矿工程序（或工作者程序）时也应保持定义。

## 启动前的检查清单

总结以上所有内容，请确保：

- 工作者地址(_worker address_) 有一些资金，以便矿工可以初始化。
- 定义了以下环境变量，用于任何 Lotus 矿工程序运行：
  
  ```sh
  export LOTUS_MINER_PATH=/path/to/miner/config/storage
  export LOTUS_PATH=/path/to/lotus/node/folder # 使用本地节点时。
  export BELLMAN_CPU_UTILIZATION=0.875 # 最佳值取决于您的确切硬件。
  export FIL_PROOFS_MAXIMIZE_CACHING=1
  export FIL_PROOFS_USE_GPU_COLUMN_BUILDER=1 # 当有 GPU 时。
  export FIL_PROOFS_USE_GPU_TREE_BUILDER=1   # 当有 GPU 时。
  export FIL_PROOFS_PARAMETER_CACHE=/fast/disk/folder # > 100GiB!
  export FIL_PROOFS_PARENT_CACHE=/fast/disk/folder2   # > 50GiB!
  export TMPDIR=/fast/disk/folder3                    # 密封时使用。
  ```

- 参数已预取到上面指定的缓存文件夹中。
- 系统具有足够的交换空间并且处于活动状态。

## 矿工程序初始化

在首次运行矿工程序之前，请先执行以下操作：

```sh
lotus-miner init --owner=<address>  --worker=<address> --no-local-storage
```

- 使用 `--no-local-storage` 标志，以便稍后我们可以配置[存储的具体位置](custom-storage-layout.md)。 这是可选的，但建议使用。  
- Lotus 矿工程序配置文件夹在 **`~/.lotusminer/` 或 `$LOTUS_MINER_PATH`**（如果有设置）中创建。
- [矿工地址指南](miner-addresses.md)中说明了所有者 _owner_ 地址和工作者 _worker_ 地址之间的区别。 如上所述，我们建议使用两个单独的地址。 如果未提供 `--worker` 标志，则将使用所有者 (owner) 地址。 当矿工程序运行时，可以在以后添加 控制地址 _Control address_ 。

## 连接到矿工程序

在启动矿工程序之前，对其进行配置**非常重要**，以便可以从 Filecoin 网络中的任何节点（Peer）访问它。 为此，您将需要一个稳定的公共 IP 并按如下所示编辑 `~/.lotusminer/config.toml`：

```toml
...
[Libp2p]
  ListenAddresses = ["/ip4/0.0.0.0/tcp/24001"] # 选择一个固定端口
  AnnounceAddresses = ["/ip4/<YOUR_PUBLIC_IP_ADDRESS>/tcp/24001"] # 重要!
...
```

一旦启动矿工程序，请[确保可以连接到其公共 IP/端口](connectivity.md)。

## 启动矿工程序

现在您可以启动 Lotus 矿工程序开始挖矿了：

```sh
lotus-miner run
```

或者，如果您正在使用 systemd 服务文件：

```sh
systemctl start lotus-miner
```

::: warning
在确认矿工程序不仅正在运行而且在可以[通过公共IP地址访问](connectivity.md)之前，**请不要从此处继续**。
:::

## 发布矿工地址

矿工启动并运行后，在链上发布您的矿工地址（您在上面配置的），以便其他节点可以直接与之对话并进行交易：

```sh
lotus-miner actor set-addrs /ip4/<YOUR_PUBLIC_IP_ADDRESS>/tcp/24001
```

## 下一步

现在，您的矿工程序应该已经初步设置并正在运行，但是**还有一些建议的任务**可以在黄金时间准备好：

- 设置您的[自定义存储布局](custom-storage-layout.md)（如果使用 --no-local-storage）。
- 编辑矿工程序的[配置设置](miner-configuration.md)以符合您的要求。  
- 学习如何正确的[关闭/重启矿工程序](miner-lifecycle.md)
- 使用矿工密封某个扇区的时间来更新 `ExpectedSealDuration` 参数：通过[运行基准测试](benchmarks.md)或[质押扇区](sector-pledging.md)并记下时间。
- 配置其他[密封工作者 seal workers](seal-workers.md)程序，以提高矿工密封扇区的能力。
- 配置一个 [单独的WindowPost 消息地址](miner-addresses.md) 。  
