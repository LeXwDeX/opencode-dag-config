# Workflow methodology

本仓库把外部方法论编译为产品自有的 DAG 路线；运行时不依赖外部 Skill，也不把
作者姓名作为字段、积木或路由条件。

## Matt Pocock engineering methods

固定来源：[`mattpocock/skills@84fdeffd`](https://github.com/mattpocock/skills/tree/84fdeffd12f2ee307994d1eb6feb48173b6e0502)，MIT 许可见
`third_party/mattpocock-skills/LICENSE`。

采用的工程约束：

- Code review：先固定 merge-base 和完整 diff，Standards 与 Spec/Intent 独立取证，
  最后汇总但不让一个轴掩盖另一个轴。
- TDD：通过公开 seam 验证行为，使用一条 Red → Green 垂直切片，避免测试私有实现。
- Diagnosing bugs：先建立快速、确定、可运行的反馈环，再提出可证伪假设并修复根因。
- Codebase design / domain modeling：用领域语言明确不变量，把复杂行为放进小而深的
  owning interface，减少调用方知识和并行 authority。
- Prototype / research / grilling：只为能改变决策的不确定性做可逆实验，区分事实、
  推断、假设和用户所有的决策。

## Andrej Karpathy: partial autonomy

近期参考：Andrej Karpathy 在 2025-06-17 的
[`Software Is Changing (Again)`](https://www.youtube.com/watch?v=LCEmiRjPEtQ)
演讲。这里只采用公开思想的产品化转述，不复制其文本或代码。

采用的产品约束：

- 自治不是开关，而是按任务风险调节：`lite` 用于范围清晰、可逆任务；`full` 用于
  不确定、跨模块或高影响任务。
- 人仍负责目标、高影响选择和最终交付；agent 负责可界定的取证、实现和验证。
- 自然语言程序和模型输出具有概率性；工作流必须用文件、Schema、固定 fingerprint、
  可运行工具和确定性 gate 校验结果。
- 为 agent 提供原生基础设施：准确文档、机器可读输入、窄工具接口、明确错误、可观察
  状态和安全的反馈环，而不是依赖模型猜字段或网页操作。
- 快速原型允许提高自治，但生产交付必须恢复代码理解、测试、审核、安全和发布门禁。

## Product-owned additions

漏洞分类、威胁建模、Secret 响应、上游供应链审计、性能测量和发布门禁由本产品维护。
安全 finding 必须绑定可达路径或精确上游版本、控制缺口、触发条件、影响和当前
fingerprint；scanner alert 单独不能成为漏洞结论。
