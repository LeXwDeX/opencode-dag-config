# opencode-dag-config

opencode DAG 编排的参考模板配置仓库。

## 内容

- `workflows/*.yaml` — DAG 参考拓扑模板（与 [OpenCode-GraphAgent](https://github.com/LeXwDeX/OpenCode-GraphAgent) 的 `.opencode/workflows/` 保持同步）

## 安装（本地使用）

把本仓库 clone 到 opencode 配置目录，作为**全局参考模板库**：

```sh
git clone git@github.com:LeXwDeX/opencode-dag-config.git ~/.config/opencode/workflows
```

clone 后运行 `workflow(action: "list")` 即可看到全部可用模板；`/dag-flow` 等命令会指引 agent 阅读这些参考模板。

## 更新

```sh
git -C ~/.config/opencode/workflows pull
```

## 作用域

| 作用域 | 位置 | 优先级 |
|--------|------|--------|
| 全局（本仓库） | `~/.config/opencode/workflows/` | 兜底 |
| 项目级 | `<项目>/.opencode/workflows/` | 覆盖全局同名模板 |

## 注意

- `dag.jsonc`、`dcp.jsonc` 等 opencode 自身配置**不**在本仓库，留在配置目录本地管理。
- 发布主仓库时，`release-fork` workflow 会把本仓库最新模板同步进主仓库 `.opencode/workflows/`。
