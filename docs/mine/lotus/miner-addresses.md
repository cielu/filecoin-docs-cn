---
title: 'Lotus Miner: 矿工地址'
description: '可以为矿工配置所有者（Owner）地址，工作者（Worker）地址和其他控制（Control）地址。 这些允许细化如何管理从矿工发送和接收的资金，并为 挖矿操作提供额外的安全性。'
breadcrumb: '矿工地址'
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

在矿工初始化期间，将在链上创建一个 矿工参与者（Miner Actor），此参与者（Actor）为矿工提供其 ID `t0...`。该矿工参与者（Miner Actor）负责收集发送给该矿工的所有付款。 例如，当发送用于兑现不同类型交易的付款时，该付款将发给矿工参与者（Miner Actor），而不是矿工本身。

Lotus Miner 守护程序执行网络所需的操作，并且可以使用不同的 Lotus 节点钱包来支付费用或与矿工参与者（Miner Actor）进行交互。 查看 [Lotus 入门指南](../../get-started/lotus/send-and-receive-fil.md)，以获取有关如何管理 Lotus 钱包的更多信息。

矿工程序当前使用的配置地址可以用以下命令列出：

```sh
lotus-miner actor control list
```

与矿工相关的不同类型地址如下所述：

## 所有者(Owner)地址

所有者 (Owner) 地址对应于在[矿工程序初始化](miner-setup.md)期间提供的 Lotus 节点地址。 只有在以下情况下才需要 所有者地址 (Owner Address)

- 更改 矿工参与者（Miner Actor）中的所有者（Owner）或工作者（ Worker）地址。
- 从 矿工参与者（Miner Actor）提取余额。
- 提交 WindowPoSts，**除非定义了控制（Control）地址并具有足够的余额**（续下页）。  

被选为矿工所有者地址（Owner Address）的地址旨在离线保存在 冷存储（Cold Storage）中，或由[硬件钱包](../../get-started/lotus/ledger)备份。 在生产环境中，我们强烈建议使用单独的所有者（Owner）和工作者（Worker）地址。

可以使用以下命令更新所有者（Owner）地址：

```sh
lotus-miner actor set-owner --really-do-it <address>
```

旧地址和新地址必须都对 Lotus 节点可用。 您可以[创建一个新地址或导入现有地址](../../get-started/lotus/send-and-receive-fil.md)。

## 工作者(Worker)地址

工作者地址（Worker Address）用于发送和支付矿工执行的日常操作的费用：

- 在链上初始化矿工程序。
- 更改矿工对等 PeerID 或多地址（MultiAddresses）。
- 与市场和支付渠道参与者互动。
- 签名新的区块。
- 提交证明，宣告故障。 如果满足以下条件，则使用 工作者地址（Worker Address） 提交 WindowPoSts：
  - 控制地址（Control Address）未定义或没有足够的余额。
  - 所有者地址（Owner Address）没有足够的余额。

与所有者地址（Owner Address）不同，设置为矿工工作者地址（Worker Address）的地址应该是 Lotus 本地钱包的一部分，并且可由矿工程序访问。 Lotus Miner 矿工程序将使用与其连接的 Lotus 节点触发所有必要的事务。 工作者地址（Worker Address） 必须有足够的资金来支付矿工程序的日常操作，包括初始化。

## 控制地址(Control Address)

控制地址（Control Address）用于提交 _WindowPoSts_ 证明到链上。 _WindowPoSt_ 是一种通过 Filecoin 网络验证存储的机制，该机制要求矿工每 24 小时为所有扇区提交一次证明。 这些证明将作为消息提交发送区块链，因此需要支付相应的费用。

