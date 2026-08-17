# opencode-dag-config

opencode DAG 编排的参考模板配置仓库（唯一权威源）。

## 内容

- `*-full.yaml` — 高风险、高不确定性、跨模块或交付级任务的完整参考
- `*-lite.yaml` — 范围清晰、可逆、单模块任务的轻量参考

仓库只保留 7 个领域，每个领域恰好一份 `full` 和一份 `lite`：

| 领域             | 完整参考                        | 轻量参考                        |
| --------------- | ------------------------------- | ------------------------------- |
| 产品文档与规划   | `product-planning-full.yaml`    | `product-planning-lite.yaml`    |
| 技术与架构设计   | `technical-design-full.yaml`    | `technical-design-lite.yaml`    |
| 项目开发交付     | `project-development-full.yaml` | `project-development-lite.yaml` |
| Bug 诊断修复     | `debug-repair-full.yaml`        | `debug-repair-lite.yaml`        |
| 代码与变更审核   | `code-review-full.yaml`         | `code-review-lite.yaml`         |
| 漏洞与供应链安全 | `security-audit-full.yaml`      | `security-audit-lite.yaml`      |
| 性能与资源审计   | `performance-audit-full.yaml`   | `performance-audit-lite.yaml`   |

## 跨域路线

跨域路线不占领域槽位（7 域 one full + one lite 的定策不变），是跨多个领域的
预拼装拓扑：

| 路线                  | 用途                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `ultra-flow-route.yaml` | 六积木（探索 → 设计 → 开发 → 验收 → 发布 → 汇总）+ 五道分级检查点（轻量方向判定 ×3、独立取证三件套 ×2）。检查点 verdict 为 `continue`/`replan`：continue 不扰流程，replan 唤醒父会话做 additive 重规划（findings 注入、回环 ≤3）。发布积木可由父对话在重定向时删除 |
| `release-route.yaml`    | 发布装配：机制探测 → 版本推导（latest tag + commit 类型）→ 人工门（默认 hold，父会话注入确认后才 publish）→ 发布执行 → 验证 |

## 积木式路线

新路线用 `config.objective + config.blocks` 组合以下原语：
`explore`、`plan`、`prototype`、`debug`、`coding`、`verify`、`review`、
`synthesize`。运行时会先把积木展开成普通 DAG 节点，再沿用现有校验、
持久化、调度和恢复机制。需要自定义绑定、条件、输出 Schema 或深度 diff
审查元数据时，现有 `nodes` 模板仍是低层逃生口。

每个积木都由运行时生命周期契约和本仓库的专项 `instruction` 共同定义，
不读取或依赖用户环境中的 Skill。`kind` 控制编译与门禁，`id` 表达具体产品
能力。模板不暴露由运行时生成的字段。

路线模板是可复用拓扑，不是固定脚本：父对话必须把目标、真实工作包、写集和
验收证据重定向到当前任务，并删掉已有证据覆盖的积木。产品选择或高影响决策
先在父对话输出推荐答案并完成一次合并确认；确认结果写进 `objective` 和
`instruction`，不得把用户问答放到子节点。

推荐调用顺序：先用 `workflow(action="list")` 选路线，再用
`workflow(action="read", spec_path="<route>")` 读取结构。父对话把重定向后的
完整 YAML 写入项目内 `.opencode/.dag-specs/<task>.yaml`，先以
`workflow(action="validate", spec_path="<file>")` 校验，再以
`workflow(action="start", spec_path="<file>")` 启动。模型调用不得猜测或内联
嵌套 `spec`；模板目标已完全匹配时才直接使用该模板的 `spec_path`。

## 路由权威

