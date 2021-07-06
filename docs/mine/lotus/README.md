---
title: Lotus Miner 矿工程序
description: Lotus Miner 矿工程序是协议实验室编写的 Filecoin Miner 实现.
---

# Lotus Miner 矿工程序

{{ $frontmatter.description }}.

本章包含 Lotus 设置与成功运行的挖矿操作指南，**高级用户**应熟悉 [Filecoin工作原理](../../about-filecoin/how-filecoin-works.md)、[挖矿工作原理](../how-mining-works.md)以及[Lotus节点](../../store/lotus/README.md)的操作。

::: warning
在主网(mainnet)使用Lotus进行挖矿有着十分严格的**[硬件要求](../hardware-requirements.md)**。如果您的计算机不符合最低要求，请不要尝试进行安装。
:::

## 开始使用 Lotus Miner

以下指南是启动 Lotus Miner 矿工程序的基本知识：

- [安装指南](../../get-started/lotus/installation.md)中介绍了矿工程序的安装。 安装完毕后，Lotus 节点，Lotus Miner 和 Lotus Worker 三个应用程序将都会安装。

- [矿工的安装](miner-setup.md) 涵盖了配置矿工程序以实现最佳性能并避免常见的陷阱的所有详细信息。

- [配置参考](miner-configuration.md)说明了不同的矿工程序配置选项的含义。

- [密封工作者程序指南(Seal Worker)](seal-workers.md)介绍了如何与 Lotus Miner 矿工程序在同一台服务器或不在同一台服务器运行其他密封工作者程序(Seal Worker)。

但是，我们建议在继续进行 Lotus Miner 矿工程序部署之前，仔细阅读每个现有部分并学习尽可能多的背景知识。
