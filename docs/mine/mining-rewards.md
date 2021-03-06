---
title: '挖矿奖励'
description: '在 Filecoin 中，矿工通过向网络贡献而获得不同类型的奖励。'
breadcrumb: '挖矿奖励'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

他们付出的努力主要有两种奖励类型：仓储费用和区块奖励。

## 存储费用（Storage fees）

在网络上每隔 24 小时执行一次 时空证明（PoSt - Proof-of-Spacetime） 窗口检查，以确保矿工继续正常托管其所需扇区。 相应地，每个存储矿工保证的扇区集都被分成子集，每个窗口一个子集。 在给定的窗口内，每个存储矿工必须为各自子集中的每个部门提交 PoSt。 矿工哪天处于不活动状态，哪天将收取[故障费 fault fee](slashing.md)

**存储费用** 是达成交易后客户为交换数据而定期支付的费用。 这些费用会随着时间的推移继续履行职责而自动存入矿工关联的提款钱包，并在收到后短暂锁定。

## 区块奖励（Block rewards）

**区块奖励**是给予新区块的矿工的大笔款项。与存储费用不同，这些奖励并非来自关联客户;相反，网络“打印”新的FIL既是一种通货膨胀的措施，也是矿商推进链的一种激励。网络上所有活跃的矿工都有机会获得块奖励，他们的机会与当前贡献给网络的存储空间大小成正比。

赢得开采新区块的权利的机制称为 WinningPoSt 。 在 Filecoin 网络中，时间离散为一系列纪元 - 区块链的高度对应于经过的纪元数。 在每个纪元的开始，都会选择少量的存储矿工来挖掘新的区块。 除了区块奖励之外，每个矿工还可以收取与区块中包含的每个消息相关的费用。

每个 TipSet 上的块数基于 λ= 5 随机变量的泊松分布（Poisson Distribution）。矿工实现可以使用几种策略来选择要在每个块中包括哪些消息，以最大程度地减少重叠。 仅每个消息的“首次执行”将收取相关的费用，并根据与该块相关联的 VRF（可验证随机功能 - Verifiable Random Function）凭证的哈希值对执行进行排序。

## 验证客户（Verified Clients）

为了通过简单的容量承诺进一步激励“有用”数据的存储，存储矿工有额外的机会竞争 验证客户 提供的特殊交易。 此类客户在提供涉及存储有意义数据的交易意图方面获得了认证，并且存储矿工为这些交易赚取的权力会因乘数得到增强。 考虑到该乘数后，给定的存储矿工拥有的总算力称为**有效算力（quality-adjusted power）**。

## 检索费用（Retrieval Fees）

在完成检索交易时（通过将部分数据发送到分类中），使用 支付渠道 以递增方式支付检索费用（这是在链下发生的）。