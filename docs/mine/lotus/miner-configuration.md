---
title: 'Lotus Miner: 配置参考'
description: '本节介绍了 Lotus Miner 的配置文件，详细介绍了其中包含的选项的含义。'
breadcrumb: '配置参考'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

Lotus Miner 配置是在安装步骤中的[初始化步骤](miner-setup.md)之后创建的，并且在定义时放置在 `~/.lotusminer/config.toml` 或 `$LOTUS_MINER_PATH/config.toml` 中。

_默认配置_ 中所有项目都带有注释，因此若要自定义其中一项，需要删除前面的 `#` 。

::: tip
为了使任何配置更改生效，必须[重启矿工程序](miner-lifecycle.md)
:::

[[TOC]]

## api-section

API部分控制[矿工程序 API](../../reference/lotus-api.md)的设置：

```toml
[API]
  # 矿工程序 API 绑定的 IP 地址
  ListenAddress = "/ip4/127.0.0.1/tcp/2345/http"
  # 将其设置为可公共访问的矿工程序 API 地址
  RemoteListenAddress = "127.0.0.1:2345"
  # 常规网络超时值
  Timeout = "30s"  
```

如您所见，默认情况下侦听地址绑定到本地循环接口。 如果需要打开对其他服务器的矿工程序 API 访问权限，则需要将其设置为要使用的网络接口的 IP 地址或 `0.0.0.0`（表示“所有接口”）。 请注意，即使公开，API 访问仍然受[JWT 令牌](../../build/lotus/api-tokens.md)保护。

将 `RemoteListenAddress` 配置为另一个节点必须使用此值才能访问此 API。 通常是矿工程序的 IP 地址和 API 端口，但是根据您的设置（代理，公共 IP 等），它可能是不同的 IP。

## libp2p部分

