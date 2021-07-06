---
title: '硬件要求'
description: 'Filecoin 挖矿的最低硬件配置要求'
breadcrumb: '硬件要求'
---

# {{ $frontmatter.title }}

Filecoin 挖矿的硬件要求与 密封 一个扇区并为每个密封扇区（WindowPoSt）生成常规的 时空证明（Proof of Spacetime） 所需的计算资源有关。

这些操作的计算量很大，具体取决于矿机运行所在的[Filecoin network](https://network.filecoin.io) 使用的扇区大小-Nerpa，测试网(TestNet)，主网(MainNet)等。 作为参考，下面列出的要求对应于主网和某些测试网(Calibration，Nerpa)使用的**32GiB**扇区。

不同的 Filecoin Miner 程序实现可能会不同地分配密封任务，例如，使用除矿工（Miner）之外的其他工作者（Worker）。 以下是假设所有挖矿操作均在同一台机器上进行的_一般_要求。 每个操作所需的资源将在下面详细说明。 有关硬件类型和用法的具体示例，请参见[挖矿架构](mining-architectures.md)。

[[TOC]]

## 一般硬件要求

### 处理器 - CPU

矿机至少需要一个 **8核以上的CPU**.

我们强烈建议使用支持 Intel SHA扩展(可使用 lscpu 查看) ：AMD Zen 微体系结构及以上的、Intel Ice Lake 及以上的 CPU 型号。 缺少 SHA 扩展会导致速度显着下降。

### 内存 - RAM

至少是 **128 GiB 或更大的内存** 。 **128 GiB的内存** 需要一个**非常快速的NVMe SSD**存储媒介上用**256 GiB**的交换空间来补充.

### 显卡 - GPU

**建议**使用算力强大的 GPU，因为它可以显著加快 SNARK 计算。 请参阅以下有关可利用 GPU 优化的操作。

支持的 [GPU 的权威列表](https://github.com/filecoin-project/bellman#supported--tested-cards)在 [Bellman 仓库](https://github.com/filecoin-project/bellman#supported--tested-cards)中。

其他的 GPU 型号需要自己尝试（[Lotus 自定义GPU](lotus/gpus.md)）.

::: warning
在同一台计算机上混合使用 AMD 和 Nvidia GPU 会导致 OpenCL 问题，因此应避免使用。
:::

### 磁盘 - Disk

慢速磁盘会严重影响矿机操作的性能。 例如，在密封过程中 32GiB 会扩展到 〜480GiB。 Filecoin 网络参数超过 100GiB，在矿机启动期间需要读取和验证。 如上所述，需要使用快速交换驱动器或文件来解决 RAM 不足的问题。

出于这个原因，建议最少量的基于 1TiB NVMe 的磁盘空间用于缓存存储。 该磁盘应在密封过程中用于存储数据，缓存 Filecoin 参数并用作常规的临时存储位置。

用于最终存储“密封扇区（Sealed Sectors）”，像 Lotus chain 等的其他磁盘驱动器也同样需要

## 具体操作要求

如上所述，矿工执行不同性质的操作的时候，在使用 CPU 和 GPU 资源方面会有所不同。 下表展示了如何根据密封阶段或进行的证明计算来利用资源：

| 操作                           | 是否使用CPU                   | 是否使用GPU | 内存 (32Gib 扇区) | 备注                                                                                                                                                                                               |
| ----------------------------- | ---------------------------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 密封: 预交付（preCommit）阶段 1 | 是 (1 核或 1 Core-Complex)    | 否       | 128GiB                 | PoRep SDR编码。 不适合并行化。 核心使用量取决于 [`FIL_PROOFS_USE_MULTICORE_SDR`](https://github.com/filecoin-project/rust-fil-proofs/) 的值。另请参阅《[Lotus密封工作者指南](lotus/seal-workers.md).》。|
| 密封: 预交付（preCommit）阶段 2 | 是 (当没有 GPU 时，全部核)      | 是       | 128GiB                 | 使用波塞冬（Poseidon）哈希算法生成 Merkle 树。 仅有 CPU 时速度较慢。                                                                                                                                 |
| 密封: commit 阶段 1            | 是 (全部核)                   | 否       | -                      |                                                                                                                                                                                                |
| 密封: commit 阶段 2            | 是 (当没有 GPU 时，全部核)     | 是       | ~ 192GiB               | 仅有 CPU 时速度较慢。                                                                                                                                                                            |
| 拆封                          | 是 (1 核)                     | 否       | 128GiB                 |                                                                                                                                                                                               |
| 证明 WindowPoSt               | 是 (当没有 GPU 时，全部核       | 是       | -                      | WindowPoSts 必须在 30 分钟内提交。 当没有可用的GPU时，越多的CPU越快。                                                                                     |
| 证明 WinningPoSt              | 是                            | 否       | -                      | WinningPoSt 是一种强度较低的计算。 必须在25秒内完成。                                                                                                       |

注意，[Lotus](lotus/README.md) 实现允许配置特定的密封阶段并将其委派给 [Lotus workers](lotus/seal-workers.md)。

## 关于硬件要求

上述要求在可预见的未来不会增加，在硬件上的花费会为用户提供多年可靠的服务，而其支付的费用则是其自身的数倍。
