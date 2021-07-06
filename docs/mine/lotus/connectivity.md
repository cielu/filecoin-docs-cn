---
title: 'Lotus Miner: 连通性'
description: '本指南展示了提高矿工连通性的技巧和技巧。'
breadcrumb: '连通性'
---

# {{ $frontmatter.title }}

Filecoin 矿工，像所有点对点协议的参与者一样，需要一个稳定和高质量的对等点池来进行通信，以便执行其各种功能。{{$frontmatter.description}} [连接部分](miner-setup.md#连接到矿工程序)补充了设置说明和[密封矿工](seal-workers.md)指南。

[[TOC]]

## 查找您的公共 IP 地址

通常，您可以使用诸如 ifconfig.me 之类的服务找到您的公共 IP 地址。 从矿机上运行以下命令可以显示其他人看到的 IP 地址：

```sh
curl ifconfig.me
```

::: warning
在某些设置中，返回的 IP 地址将不是正确的设置，在这些设置中，传出的流量通过传入的流量通过不同的出口点（即 NAT 网关）进行路由，从而呈现出不同的 IP 地址。 所以您应该熟悉自己的网络设置！
:::

## 测试与 IP 地址/端口的连接

这里有多种测试方法：

- 要检查可公开访问的 IP 地址，您可以使用像[这个](https://www.yougetsignal.com/tools/open-ports/) 或者[这个](https://ping.eu/port-chk) 等许多在线检查器之一。  
- 对于 LAN（也对于公共 IP 地址），请使用另一台计算机上的 netcat 工具：`ncat -w 5 <PUBLIC_IP> <PORT>` 如果返回的返回码为非零或错误，则表示不能稳定连接下来。
- 也可以使用 Telnet: `telnet <PUBLIC_IP> <PORT>`.
- 你可以使用你最喜欢的搜索引擎来寻找更多与你的设置和环境相关的方法。

## Lotus Miner 矿工程序可达性

当 Lotus Miner 矿工程序正在运行且可达时，应使用以下命令进行报告：

```sh
$ lotus-miner net reachability
AutoNAT status:  Public
Public address:  /ip4/<IP>/tcp/<port>
```

验证公共地址是否符合您的期望。 `AutoNAT status: Private` 意味着在任何已声明的地址上都无法访问 Lotus Miner 矿工程序。

## 检查对等点数量

为了确保存储和检索交易的顺利进行，建议在每次启动后检查矿工节点连接到多少个对等方：

```sh
lotus-miner net peers
```

启动矿工程序后，对等方计数应立即增加。 您还可以使用以下方式手动连接到对等方：

```sh
lotus-miner net connect <address1> <address2>...
```

对于[主网](https://github.com/filecoin-project/lotus/blob/master/build/bootstrap/mainnet.pi) 引导对等体的列表是唯一的，因此请确保使用与您想要的网络相对应的列表。其他引导列表位于[此处](https://github.com/filecoin-project/lotus/blob/master/build/bootstrap/) 。

## 端口转发

如果你正在运行一个 NAT叉 环境(即通常情况下在家庭设置中,有一个路由器控制访问来自互联网的),有时需要从外部端口到矿工的端口进行端口转发。

:::tip
根据品牌型号的不同，操作也会有很大的不同。请用你最喜欢的搜索引擎搜索如何用你的路由器进行端口转发
:::

## 获取公共 IP 地址

如果您不控制设备后面的 NAT/防火墙（例如在企业网络和其他防火墙内），则可以使用另一种解决方案。 您可以设置**中继端点**，以便您的矿工程序可以通过外部可公开访问的中继端点与其 Internet 通信。

这里有多种方法可以实现

- 使用 VPN 服务。 我们建议使用由 Wireguard 支持的 IPv6 VPN 服务，该服务将为您提供可公开路由的 IPv6 地址。
- 使用[SSH 反向隧道](https://www.howtogeek.com/428413/what-is-reverse-ssh-tunneling-and-how-to-use-it) 在具有公共 IP 的计算机和矿工程序之间设置代理。

## 常见错误

[故障排除页面](miner-troubleshooting.md#common-connectivity-errors)上列出了常见的连接错误。
