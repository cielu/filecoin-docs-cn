---
title: '挖矿架构'
description: 'Filecoin 允许任何人配置挖矿业务以参与全球分布式存储市场。.'
breadcrumb: '挖矿架构'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

这个部分提供了 Filecoin 存储挖矿设置的示例，希望它们可以帮助和指导其他矿工在购买和设置其挖矿基础设施时进行规划并做出正确的选择。 请注意，任何存储挖矿设置必须满足[最低硬件要求](hardware-requirements.md)。

::: callout
我们正在努力改善这一部分。 如果您想共享您的挖矿设置，请使用底部的链接来编辑页面！
:::

[[TOC]]

## 协议实验室示例架构

以下 [Lotus](lotus/README.md) 矿工安装程序是 Filecoin [存储挖矿指南](https://filecoin.io/blog/filecoin-guide-to-storage-mining/)博文的一部分。 可在[此处](https://filecoin.io/vintage/mining-hardware-config-testnet-v3.pdf)下载PDF：

| 硬件         | CPU 型号                     | GPU                        | 内存        | 磁盘                        | 程序                                                               | 备注                                                                                       |
| -------------------- | ----------------------------- | -------------------------- | ---------- | --------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Storage miner + 节点 | AMD Epyc 7402 (24 核)      | Nvidia Quadro RTX 6000     | 128-256GB  | 未指定                 | 1x lotus <br /><br />1x lotus-miner                                   | Miner 将密封工作委托给下面的 Worker                                                           |
| PC1 workers          | AMD Epyc 7F32 DP/UP (8 核) | -                          | 128-256GiB | 6 x 1-2TiB SSD 暂存盘 | 6x lotus-worker                                                       | 仅在 PreCommit1 阶段并行运行 6 个 [Lotus seal workers](lotus/seal-workers.md)                 |
| PC2, Commit workers  | AMD Epyc 7402 (24 核)      | 2 x Nvidia Quadro RTX 6000 | 256GiB     | 2-4TiB SSD 暂存盘  | 1x lotus-worker (PC2) <br /><br /> 1x lotus-worker (Commit)              | 一个 [worker](lotus/seal-workers.md) 致力于 PreCommit2，另一个致力于 Commit 阶段。              |
