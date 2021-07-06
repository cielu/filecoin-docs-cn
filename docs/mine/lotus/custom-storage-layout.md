---
title: 'Lotus Miner: 自定义存储布局'
description: '本指南描述了如何根据需求和可用硬件为 Lotus Miner 指定定制存储位置。'
breadcrumb: '自定义存储布局'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

如果在[矿工程序初始化](miner-setup.md#矿工程序初始化)期间使用了 `--no-local-storage` 标志，则应指定用于密封（建议使用快速 SSD）和长期存储的磁盘位置。

Lotus Miner 会在 `~/.lotusminer/storage.json`（或 `$LOTUS_MINER_PATH/storage.json`）中跟踪已定义的存储位置，并默认使用 `~/.lotusminer` 路径。

初始化存储位置后，将创建一个 `<path-to-storage>/sectorstorage.json` 文件，其中包含分配给该位置的 UUID，以及该文件是否可用于密封或存储。

[[TOC]]

## 自定义密封位置

在 _密封_ 扇区时使用 密封 存储位置。 它应该是一种真正快速的存储介质，以使磁盘不会成为延迟密封过程的性能瓶颈。 可以通过以下方式指定：

```sh
lotus-miner storage attach --init --seal <PATH_FOR_SEALING_STORAGE>
```

## 自定义存储位置

_密封_ 过程完成，将密封的扇区移动到 _存储_ 位置，可以指定以下位置:

```sh
lotus-miner storage attach --init --store <PATH_FOR_LONG_TERM_STORAGE>
```

该位置可以由大容量的磁盘组成，尽管速度较慢。

## 列出存储位置

```sh
lotus-miner storage list
```

## 更新位置

要将数据从一个位置移动到另一位置，请遵循[矿工生命周期指南](miner-lifecycle.md#更改存储位置)中的说明。

要完全删除一个位置，请手动编辑 `storage.json` 并重新启动您的矿工程序。
