# opencode-dag-config

opencode DAG 编排的参考模板配置仓库（唯一权威源）。

## 内容

- `*.yaml` — DAG 参考拓扑模板（扁平布局，仓库根目录直接放模板文件）
- `*-route.yaml` — 可重定向的积木式路线；父对话按任务裁剪或扩展后启动

## 积木式路线

新路线用 `config.objective + config.blocks` 组合以下原语：
`explore`、`plan`、`prototype`、`debug`、`coding`、`verify`、`review`、
`synthesize`。运行时会先把积木展开成普通 DAG 节点，再沿用现有校验、
持久化、调度和恢复机制。需要自定义绑定、条件、输出 Schema 或深度 diff
审查元数据时，现有 `nodes` 模板仍是低层逃生口。

路线模板是可复用拓扑，不是固定脚本：父对话必须把目标、真实工作包、写集和
验收证据重定向到当前任务，并删掉已有证据覆盖的积木。产品选择或高影响决策
先在父对话输出推荐答案并完成一次合并确认；确认结果写进 `objective` 和
`instruction`，不得把用户问答放到子节点。

积木模板依赖主仓库引入 composable workflow blocks 的版本。合并或发布本仓库
中的 `blocks` 模板前，应先确认对应运行时版本已上线；旧版本仍可使用现有
`nodes` 模板。

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
