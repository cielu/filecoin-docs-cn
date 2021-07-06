---
title: 'Lotus Miner: 生命周期'
description: '如何在 Lotus Miner 矿工程序上安全地执行维护。'
breadcrumb: Lifecycle
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

这些操作通常与维护和升级有关。 鉴于期望矿工程序在运行长时间且昂贵的操作时以连续的方式向链条提交证据，因此重要的是，操作员必须熟悉如何管理矿工生命周期中的某些事件，以便最大程度地保证执行这些事件。

[[TOC]]

## 安全重启矿工守护程序进程

关闭矿工程序并重新启动它的过程很复杂。 要想在所有保证中都能做到这一点，需要考虑以下几个因素：

- 矿工程序计划离线多长时间。
- 矿工程序证明期限（即截止日期 - Deadline）的存在和分布。
- 开放的支付渠道和正在进行的检索交易的存在。
- 正在进行的密封操作。

### 减少离线时间

考虑到需要不断向网络发送证明，矿工应该尽可能少地处于离线状态。 离线时间 _Offline-Time_ 包括计算机完全重新启动矿工守护程序所需的时间。 由于这些原因，我们建议您按照以下步骤操作：

1. 重新启动 Lotus Miner 进程之前，请重新构建并安装所有升级。
2. 确保证明参数位于快速存储驱动器（例如 NVMe 驱动器或 SSD）上。 这些是首次启动矿工程序时下载的证明参数，并且已经保存到 `var/tmp/filecoin-proof-parameters`，或者 `$FIL_PROOFS_PARAMETER_CACHE` （如果定义了环境变量）。

### 确保当前截止日期（Deadline）的证明已发送

在仍有待处理操作的情况下关闭矿工程序可能会导致[矿工被惩罚](../slashing.md)。 通过运行 `lotus-miner proving info` 来检查是否有未决操作。 如果任何截止日期（Deadline）显示了过去的 区块高度 _block height_ ，请不要重新启动。

在下面的例子中，`Deadline Open` 是 454, 早于 `Current Epoch` （当前纪元）的 500。这时不应关闭或重启该矿工程序：

```bash
$ lotus-miner proving info

Miner: t01001
Current Epoch:           500
Proving Period Boundary: 154
Proving Period Start:    154 (2h53m0s ago)
Next Period Start:       3034 (in 21h7m0s)
Faults:      768 (100.00%)
Recovering:  768
Deadline Index:       5
Deadline Sectors:     0
Deadline Open:        454 (23m0s ago)
Deadline Close:       514 (in 7m0s)
Deadline Challenge:   434 (33m0s ago)
Deadline FaultCutoff: 384 (58m0s ago)
```

在下一个示例中，由于没有 `Deadlines` 早于 `Current Epoch`，因此可以安全地重启矿机。 您需要大约 45 分钟的时间，矿工程序才能恢复在线以声明故障。 这称为 Deadline FaultCutoff。 如果矿工程序没有故障，那么您大约有一个小时的时间。

```bash
$ lotus-miner proving info

Miner: t01000
Current Epoch:           497
Proving Period Boundary: 658
Proving Period Start:    658 (in 1h20m30s)
Next Period Start:       3538 (in 25h20m30s)
Faults:      0 (0.00%)
Recovering:  0
Deadline Index:       0
Deadline Sectors:     768
Deadline Open:        658 (in 1h20m30s)
Deadline Close:       718 (in 1h50m30s)
Deadline Challenge:   638 (in 1h10m30s)
Deadline FaultCutoff: 588 (in 45m30s)
```

上面的 `proving info`（证明信息）示例显示了当前证明窗口和截止日期 _Deadline_ 的信息。 如果您希望看到任何即将到来的截止日期 _Deadline_ ，可以使用：

```bash
$ lotus-miner proving deadlines
```

每行对应一个截止日期（30 分钟，涵盖 24 小时）。 当前的已标记。 这有时对于查找一天中的矿工不必向链提交任何证明的时间很有用。

### 检查并暂时禁止交易

在停止该矿工程序之前，请检查交易状态，以确保该矿工程序未正在接收客户的数据或未正在检索客户的数据：

```bash
lotus-miner storage-deals list
lotus-miner retrieval-deals list
lotus-miner data-transfers list
```

为了防止在等待当前截止日期 _Deadline_ 之前完成新交易时，可以暂时禁止存储交易和检索交易。 这样可以确保关闭时，矿工程序不会发现自己正处于新交易期间：

```bash
lotus-miner storage-deals selection reject --online --offline
lotus-miner retrieval-deals selection reject --online --offline
```

矿工程序完成重启后，可以使用以下方式重置交易：

