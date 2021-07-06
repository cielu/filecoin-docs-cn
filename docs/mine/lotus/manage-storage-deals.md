---
title: 'Lotus Miner: 管理存储交易'
description: '本指南描述了 Lotus 矿工可用于管理存储交易的不同工作流程和选项。'
breadcrumb: '管理存储交易'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

在矿工的生命周期内，Filecoin 网络客户端将查询矿工 _存储价格_ 并发起交易。 交易经历以下几个阶段：

1. 数据传输（用于在线交易）或数据导入（用于离线交易）
2. 密封带有交易数据的扇区 (矿工)
3. 证明（每24小时）

以下各节深入介绍了 Lotus 可用于管理存储交易过程的多个部分的不同方式。

## 启用和禁用交易

在矿工程序中有两种启用和禁用新存储交易的方法。 任何一个：

- 编辑[矿工程序配置文件](miner-configuration.md)中的 `[DealMaking]` 选项，然后[重新启动矿工程序](miner-lifecycle.md)。  
- 使用 `lotus-miner storage-deals selection` 命令。

由于重启矿工程序是一项微妙的操作，因此最好让 Lotus 通过使用 `lotus-miner storage-deals selection` 命令来处理。

要禁用存储交易，请运行：

```sh
lotus-miner storage-deals selection reject --online --offline
```

上面的命令会根据使用的标志自动更新 `config.toml` 文件中的值以进行离线和在线交易。

您可以使用以下方法验证当前状态：

```sh
lotus-miner storage-deals selection list
```

要 _重启_ 存储交易，请运行: 

```sh
$ lotus-miner storage-deals selection reset
$ #验证它们已被启用
$ lotus-miner storage-deals selection list
considering online storage deals: true
considering 离线存储交易: true
```

请注意，上面的值会影响新交易。 但正在进行的交易仍然必须兑现。

## 设定询价

接受新交易的最重要方面之一是矿工的条件和价格。 接收到的交易将在这些条件下进行评估，并被 Lotus 矿工程序自动接受或拒绝。

存储价格和其他条件由 `lotus-miner storage-deals set-ask` 命令设置。 例如：

```sh
lotus-miner storage-deals set-ask \
  --price 0.0000001 \
  --verified-price 0.0000001  \
  --min-piece-size 56KiB \
  --max-piece-size 32GB
```

上面的命令将每个 GiB 的交易价格设置为 `0.0000001 FIL` (`100 nanoFIL`)。 这意味着，客户必须为每存储的 GiB 每 30 秒支付 `100 nanoFIL`。 如果客户希望在一周的时间内存储 5GiB，则总价格将为：`5GiB * 100nanoFIL/GiB_Epoch * 20160 Epochs = 10080 microFIL`。

该命令还用于设置最小和最大交易量。 确保检查 `lotus-miner storage-deals set-ask --help` 以查看所有选项。

您可以通过以下方式显示矿工的当前要价：

```sh
lotus-miner storage-deals get-ask
```

Lotus 客户端还可以通过以下方式询问矿工价格：

```sh
lotus client query-ask <minerID>
```

## 列出当前交易

可以通过运行以下命令找到当前交易及其当前状态：

```sh
lotus-miner storage-deals list -v
```

该列表显示：

- 交易创建时。
- 正在存储的 DataCID。
- 提交它的客户端钱包地址。
- 大小和持续时间（以纪元 Epoch 为单位）（30 秒/纪元）。

## 待发布的交易

列出在发布队列中等待的交易:

```sh
lotus-miner storage-deals pending-publish
```

您可以随时发布交易，通过 `--publish-now` 选项:

```sh
lotus-miner storage-deals pending-publish --publish-now
```

Miner的默认配置被设置为批处理多个交易，并每小时最多发布8个交易。您可以在[配置文件](miner-configuration.md#在一条消息中发布多个交易)中改变 `PublishMsgPeriod` 和 `MaxDealsPerPublishMsg`。

## 通过 PieceCID 阻止存储交易

Lotus Miner 提供了内部工具来导入 PieceCID 阻止列表：

```sh
lotus-miner storage-deals set-blocklist blocklist-file.txt
```

`blocklist-file.txt` 会包含一个 CID 列表，每个 CID 都位于单独的行上。 可以使用以下命令检查当前阻止列表：

```sh
lotus-miner storage-deals get-blocklist
```

要重置和清除阻止列表，请运行:

```sh
lotus-miner storage-deals reset-blocklist
```

## 将同一扇区的交易分组

从交易收到的那一刻到包含数据的扇区开始密封之间的延迟，允许矿工程序在空间允许的情况下在每个扇区中包含多个交易。每个扇区的交易数量越多，操作效率就越高，因为需要的密封和验证操作就越少。

可以使用[配置](miner-configuration.md)的 `[Sealing]` 部分中的 `WaitDealsDelay` 选项来设置延迟。

## 离线存储交易

当要传输的数据量[非常大](../../store/lotus/very-large-files.md#deals-with-offline-data-transfer)时，将某些硬盘直接运送给矿工并以**离线**方式完成交易可能会更有效。

在这种情况下，矿工程序将必须使用以下命令手动导入存储交易数据：

```sh
lotus-miner storage-deals import-data <dealCid> <filePath>
```