许多与挖矿相关的操作都需要将消息发送到链中，但并非所有这些都像 _WindowPoSts_ 一样具有高价值。 通过使用控制地址（Control Address），您可以停止第一个事务暂挂一行事务。 此阻塞问题称为[线头阻塞](https://en.wikipedia.org/wiki/Head-of-line_blocking)

可以创建和配置多个控制地址 _Control Address_ 。 将使用第一个具有足够资金的 控制地址 _Control Address_ 来提交 WindowPoSt。 如果没有足够的 控制地址 _Control Address_ ，则将使用所有者地址 _Owner Address_ 。 如果所有者地址 _Owner Address_ 资金也不足或不可用，则将使用工作者地址 _Worker Address_ 来提交 WindowPoSt。

否则，Lotus 将故障转移到 所有者（Owner） 并最终转移到 工作者（Worker） 地址。

设置一个控制地址（Control Address）：

1. 创建一个新地址，并向其发送一些燃气费（Gas）资金：

   ```sh
   lotus wallet new bls
   > f3defg...

   lotus send --from <address> f3defg... 100
   ```

2. 通知矿工程序这个新地址：

   ```sh
   lotus-miner actor control set --really-do-it f3defg...

   > Add f3defg...
   > Message CID: bafy2...
   ```

3. 等待消息降落在链上：

   ```sh
   lotus state wait-msg bafy2...

   > ...
   > Exit Code: 0
   > ...
   ```

4. 检查矿工控制地址（Control Address）列表，以确保正确添加了地址：

   ```sh
   lotus-miner actor control list

   > name       ID      key        use    balance
   > owner      t01111  f3abcd...  other  300 FIL
   > worker     t01111  f3abcd...  other  300 FIL
   > control-0  t02222  f3defg...  post   100 FIL
   ```

重复此过程以添加其他额外的地址。

### 使用控制地址（Control Address）进行提交

通过设置控制地址（Control Address）以执行预提交（PreCommit）和提交（Commit），来清理工作者地址（Worker Address）所需的任务。 这样，仅从工作者地址（Worker Address）发送市场消息。 如果基本费用（BaseFee）很高，那么您仍然可以将扇区放在链上，而这些消息不会受到发布交易之类的阻碍。

从 2020 年 12 月 09 日开始在 [`filecoin-project/lotus`的`master`分支](https://github.com/filecoin-project/lotus/) 中启用此功能，但尚未在标记的发行版（Release）中启用。 您需要从GitHub上使用`master`分支构建Lotus才能使用此功能。

1. 创建两个控制地址（Control Address）。控制地址（Control Address）可以是任何地址 类型：`secp256k1` 或者 `bls`:

   ```bash
   lotus wallet new bls

   > f3rht...

   lotus wallet new bls

   > f3sxs...

   lotus wallet list

   > Address   Balance  Nonce  Default
   > f3rht...  0 FIL    0      X
   > f3sxs...  0 FIL    0
   ```

2. 在这两个地址中添加一些资金。
3. 等待约 5 分钟，以便为地址分配 ID。
4. 获取这些地址的 ID ：

   ```bash
   lotus wallet list -i

    > Address   ID        Balance                   Nonce  Default
    > f3rht...  f0100933  0.59466768102284489 FIL   1      X
    > f3sxs...  f0100939  0.4 FIL                   0
   ```

5. 添加控制地址(Control Address)：

   ```bash
   lotus-miner actor control set --really-do-it=true f0100933 f0100939

    > Add f3rht...
    > Add f3sxs...
    > Message CID: bafy2bzacecfryzmwe5ghsazmfzporuybm32yw5q6q75neyopifps3c3gll6aq

    lotus actor control list

    > name       ID      key        use    balance
    > owner      t01...  f3abcd...  other  15 FIL
    > worker     t01...  f3abcd...  other  10 FIL
    > control-0  t02...  f3defg...  post   100 FIL
    > control-1  t02...  f3defg...  post   100 FIL
   ```

6. 将新创建的地址添加到 `[Addresses]` 部分下的矿工配置中：

   ```yaml
   [Addresses]
       PreCommitControl = ["f3rht..."]
       CommitControl = ["f3sxs..."]
   ```

7. 重启 `lotus-miner`.

## 管理余额

获取与矿工钱包相关的余额信息可以使用 `info` 命令:

```bash
lotus-miner info

> Miner: t01000
> Sector Size: 2 KiB
> Byte Power:   100 KiB / 100 KiB (100.0000%)
> Actual Power: 1e+03 Ki / 1e+03 Ki (100.0000%)
>   Committed: 100 KiB
>   Proving: 100 KiB
> Below minimum power threshold, no blocks will be won
> Deals: 0, 0 B
>   Active: 0, 0 B (Verified: 0, 0 B)
>
> Miner Balance: 10582.321501530685596531 FIL
>   PreCommit:   0.000000286878768791 FIL
>   Pledge:      0.00002980232192 FIL
>   Locked:      10582.321420164834231291 FIL
>   Available:   0.000051276650676449 FIL
> Worker Balance: 49999999.999834359275302423 FIL
> Market (Escrow):  0 FIL
> Market (Locked):  0 FIL
```

在这个例子中，矿工 ID 是 `t01000`，它的总余额是 `10582.321501530685596531` FIL，和可用余额 `0.000051276650676449` FIL 可以用作抵押品或支付质押。工作者（Worker）的余额是 `49999999.999834359275302423` FIL。

## 从矿工参与者(Miner Actor)提款

通过调用 `actor withdraw` 命令，将资金从矿工参与者地址(Miner Actor Address)转移到所有者地(Owner Address)：

```bash
lotus-miner actor withdraw <amount>
```

::: tip
所有者地址(Owner Address)将需要在 Lotus 节点中可用，并有足够的资金来支付此交易的燃气费用(Gas Fee)。 为了成功完成操作，需要临时导入冷地址(Cold Address)。
:::
