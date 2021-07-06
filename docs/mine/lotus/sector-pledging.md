---
title: 'Lotus Miner: 扇区质押'
description: "质押扇区是一种使用随机数据密封扇区以增加矿工在网络中的能力的技术。 本指南涵盖了将已质押扇区创建和升级到可用状态的动机、步骤。"
breadcrumb: '扇区质押'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 质押扇区的原因

正如我们已经[解释](../how-mining-works.md#算力和奖励)的那样，Filecoin 网络中矿工的电量与贡献给网络的实时存储（活动扇区）量成正比。 算力更大的矿工有更多机会被选中开采新的区块。

通过用随机数据密封扇区（质押），矿工可以向网络证明其已设置，并且有可能在有足够需求或决定这样做时为实际交易提供那么多存储空间。 同时，质押扇区的运作与常规扇区相似，导致矿工的算力提高。

考虑到以上因素，**质押扇区 [在主网 MainNet 上] 网络最有意义，因为它可以提供足够的算力来真正挖掘新区块**。 否则，它仅对测试有用。

::: tip
在矿工设置过程中对一个扇区进行质押，对于测试密封过程需要多长时间并确保在进行实际交易之前确保正确配置矿工的硬件非常有用。
:::

## 质押一个扇区

要质押一个扇区请运行：

```sh
lotus-miner sectors pledge
```

默认情况下，这将保证 546 天的空间。

::: warning
这会将数据写入 `$TMPDIR`，因此请确保有足够的可用空间。
:::

检查密封工作是否已开始：

```sh
lotus-miner sealing jobs
```

这将伴随 `<PATH_FOR_SEALING_STORAGE>/unsealed` 中的一个文件。

几分钟后，您可以使用以下方法检查密封进度：

```sh
lotus-miner sectors list
# and
lotus-miner sealing workers
```

完成新的密封后，`pSet: NO` 将变为 `pSet: YES`。

## 调整预期的密封时间设置

如果您质押了一个扇区，则可以使用操作的持续时间来更新 [`ExpectedSealDuration` 设置](miner-configuration.md#交易部分)。

要找出密封该扇区所需的时间，请运行：

```
lotus-miner sectors status --log 0
```

然后按照上面链接的配置参考中的说明进行操作。

## 升级质押扇区

最低质押期为 6 个月。 但是，只要替换扇区在质押扇区之后到期，就可以在此之前通过用包含交易的新扇区来替换质押扇区。 以下命令标记了要升级的扇区：

```sh
lotus-miner sectors mark-for-upgrade <sector number>
```

新的替代扇区封存后，该扇区应在 24 小时内变为非活动状态。 从那时起，可以将已质押的存储重新用于新扇区。
