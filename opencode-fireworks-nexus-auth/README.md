# Fireworks Nexus Auto

把 Fireworks Nexus Auto 接成 Magpie 里的一个模型 provider。插件只提供
`fireworks-nexus/auto`，通过 Fireworks 的 OpenAI Chat Completions 兼容接口发送请求，
并补齐 Auto 所需的上下文、输出上限和推理档位元数据。

**[English → README.en.md](README.en.md)** ｜ 来源、版权与合规说明见 [NOTICE.md](NOTICE.md)

## 这是什么

Nexus Auto 会在每轮请求中选择实际服务的模型。模型目录接口不会为 `auto` 返回固定的
上下文或推理能力，因此本插件采用 Nexus CLI 为 Auto 声明的官方静态规格，而不是根据
某一轮实际路由到的模型推断参数。

- provider ID：`fireworks-nexus`
- 模型 ID：`fireworks-nexus/auto`
- 上游：`https://api.fireworks.ai/inference/v1/chat/completions`
- AI SDK：`@ai-sdk/openai-compatible`
- 无 npm 运行时依赖，不修改 Nexus 的请求或响应

本插件是一个独立 provider，不会覆盖、停用或迁移 Magpie 内置的 `nexus`，也不会切换
任何 Agent 的当前模型。

## 功能

- **1M 上下文**：声明 1,048,575 tokens 的上下文窗口，不再回退到 128K。
- **输出上限**：声明最多 131,072 tokens 输出。
- **思考强度**：提供 `low`、`medium`、`high`、`xhigh`、`max` 五个档位，不强制默认档位。
- **多模态与工具**：声明文本、图片输入和工具调用能力。
- **动态路由保持透明**：始终把 `auto` 作为上游模型 ID，不重命名为具体模型，不伪造固定价格。
- **自行管理 API key**：可以填写任意有权使用 Nexus Auto 的标准 Fireworks API key；
  不需要复用内置 Fireworks/Nexus provider 的 key。

## 环境要求

- 支持 OpenCode v1 风格 provider 插件的 Magpie；已在 Magpie 0.1.3511 上验证。
- Bun（Magpie 会管理插件宿主所需的 Bun）。
- 一个标准 Fireworks API key（`fw_...`），且账号可以使用 Nexus Auto。
- 如需 Auto 路由到 Anthropic 或 OpenAI 模型，在 Nexus 账号中配置相应的 Provider Key。
  本插件不额外收集这些供应商的密钥。

## 安装

本仓库是私有仓库，先确保当前 GitHub 账号有读取权限。

```sh
git clone git@github.com:bluenight91/magpie-plugins.git
magpie plugin add ./magpie-plugins/opencode-fireworks-nexus-auth
```

如果插件目录已经在本机，也可以直接添加该目录：

```sh
magpie plugin add /path/to/opencode-fireworks-nexus-auth
```

添加后，Magpie 的「插件 → 已安装」中会出现 **Fireworks Nexus Auto**。

## 登录与更换 API key

在 Magpie 的插件页面点击登录，或在终端运行：

```sh
magpie plugin login fireworks-nexus
```

按提示输入 `fw_...` key。key 由 Magpie 保存到插件登录存储中，不会写入源码、
`package.json` 或本仓库。

更换 key：

```sh
magpie plugin logout fireworks-nexus
magpie plugin login fireworks-nexus
```

登出会删除这个 provider 当前保存的登录信息，请确认不再需要旧 key 对应的账号后再执行。

## 使用

在 Magpie 或接入 Magpie 网关的客户端中选择：

```text
fireworks-nexus/auto
```

然后在客户端的推理/思考强度设置中选择所需档位。插件声明的映射如下：

| 档位 | 发给上游的参数 |
|---|---|
| `low` | `reasoning_effort: "low"` |
| `medium` | `reasoning_effort: "medium"` |
| `high` | `reasoning_effort: "high"` |
| `xhigh` | `reasoning_effort: "xhigh"` |
| `max` | `reasoning_effort: "max"` |

Auto 官方档位不包括 `none` 或 `minimal`，插件因此不提供这两个选项。未选择档位时，
插件不会自行注入默认值，而是由客户端和 Nexus 按各自默认行为处理。

做一次最小真实请求：

```sh
magpie provider test fireworks-nexus auto
```

## Auto 元数据

| 项目 | 声明值 |
|---|---|
| 上下文窗口 | 1,048,575 tokens |
| 最大输出 | 131,072 tokens |
| 输入 | 文本、图片 |
| 工具调用 | 支持 |
| 推理档位 | `low` / `medium` / `high` / `xhigh` / `max` |
| 上游模型 ID | `auto` |

这些值与 Nexus CLI 的 Auto 静态规格一致。由于 Auto 会在不同轮次选择不同模型，插件
不根据单次响应动态修改这些声明，也不把某个后端模型的价格冒充为 Auto 的固定价格。

## Anthropic / OpenAI 模型路由

仅配置 Fireworks key 时，Auto 可以使用 Fireworks 开放模型。要允许它选择 Anthropic
或 OpenAI 模型，请使用 Nexus 账号中的 Provider Keys 功能。

本插件的 `auth.loader` 只负责 Fireworks key，不保存或转发额外的
`x-anthropic-api-key` / `x-openai-api-key`。这样可以避免把其他供应商的密钥写入插件选项；
Provider Keys 则由 Fireworks 账号侧统一管理。

## 常见排查

- **401**：检查 Fireworks key 是否有效，然后重新登录 `fireworks-nexus`。
- **404 / 无法使用 `auto`**：确认账号具有 Nexus Auto 权限；不要改用已弃用的
  `firerouter/auto`。
- **Auto 从未选择 Anthropic 或 OpenAI 模型**：检查 Nexus 账号中的 Provider Key 是否已配置。
- **修改插件后仍未生效**：在 Magpie 中把插件关闭再开启，重新加载插件宿主。
- **图标无法显示**：插件图标来自 Nexus 官方 HTTPS 地址，离线或网络策略可能阻止图标加载；
  这不影响模型请求。

## 开发

插件只有两个运行时常量集合：provider/base URL 和五个推理档位。核心逻辑位于
`index.mjs`，没有运行时依赖，也没有自定义 `fetch`。

```sh
magpie plugin --json
magpie provider test fireworks-nexus auto
```

调试自己的副本时，建议使用独立 HOME 的 Magpie 沙箱，不要直接操作正在使用的登录信息。

## License

MIT，见 [LICENSE](LICENSE)。静态参数、文档参考来源及官方图标的权利边界见
[NOTICE.md](NOTICE.md)。
