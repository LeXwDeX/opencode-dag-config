# opencode-dag-config

opencode DAG 编排的参考模板配置仓库（唯一权威源）。

## 内容

- `*-full.yaml` — 高风险、高不确定性、跨模块或交付级任务的完整参考
- `*-lite.yaml` — 范围清晰、可逆、单模块任务的轻量参考

仓库只保留 7 个领域，每个领域恰好一份 `full` 和一份 `lite`：

| 领域 | 完整参考 | 轻量参考 |
|---|---|---|
| 产品文档与规划 | `product-planning-full.yaml` | `product-planning-lite.yaml` |
| 技术与架构设计 | `technical-design-full.yaml` | `technical-design-lite.yaml` |
| 项目开发交付 | `project-development-full.yaml` | `project-development-lite.yaml` |
| Bug 诊断修复 | `debug-repair-full.yaml` | `debug-repair-lite.yaml` |
| 代码与变更审核 | `code-review-full.yaml` | `code-review-lite.yaml` |
| 漏洞与供应链安全 | `security-audit-full.yaml` | `security-audit-lite.yaml` |
| 性能与资源审计 | `performance-audit-full.yaml` | `performance-audit-lite.yaml` |

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

## 启发式选择

Router 先判断领域，再按自治风险选择档位：

- 选择 `lite`：目标已确认、单一写入所有者、可逆、无迁移、无高风险边界。
- 选择 `full`：需求或设计仍有不确定性，或者涉及跨模块、并发、持久化、迁移、
  身份权限、上游可执行依赖、CI/发布、生产影响。
- 从 `lite` 升级为 `full`：实际证据超出原范围、需要第二写入所有者、公共接口
  发生变化、验证无法在现有 seam 表达，或发现高影响风险。

安全领域的上游供应链审查覆盖直接和传递依赖、锁文件、Git SHA/tag、注册表、
下载二进制与归档、vendored code、构建脚本、CI Action、维护权变化、SBOM、
签名/校验和、发布来源、依赖混淆和已知漏洞。扫描结果不是漏洞结论：必须绑定
精确版本、来源、可达使用、控制缺口和影响。所有安全路线只允许安全的本地验证，
禁止探测外部或生产系统，Secret 证据必须脱敏。

积木模板依赖主仓库引入 composable workflow blocks 的版本。合并或发布本仓库
中的 `blocks` 模板前，应先确认对应运行时版本已上线；旧版本仍可使用现有
`nodes` 模板。

方法论映射见 `METHODOLOGY.md`。固定点、独立审查轴、公开 seam、证据验证、
诊断反馈环和深模块语言来自已记录的 Matt Pocock 工程方法；`full/lite` 自治
档位、人机协作检查点和 agent-friendly 输入借鉴 Andrej Karpathy 对部分自治
软件的公开讨论。漏洞分类和安全准则由本产品维护。Matt 来源和 MIT 许可记录见
`THIRD_PARTY_NOTICES.md`；人名只用于来源追踪，不是工作流字段或产品功能名称。

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
