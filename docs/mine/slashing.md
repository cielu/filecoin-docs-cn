---
title: '惩罚机制 Slashing'
description: 'Slashing 惩罚机制是对无法提供可靠的正常运行时间或对网络实施恶意行为的矿工进行的惩罚。'
breadcrumb: '惩罚机制 Slashing'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

在 Filecoin 中，矿工容易受到两种不同的惩罚：存储故障惩罚(_storage fault slashing_) 和 共识故障惩罚( _consensus fault slashing_ )。

## 存储故障惩罚

该术语涵盖了范围更广的惩罚，如果矿工无法提供扇区可靠性或决定自愿退出Filecoin网，则应由矿工支付。 这些包括：

- **故障费用(Fault Fees)**: 矿工每天因其扇区离线而遭受的罚款（未能向链及时提交时空证明）。 继续收取故障费用，直到关联的钱包为空并且将矿工从网络中删除为止。 在出现故障扇区的情况下，将在故障费用之后立即增加额外的扇区罚款。 
- **扇区惩罚(Sector Penalties)**: 对于在 WindowPoSt 检查之前矿工因未声明故障扇区而遭到的惩罚。 一旦检测到故障，该扇区将在扇区罚款之后支付故障费用。
- **退出费用(Termination Fees)**: 是指当某个扇区被自愿或非自愿终止并从网络中删除时，矿工遭到的惩罚。

## 共识故障惩罚

犯共识错误时会产生这种惩罚。 此罚款适用于恶意行为违反网络共识功能的矿工。