运行时的 Orchestration Router 是领域、`full`/`lite` 和跨领域组合的唯一选择
权威；本仓库不维护第二套选择提示词。`workflow(action="list")` 会把每个模板的
名称、标题和 `objective` 暴露给 Router，模板自身只负责可复用拓扑和专项证据
契约。维护模板时保持“一领域一份 `full`、一份 `lite`”，不要在 README、Skill
或模板节点中另建路由算法。`lite` 运行中若前提失效，结构化 gate 必须在后续
工作前返回非 `ACCEPT` 并唤醒父会话；workflow 完成后由父 Router 使用新节点
ID 做 additive `extend`，需要替换终态节点时启动新 workflow。

安全领域的上游供应链审查覆盖直接和传递依赖、锁文件、Git SHA/tag、注册表、
下载二进制与归档、vendored code、构建脚本、CI Action、维护权变化、SBOM、
签名/校验和、发布来源、依赖混淆和已知漏洞。扫描结果不是漏洞结论：必须绑定
精确版本、来源、可达使用、控制缺口和影响。所有安全路线只允许安全的本地验证，
禁止探测外部或生产系统，Secret 证据必须脱敏。

积木模板依赖主仓库引入 composable workflow blocks 的版本。合并或发布本仓库
中的 `blocks` 模板前，应先确认对应运行时版本已上线；旧版本仍可使用现有
`nodes` 模板。

方法论映射见 `METHODOLOGY.md`。固定点、独立审查轴、公开 seam、证据验证、
诊断反馈环、深模块语言、`full/lite` 自治档位、人机协作检查点和 agent-friendly
输入等工程约束已编译为本产品自有的路线契约。漏洞分类和安全准则由本产品维护。

## 安装（本地使用）

把本仓库 clone 到 opencode 配置目录，作为**全局参考模板库**：

```sh
git clone git@github.com:LeXwDeX/opencode-dag-config.git ~/.config/opencode/workflows
```

clone 后运行 `workflow(action: "list")` 即可看到全部可用模板；`/dag-flow` 等命令会指引 agent 阅读这些参考模板。`/dag-init` / `/dag-auto` 是跨域路线的首要消费方：`/dag-init` 在平台握手时校验模板可用性，`/dag-auto` 的超流直接使用 `ultra-flow-route` / `release-route`。

## 更新

模板更新有三条通道，内容同源：

1. **随发布自动更新（零动作）**：每次主仓库发布时，本仓库最新快照会编译进二进制内置模板（见"注意"节）。只装单体的用户由此始终持有发布时点的模板。
2. **opencode 内更新**：运行 `/dag-template-update` 命令（下载 zip 归档、预演对比、备份后合并，无需 git 环境）。
3. **手动拉取**（适用于 clone 过本仓库的用户）：

```sh
git -C ~/.config/opencode/workflows pull
```

作用域优先级为 项目级 > 全局 > 内置：全局更新后，同名项目级覆盖仍生效。

## 作用域

| 作用域                 | 位置                            | 优先级                   |
| ---------------------- | ------------------------------- | ------------------------ |
| 项目级                 | `<项目>/.opencode/workflows/`   | 最高（覆盖同名）         |
| 全局（本仓库）         | `~/.config/opencode/workflows/` | 兜底                     |
| 内置（release 二进制） | 编译进二进制                    | 最后兜底（封闭网络可用） |

## 注意

- `dag.jsonc`、`dcp.jsonc` 等 opencode 自身配置**不**在本仓库，留在配置目录本地管理。
- 每次发布主仓库时，`release-fork` workflow 会把本仓库最新模板打包为 `dag-templates.tar.gz` release 资产，并嵌入二进制内置模板。
- 主仓库 `.opencode/workflows/` 不再维护模板文件，本仓库是唯一权威源。
- **`runtime-compat.json` 钉住配套主仓库运行时 SHA**：模板用到的能力必须先在运行时落地并发版，再把此处 bump 到对应合并 SHA；CI 模板校验会依据该契约把关。
- **模板目录受 CI 严格校验**（`script/validate-route-catalog.ts`）：必须恰好为 7 域 × full/lite + 已声明的跨域路线。新增、删除或改名模板时必须同步修改校验脚本与测试 fixture，否则 CI 拒绝合并。
