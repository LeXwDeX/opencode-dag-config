# opencode-dag-config

opencode DAG 编排的参考模板配置仓库（唯一权威源）。

## 内容

- `*.yaml` — DAG 参考拓扑模板（扁平布局，仓库根目录直接放模板文件）

## 安装（本地使用）

把本仓库 clone 到 opencode 配置目录，作为**全局参考模板库**：

```sh
git clone git@github.com:LeXwDeX/opencode-dag-config.git ~/.config/opencode/workflows
```

clone 后运行 `workflow(action: "list")` 即可看到全部可用模板；`/dag-flow` 等命令会指引 agent 阅读这些参考模板。

## 更新

在 opencode 中运行 `/dag-template-update` 命令（下载 zip 归档、预演对比、备份后合并，无需 git 环境）；或手动拉取：

```sh
git -C ~/.config/opencode/workflows pull
```

## 作用域

| 作用域 | 位置 | 优先级 |
|--------|------|--------|
| 项目级 | `<项目>/.opencode/workflows/` | 最高（覆盖同名） |
| 全局（本仓库） | `~/.config/opencode/workflows/` | 兜底 |
| 内置（release 二进制） | 编译进二进制 | 最后兜底（封闭网络可用） |

## 注意

- `dag.jsonc`、`dcp.jsonc` 等 opencode 自身配置**不**在本仓库，留在配置目录本地管理。
- 每次发布主仓库时，`release-fork` workflow 会把本仓库最新模板打包为 `dag-templates.tar.gz` release 资产，并嵌入二进制内置模板。
- 主仓库 `.opencode/workflows/` 不再维护模板文件，本仓库是唯一权威源。
