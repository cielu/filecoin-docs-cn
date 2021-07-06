---
title: 'Lotus Miner: 消息池'
description: '消息池(mpool)是lotus的组件，用于处理挂起的消息以包含在链中。'
breadcrumb: '消息池'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }} 消息直接添加到本地发布消息或通过 Pubsub 传播添加到 MPool。每当矿工程序准备为提示集（TipSet）创建一个区块时，它都会调用 MPool 选择算法，该算法选择一组适当的消息，从而优化矿工程序的奖励和链能力。

当消息被执行时，它们使用 _gas_。使用的 _gas_ 数量、附加到每个消息的参数和网络的当前 _BaseFee_ 决定了在链中包含交易的最终最终FIL成本(FIL-Cost)。部分成本被网络消耗掉了。另一部分作为奖励给包含该交易的第一个区块的矿工。

下面将解释消息的不同上限和费用，以及如何检查和与消息池交互的说明。

::: tip
Lotus 提供了使用 `lotus mpool` 子命令与消息池(MPool)进行交互的工具。
:::

[[TOC]]

## 消息选择

挖掘新区块时，矿工必须选择一组消息以最大程度地获得奖励。使用 Pubsub 分配消息的工作方式，矿工之间不会相互传递票证（Ticket），就不可能完全确定其他矿工是否还将消息也包含在新提示集（TipSet）中的其他块中，并且可能如果他们的区块先执行则先得到奖励。问题是 NP-hard（背包包装的一种情况），因此充其量可以在合理的时间内对最佳选择进行近似估算。

考虑到矿工的票证（Ticket）质量，Lotus 采用了一种更复杂的算法来从池中选择要包含的消息。 票证（Ticket）质量反映了提示集（TipSet）中某个区块的执行顺序的概率。 给定票证（Ticket）质量，该算法将计算每个区块的概率，并选择相关的消息链，使奖励最大化，同时还优化了链的容量。

如果票证（Ticket）质量足够高，则使用贪心选择算法（Greedy Selection Algorithms）代替，该算法只是选择最大奖励的相关链。 请注意，始终选择来自优先级地址的挂起消息链，无论其盈利能力如何。

## 燃气（Gas）、费用（Fee）、限制（Limit）和上限（Cap）

执行一条消息时，它消耗 燃气 _Gas_ 。 一条消息消耗的总燃气量 _Total Gas_ 直接影响将该消息放入区块链的成本，这是发送者必须支付的价格。

::: tip
可以为 Lotus 配置多个地址，以根据操作对费用（Fee）和限制（Limit）进行更精细的控制，并避免行首阻塞（Head-Of-Line Block），特别是对于 WindowPoSts 这样的高价值操作。 查看[矿工地址指南](miner-addresses.md)。
:::

The [How Filecoin works page](../../about-filecoin/how-filecoin-works.md) explains gas-usage and fee in more detail. As an additional tip, you can use Lotus to find out about the current _BaseFee_:
[Filecoin 工作原理页面](../../about-filecoin/how-filecoin-works.md)更详细地解释了然气（Gas）的使用和费用（Fee）。 另外，您可以使用 Lotus 来了解当前的 基础费用（BaseFee）：

```sh
# 将以 attoFIL 为单位打印最后一个基础费用（BaseFee）
lotus chain head | xargs lotus chain getblock | jq -r .ParentBaseFee
```

## 检查待办消息

如果矿工认为消息不够吸引人，无法包含在新块中，则它们可能会卡在消息池中。 这通常是由于 GasFeeCap 太低而导致的，例如，当网络的 BaseFee 很高时。 如果网络拥塞，也可能是 GasPremium 太低的结果。

您可以使用以下方法检查池中当前是否有消息，以及由您的节点专门发送的消息：

```sh
lotus mpool pending --local
```

对于每条消息，您都可以看到 Key 信息，例如 _GasLimit_，_GasFeeCap_ 和 _GasPremium_ 的值，如上所述。

要将输出减小为消息的 Key 和 Value，可以使用：

```sh
lotus mpool pending --local | grep "Nonce" -A5
```

为了避免消息在发送时在池中停留过长时间，可以调整在配置中的[Lotus Miner 矿工费用](miner-configuration.md)，并为[_WindowPoSts_ 使用其他控制地址](miner-addresses.md)。 现有消息可以随时通过以下步骤替换。

## 替换池中的消息

您可以通过推送具有相同 `Nonce` 的新消息来替换池中的消息，该 `Nonce` 具有**新的 `GasPremium`, 至少比原消息大 25％**。 为了达到这种效果，最简单的方法是：

```sh
lotus mpool replace --auto <from> <nonce>
```

上面的命令将替换池中的关联消息，并根据当前的网络状况估算出新的 _GasPremium_ 和 _GasFeeCap_ 来自动对其重新定价。 如果希望限制消息总花费，也可以设置 `--max-fee`。 所有其他标志将被忽略。

另外，也可以使用各自的标志手动设置 _GasPremium_，_GasFeeCap_：

```sh
lotus mpool replace --gas-feecap <feecap> --gas-premium <premium> <from> <nonce>
```

如果新的 _Gas Premium_ 低于原始比率的 1.25，则该消息将不包含在池中。 直接使用[`MpoolPush` API 方法](../../reference/lotus-api.md)时，可以更改其他消息字段，例如事务的接收者。 在这种情况下，新消息将需要首先在本地签名。

在正常情况下，不得更改 _GasLimit_。 有关如何使用可选标志替换 _GasLimit_ 的说明，请查看：

```sh
lotus mpool replace --help
```
