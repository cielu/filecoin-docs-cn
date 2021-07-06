---
title: 'Lotus Miner: 升级' description: '本指南介绍了运行矿工程序时如何安全地升级 Lotus。' breadcrumb: 'Miner 升级'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

有两种类型的升级。 直接升级 _In-Place_ 默认程序，仅更新软件。重置升级 _Reset_ 将删除所有数据并从头开始：

[[TOC]]

## 直接升级

1. 如[此处](miner-lifecycle.md)所述，安全的关闭 Lotus Miner 矿工程序。
2. 关闭所有密封工作者（Seal Worker）
3. 关闭你的 Lotus 节点 (`lotus daemon stop`或 `systemctl stop lotus-daemon`)
4. 拉取新版本并重新构建。 更多信息请阅读[Lotus 安装指南](../../get-started/lotus/installation.md):

```sh
export RUSTFLAGS="-C target-cpu=native -g"
export FFI_BUILD_FROM_SOURCE=1
git pull
git checkout <tag_or_branch>
git submodule update
make clean
make all
make install
```

1. 启动 Lotus 守护程序并等待同步：

```sh
lotus daemon
# 或者当使用 systemctl 服务时：
systemctl start lotus-daemon
```

```sh
lotus sync wait
```

2. 启动矿工程序（Miner）和工作者程序（Worker）

```sh
lotus-miner run
```

```sh
lotus-worker run
```

## 重制升级

::: warning
仅当万不得已时才使用此升级过程，或者在升级链并要求采取此类措施时使用。
:::

这类似于从头开始重新安装所有内容，因此您可以参考常规[安装](../../get-started/lotus/installation.md)和[矿工程序设置](miner-setup.md)指南进行操作。 在执行此操作之前，请考虑：

- [备份您的 Lotus 钱包](../../get-started/lotus/send-and-receive-fil/#导出和导入地址)
- 您可能还想备份 Lotus 节点和矿工程序（Miner）的配置。

准备就绪后，停止所有操作并删除数据文件夹（或重命名）：

```sh
# 如果您使用的是默认数据文件夹
rm -rf ~/.lotus
rm -rf ~/.lotusminer
rm -rf ~/.lotusworker
```

之后，Lotus 应用程序将从头开始。
