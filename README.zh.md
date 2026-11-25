# dsh-session-rename

[English](README.md) | 中文

给 DeepSeek Harness（`dsh`）增加一个工具 `session_rename`，用来改**当前会话**的名字。这样你直接开口说一句，agent 就能改，而不用让你自己去翻菜单。

Web GUI 本来就能改会话名（会话菜单，或 `Ctrl+Alt+G` / `⌘⌥G`）。缺的是 agent 这一侧：没有任何工具能碰到同一个服务，所以改名一直得手动做。

## 安装

```sh
dsh plugin --profile web add git+https://github.com/Iamwangli/dsh-session-rename.git
```

从本地目录安装：

```sh
dsh plugin --profile web add /path/to/dsh-session-rename
```

装完重启 `web` profile；新会话即可用上这个工具。

## 用法

在对话里直接说——「把会话名改成 Q3 预算评审」——agent 就会调用：

```
session_rename(title: "…")
```

返回改后的标题和改前的标题。显式改名还会**钉住**标题：DSH 之后不再根据新消息自动生成标题，名字会一直保留到你下次改名。

## 说明

- 文本会被规范化（去掉控制字符、折叠空白），且必须包含可见字符。
- 只能改调用它的那个会话；改别人的会话是刻意不做的。
- 代价：提示词里多一条很小的工具定义。
- 纯宿主侧插件：没有客户端代码、没有依赖、没有配置项。

## 兼容性

在 DSH `0.2.2-rc.5` 上开发和测试。只用公开的 `ctx.tools.register` API 和 `sessionTitle` 服务，并声明了 `inject`，所以在缺少这些服务的 profile 里会自动不激活。

## 许可证

MIT —— 见 [LICENSE](LICENSE)。