本部分配置矿工程序的嵌入式 Libp2p 节点。 如设置说明[设置说明](miner-setup.md#连接到矿工程序)中所述，使用矿工的公共IP和固定端口来调整此部分非常重要：

```toml
[Libp2p]
  # 主机的绑定地址。 0 表示随机端口。
  # Type: 多地址的字符串数组
  ListenAddresses = ["/ip4/0.0.0.0/tcp/0", "/ip6/::/tcp/0"]
  # 在此处插入您要明确宣布给其他对等方（Peer）的任何地址。 否则，他们会被猜到。
  # Type: Array of multiaddress strings
  AnnounceAddresses = []
  # 插入任何地址，以避免在此处宣布。
  # Type: Array of multiaddress strings
  NoAnnounceAddresses = []
  # 如果计算机使连接不堪重负，则减少连接管理器设置。.
  ConnMgrLow = 150
  ConnMgrHigh = 180
  ConnMgrGrace = "20s"
```

如果已建立的数目超过为 `ConnMgrHigh` 设置的值，连接管理器将开始修剪现有连接，直到达到 `ConnMgrLow` 的设置值。 比 `ConnMgrGrace` 还少的连接将被保留。

## 发布部分

本部分控制某些 Pubsub 设置。 Pubsub 用于在网络中分发消息：

```toml
[Pubsub]
  # 通常，您将不会运行 Pubsub 引导节点，因此请将其保留为 false
  Bootstrapper = false
  # FIXME
  RemoteTracer = ""
  # DirectPeers指定具有直接对等协议的对等方。 这些对等协议在网格外部连接，无条件地显示所有（有效）消息转发给他们。 路由器将保持与这些对等方的开放连接。请注意，对等协议应与直接对等方对等两端对称配置。
  # Type: multiaddress peerinfo 的字符串数组, 必须包含 peerid (/p2p/12D3K...)
  DirectPeers = []
```

## 交易部分

本节控制用于进行存储和检索交易的参数：

```toml
[Dealmaking]
  # 启用后，矿工程序可以接受在线交易
  ConsiderOnlineStorageDeals = true
  # 启用后，矿工程序可以接受离线交易
  ConsiderOfflineStorageDeals = true
  # 启用后，矿工程序可以接受检索交易
  ConsiderOnlineRetrievalDeals = true
  # 启用后，矿工程序可以接受离线检索交易
  ConsiderOfflineRetrievalDeals = true
  # 启用后，矿工程序可以接受已验证的交易
  ConsiderVerifiedStorageDeals = true
  # 启用后，矿工程序可以接受未经验证的交易
  ConsiderUnverifiedStorageDeals = true
  # 由数据 CID 组成的列表，可在进行交易时拒绝
  PieceCidBlocklist = []
  # 密封交易需要的最大预期时间,包括交易在被密封到一个扇区之前需要转移和发布的时间（请参见下文）     
  ExpectedSealDuration = "24h0m0s"
  # 准备好要发布的交易时，在批量发布之前，等待更多交易准备发布的时间。
  PublishMsgPeriod = "1h0m0s"
  # 单个发布交易消息中包含的最大交易数量
  MaxDealsPerPublishMsg = 8

  # 用于对存储交易进行细粒度评估的命令（请参见下文）
  Filter = "/absolute/path/to/storage_filter_program"

  # 用于对检索交易进行细粒度评估的命令（请参见下文）
  RetrievalFilter = "/absolute/path/to/retrieval_filter_program"
```

`ExpectedSealDuration` 是对密封所需时间的估计，用于拒绝开始纪元（Epoch）可能早于密封完成预期的交易。 可以通过[基准测试](benchmarks.md)或[质押扇区](sector-pledging.md)来进行估算。

:::warning
`ExpectedSealDuration` 的最终值应等于 `(TIME_TO_SEAL_A_SECTOR + WaitDealsDelay) * 1.5` 。 该等式确保了矿工程序不会致力于将扇区密封得太早。
:::

### 在一条消息中发布多个交易

`PublishStorageDeals` 消息可以在一条消息中发布多个交易。
准备好要发布的交易后，Lotus 将等待 `PublishMsgPeriod` 侦听其他交易都准备就绪，然后再发送 PublishStorageDeals 消息。

但是，一旦 `MaxDealsPerPublishMsg` 准备就绪，Lotus 将立即发布所有交易。

例如，如果 `PublishMsgPeriod` 是1小时：

- 下午 1 点，交易 1 准备好发布。
  Lotus 将等到下午 2 点整等待其他交易准备就绪，然后再发送 `PublishStorageDeals`
- 下午 1 点 30 分，交易 2 准备发布
- 下午 1 点 45 分，交易 3 准备发布
- 下午 2 点整，Lotus 在单个 `PublishStorageDeals` 消息中发布交易 1、2 和 3。

如果 `MaxDealsPerPublishMsg` 为 2，则在上面的示例中，当交易 2 准备在 1:30 发布时，Lotus 将立即在单个 `PublishStorageDeals` 消息中发布交易 1 和 2。交易 3 将在后续的 `PublishStorageDeals` 消息中发布。

> 注意：如果 `PublishStorageDeals` 中的任何交易在执行时都无法通过验证，即：启动纪元（Epoch）已过，则所有交易都将无法发布。

## 使用过滤器进行细粒度的控制和接受存储及检索交易

您的用例可能需要对交易参数的组合进行非常精确和动态的控制。

Lotus 提供了两个 IPC 钩子（Hook），可让您命名一个命令以在矿工程序接受它之前为每笔交易执行：

- `Filter` 用于存储交易。
- `RetrievalFilter` 用于检索交易。

执行的命令在标准输入上接收交易参数的 JSON 格式，完成后其退出代码将解释为：

- `0`: 成功，继续进行交易。
- `non-0`: 失败，拒绝交易。

拒绝任何检索交易的最简单的过滤器如下所示：

`RetrievalFilter = "/bin/false"`. `/bin/false` 是二进制的，会立即以 `1` 的代码退出。

该[Perl 脚本](https://gist.github.com/ribasushi/53b7383aeb6e6f9b030210f4d64351d5/9bd6e898f94d20b50e7c7586dc8b8f3a45dab07c#file-dealfilter-pl) 使矿工拒绝特定的客户，并且仅接受设置为相对较早开始的交易。

您还可以使用第三方内容策略框架，例如 Murmuration Labs 的 `bitscreen`：

```sh
# 获取过滤器程序
go get -u -v github.com/Murmuration-Labs/bitscreen

# 将其添加到两个过滤器
Filter = "/path/to/go/bin/bitscreen"
RetrievalFilter = "/path/to/go/bin/bitscreen"
```

## 密封部分

本节控制围绕扇区密封的一些行为：

```toml
[Sealing]
  # 在任何给定时间开始密封之前，有多少扇区可以等待打包更多交易的上限。
  # 如果矿工并行接受多个交易，则将创建最多新扇区的MaxWaitDealsSectors。
  # 如果并行接受多个MaxWaitDealsSectors交易，则将仅并行处理MaxWaitDealsSectors交易
  # 在任何给定时间开始密封之前，有多少扇区可以等待打包更多交易的上限。
  # 请注意，相对于交易摄取率而言，将该数字设置得太高可能会导致差的扇区打包效率下降 (result in poor sector packing efficiency)
  MaxWaitDealsSectors = 2
  # 创建新的CC扇区时可以同时密封多少个扇区的上限（0 = 无限）
  MaxSealingSectors = 0
  # 创建有交易的新扇区时，可以同时密封多少个扇区的上限（0 = 无限）
  MaxSealingSectorsForDeals = 0
  # 一个新创的扇区将等待打包更多交易之前开始密封的时间。
  # 完全填充的扇区将立即开始密封
  WaitDealsDelay = "6h0m0s"
  # 是否保留交易数据的未密封副本，无论客户端是否要求。 这使得矿工避免了以后解封数据的相对高昂的成本，而以更多的存储空间为代价
  AlwaysKeepUnsealedCopy = true
```

## 密封部分

储存部分控制矿工是否可以执行某些密封动作。 根据其他[seal worker](seal-workers.md)的设置和使用，您可能需要修改某些选项。

```toml
[Storage]
  # 存储系统一次可以并行获取多少扇区的上限
  ParallelFetchLimit = 10
  # 矿工可以自行执行的密封步骤。 有时，我们有专门的密封工作程序来做，而不想让矿工为此花费任何资源。
  AllowAddPiece = true
  AllowPreCommit1 = true
  AllowPreCommit2 = true
  AllowCommit = true
  AllowUnseal = true
```

## 费用部分

费用部分允许设置矿工程序提交到链上不同消息的燃气(Gas)消耗限制：

```toml
[Fees]
  # 最高支付费用
  MaxPreCommitGasFee = "0.025 FIL"
  MaxCommitGasFee = "0.05 FIL"
  MaxTerminateGasFee = "0.5 FIL"
  # 这是一项高价值（high-value）的操作，因此默认费用更高。
  MaxWindowPoStGasFee = "5 FIL"
  MaxPublishDealsFee = "0.05 FIL"
  MaxMarketBalanceAddFee = "0.007 FIL"
```

根据网络拥塞情况，交易的基本费用可能会增加或减少。 在任何情况下，您的Gas限制都必须大于要包含的邮件的基本费用。 但是，如果基本费用很高，那么最高费用会非常高，这会导致资金快速消耗，因为矿工在正常操作期间会自动提交消息，因此请注意这一点。 即使实际费用远低于设定的最高费用，也有必要拥有比设定的最高费用更多的资金。 \* MaxWindowPostGasFee 当前已减少，但是使用的设置应保持较高，例如。 2FIL。

## 地址部分

地址部分允许用户指定从中发送消息的其他地址。这有助于在网络费用很高的情况下减轻重要消息的线头阻塞。有关更多详细信息，请参阅[矿工地址](miner-addresses.md)部分。

```toml
[Addresses]
  # 发送来自PreCommit消息的地址
  PreCommitControl = []
  # 发送来自提交消息的地址
  CommitControl = []
  # 禁止对自动发送的消息使用所有者地址。
  # 当所有者地址是脱机/硬件密钥时，此功能很有用
  DisableOwnerFallback = false
  # 禁止对可能使用其他控制地址的消息使用worker地址
  DisableWorkerFallback = false
```