```bash
lotus-miner storage-deals selection reset
lotus-miner retrieval-deals selection reset
```

### 检查正在进行的密封操作

要获得当前扇区和状态的概述，请运行：

```bash
lotus-miner sectors list
```

任何正在进行的密封操作将从最后一个检查点重新开始，通常对应于当前密封阶段的开始。 鉴于密封非常耗时，因此在重新启动矿工程序之前，应等待接近完成的某些阶段。

### Restarting the miner

考虑到上述所有因素，您可以决定关闭矿工程序的最佳时机：

```bash
lotus-miner stop
# When using systemd
# systemctl stop lotus-miner
```

您可以根据需要尽快重启矿工程序。 工作者程序不需要重新启动，因为他们会在矿工程序恢复运行时自动重新连接到该矿机。 但是，如果要在关闭矿工程序的同时升级节点，则需要重新启动机器。

## 重启工作者程序

可以随时重新启动 Lotus [密封工作者程序(Seal Worker)](seal-workers.md)，但是如果他们处于其中一个密封步骤的期间，则该操作将再次开始（从最后一个检查点开始）。

::: warning
在从头开始完全密封之前 (_PreCommit1_ 阶段) ，最多可以尝试三种操作来完成 _PreCommit2_ 操作。
:::

## 更改存储位置

如果要将矿工程序相关存储的位置更改为其他路径，对于矿工程序或密封工作者程序，请确保 Lotus 矿工程序和密封工作者程序都应获取到新位置。

```sh
lotus-miner storage list
```

上面的命令将为您列出[矿工程序已知的存储位置](custom-storage-layout.md)。 此信息存储在 `~/.lotusminer/storage.json`（或 `$LOTUS_MINER_PATH/storage.json`（如果已定义）中）。 Lotus 密封工作者程序将所有数据存储在 `~/.lotusworker` 文件夹（或 `$LOTUS_WORKER_PATH`，如果已定义）中。

如果要更改 Lotus Miner 矿工程序的任何存储位置，请执行以下步骤：

1. 将您的矿工程序设置为拒绝任何新的存储和检索交易，以便在复制期间不修改存储。
2. 在矿工程序运行时按**原样**复制数据，并将其保留在原始位置。 由于这通常涉及移动大量存储，因此需要时间。 与此同时，我们的矿工程序将继续履行其职责。   
3. 一旦数据复制完成后，[停止矿工程序](#安全重启矿工守护程序进程)，要记得遵循以上建议。   
4. 使用新的数据位置编辑 `storage.json` 并使矿工程序无法使用旧的数据（通过重命名或卸载），以确保矿工程序启动时不再使用该数据。   
5. 启动矿工程序。
6. 验证一切工作是否正常。 如果是这样，您可以丢弃旧副本了。

如果希望在保持当前容量的同时扩展存储空间，则始终可以通过 `lotus storage attach` [添加额外的存储位置](custom-storage-layout.md)到 Lotus 矿工程序（请参阅 `--help`）。

如果要更改任何 Lotus 工作者的存储位置：

1. 停止 Lotus Worker 工作者程序。
2. 移动数据到新的位置。
3. 相应的设置 `$LOTUS_WORKER_PATH` 。   
4. 再次启动 Lotus Worker 工作者程序。

工作者程序在停止之前正在执行的任何操作都将从最后一个检查点（可以重新开始的点开始，这可能与当前密封阶段的开始相对应）重新开始。

:::warning
当前不支持在不同工作者程序线程之间移动数据。 将工作者程序存储文件夹移动到其他工作者程序计算机都将无法正常工作，因为矿工程序希望正在进行的密封操作由最初分配给他们的工作者程序完成。
:::

## 使用一个不同的 Lotus 节点

如果您打算在矿工程序使用的 Lotus 节点上运行维护，或者由于当前节点不起作用而需要故障转移到另一个 Lotus 节点，请执行以下步骤：

1. [停止矿工程序](#安全重启矿工守护程序进程)
2. 将 `FULLNODE_API_INFO` 环境变量设置为新节点的位置：   

```sh
export FULLNODE_API_INFO=<api_token>:/ip4/<lotus_daemon_ip>/tcp/<lotus_daemon_port>/http
```

请按照以下步骤学习[如何获取令牌](../../build/lotus/api-tokens.md)。

3. 如果尚未导出钱包，请立即将其从旧节点导出，然后将其重新导入新的 Lotus 节点。
4. 启动矿工程序。 它现在应该与新的 Lotus 节点通信，并且由于它与旧的 Lotus 节点具有相同的钱包，因此它应该能够代表矿工程序执行必要的操作。

::: callout
确保新的 Lotus 节点已完全同步。
:::
