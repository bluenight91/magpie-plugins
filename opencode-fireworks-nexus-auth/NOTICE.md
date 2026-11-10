# NOTICE：来源与合规说明

本包 `opencode-fireworks-nexus-auth` 是独立编写的 Magpie / OpenCode v1 provider 插件，
与 Fireworks、Nexus、Magpie 或 OpenCode 官方团队无隶属关系，也不表示这些团队为本包背书。

## 1. 包与标识

| 项目 | 取值 |
|---|---|
| npm 包名 | `opencode-fireworks-nexus-auth` |
| 当前版本 | `0.1.0` |
| 仓库 | `https://github.com/bluenight91/magpie-plugins` |
| 包目录 | `opencode-fireworks-nexus-auth` |
| Magpie provider ID | `fireworks-nexus` |
| 模型 ID | `fireworks-nexus/auto` |
| 安装方式 | 通过 Git 克隆后使用本地目录添加 |

独立 provider ID 用于避免与 Magpie 内置 `nexus` 冲突。包名目前不表示已发布到 npm。

## 2. 静态元数据来源

Auto 的上下文、输出、模态和工具调用声明参考 Nexus CLI 的
`packages/setup-cli/lib/fireworks/model-specs.mjs`：

- `auto.capabilities.contextWindow = 1_048_575`
- `auto.capabilities.maxOutputTokens = 131_072`
- `vision = true`
- `toolCalling = true`

来源：<https://github.com/fw-ai-external/nexus-cli/blob/main/packages/setup-cli/lib/fireworks/model-specs.mjs>

五个推理档位参考同仓库的 `packages/setup-cli/lib/fireworks/reasoning.mjs` 中 Auto 的
`AUTO_LEVELS`：`low`、`medium`、`high`、`xhigh`、`max`。该表不为 Auto 提供 `none`，
也不要求客户端设置默认档位。

来源：<https://github.com/fw-ai-external/nexus-cli/blob/main/packages/setup-cli/lib/fireworks/reasoning.mjs>

这些引用用于保持 Auto 的声明与 Nexus CLI 一致。本包未复制 Nexus CLI 的目录缓存、
harness 配置修改、密钥管理、路由选择或遥测实现。

## 3. 接口与行为参考

- Nexus Auto 文档：<https://docs.fireworks.ai/nexus/auto>
- Nexus APIs and SDKs：<https://docs.fireworks.ai/nexus/apis-and-sdks>
- Nexus Metrics / status line：<https://docs.fireworks.ai/nexus/metrics>
- Fireworks Chat Completions：<https://docs.fireworks.ai/api-reference/post-chatcompletions>
- Fireworks Usage & Cost Breakdown：<https://docs.fireworks.ai/accounts/exporting-usage-and-costs>
- Fireworks usage costs API：<https://docs.fireworks.ai/api-reference/query-usage-costs>
- Magpie 插件接口：<https://usemagpie.ai/docs/zh/plugins#overview>
- OpenCode 插件接口：<https://opencode.ai/docs/plugins/>

`reasoningEffort` 是 Magpie / OpenCode variant 对 AI SDK 的配置形式；Fireworks Chat
Completions 接收对应的 `reasoning_effort` 字段。插件不自行序列化或修改请求体。

用量窗口来自 `usageCosts:query` 的美元 subtotal，并按 Magpie 的 `aside` 窗口显示。
它是 Fireworks 聚合成本，不是 Nexus Pro 套餐限额；官方文档说明该数据可能缓存和滞后。
Nexus CLI 的 Claude Code status line 使用本地 transcript 和模型单价估算，本包未复制
该实现。

## 4. 图标与商标

插件通过以下地址引用 Nexus 官方站点提供的 Fireworks 图标：

<https://nexus.fireworks.ai/images/fireworks-logos/icon.svg>

图标仅用于标识所连接的服务。Fireworks、Nexus 及其标志的权利仍归各自权利人所有；
本包的 MIT 许可证不授予这些图标、商标或相关服务的权利。远程图标不由本包再分发，
Magpie 界面加载图标时可能访问该官方地址。

## 5. 密钥与隐私边界

- 插件不内置任何 API key，也不从 Magpie 内置 Fireworks/Nexus provider 自动读取 key。
- 用户通过 `magpie plugin login fireworks-nexus` 输入的 key 由 Magpie 的插件登录存储管理。
- Anthropic / OpenAI 凭据不在本插件中收集；需要闭源模型路由时使用 Nexus 账号的 Provider Keys。
- 本插件没有自定义日志或遥测。对话及工具内容仍按用户选择经 Magpie 发往 Fireworks，
  其处理同时受 Magpie 与 Fireworks 的隐私政策约束。

## 6. 许可证适用范围

[LICENSE](LICENSE) 中的 MIT 许可证适用于本包原创的插件代码与文档，不适用于 Fireworks
服务、Nexus CLI、Magpie、OpenCode 或上述第三方图标。参考项目的许可证仍分别适用于其自身内容。
