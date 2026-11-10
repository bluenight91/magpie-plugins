# Fireworks Nexus Auto

Use Fireworks Nexus Auto as a model provider in Magpie. This plugin exposes only
`fireworks-nexus/auto`, sends requests through Fireworks' OpenAI-compatible Chat
Completions API, and supplies the context, output-limit and reasoning-effort metadata
that Auto needs.

**[中文 → README.md](README.md)** · Provenance, licensing and attribution:
[NOTICE.md](NOTICE.md)

## What it is

Nexus Auto chooses the model that serves each turn. The model catalog does not report
a fixed context window or reasoning capability for `auto`, so this plugin uses the
official static Auto specification from Nexus CLI rather than inferring metadata from
whichever model served one response.

- Provider ID: `fireworks-nexus`
- Model ID: `fireworks-nexus/auto`
- Upstream: `https://api.fireworks.ai/inference/v1/chat/completions`
- AI SDK: `@ai-sdk/openai-compatible`
- No npm runtime dependencies and no request or response rewriting

The plugin is a separate provider. It does not replace, disable or migrate Magpie's
built-in `nexus` provider, and it does not change any agent's selected model.

## Features

- **1M context**: declares a 1,048,575-token context window instead of falling back to 128K.
- **Output limit**: declares up to 131,072 output tokens.
- **Reasoning effort**: offers `low`, `medium`, `high`, `xhigh` and `max`, without forcing a default.
- **Modalities and tools**: declares text and image input plus tool calling.
- **Transparent routing**: always sends `auto` upstream, never remaps it to a concrete model
  and never invents a fixed price.
- **Your own API key**: use any standard Fireworks API key allowed to call Nexus Auto.
  The built-in Fireworks/Nexus provider's key is not required.

## Requirements

- A Magpie build with OpenCode v1 provider-plugin support; verified on Magpie 0.1.3511.
- Bun, which Magpie manages for its plugin host.
- A standard Fireworks API key (`fw_...`) whose account can use Nexus Auto.
- To let Auto choose Anthropic or OpenAI models, configure the corresponding Provider Key
  in the Nexus account. This plugin does not collect those providers' credentials.

## Install

This is a private repository. Make sure your GitHub account has read access first.

```sh
git clone git@github.com:bluenight91/magpie-plugins.git
magpie plugin add ./magpie-plugins/opencode-fireworks-nexus-auth
```

You can also add an existing local directory directly:

```sh
magpie plugin add /path/to/opencode-fireworks-nexus-auth
```

**Fireworks Nexus Auto** then appears under Magpie's installed plugins.

## Sign in and change API keys

Click Sign in on Magpie's plugin page, or run:

```sh
magpie plugin login fireworks-nexus
```

Enter a `fw_...` key when prompted. Magpie stores it in the plugin credential store,
never in the source code, `package.json` or this repository.

To replace the current key:

```sh
magpie plugin logout fireworks-nexus
magpie plugin login fireworks-nexus
```

Logging out removes the credentials currently saved for this provider. Make sure you no
longer need the account associated with the old key before doing so.

## Usage

Select this model in Magpie or in a client connected to the Magpie gateway:

```text
fireworks-nexus/auto
```

Then choose the desired reasoning level in the client. The declared mappings are:

| Level | Upstream parameter |
|---|---|
| `low` | `reasoning_effort: "low"` |
| `medium` | `reasoning_effort: "medium"` |
| `high` | `reasoning_effort: "high"` |
| `xhigh` | `reasoning_effort: "xhigh"` |
| `max` | `reasoning_effort: "max"` |

The official Auto ladder does not include `none` or `minimal`, so the plugin does not
offer them. If no level is selected, the plugin injects no default; the client and Nexus
apply their own normal behavior.

Run a minimal live request with:

```sh
magpie provider test fireworks-nexus auto
```

## Auto metadata

| Property | Declared value |
|---|---|
| Context window | 1,048,575 tokens |
| Maximum output | 131,072 tokens |
| Input | Text and images |
| Tool calling | Supported |
| Reasoning levels | `low` / `medium` / `high` / `xhigh` / `max` |
| Upstream model ID | `auto` |

These values match Nexus CLI's static Auto specification. Because Auto may choose a
different model on another turn, the plugin does not mutate this metadata from individual
responses or present one backend model's price as a fixed Auto price.

## Usage and cost

```sh
magpie quota fireworks-nexus
```

The plugin shows two estimated-cost windows:

- **5 hours**: Fireworks-billed cost over the last five hours
- **This month**: Fireworks-billed cost in the current UTC month

The values come from Fireworks' `usageCosts:query` API and are display-only; they never
affect routing. Fireworks documents this data as aggregated, cached for several minutes,
and potentially more than a day behind, so each window is labeled “estimated, may lag”.

They are **not Nexus Pro's 5-hour or monthly plan limits**: there is no percentage, cap or
reset time. The API also covers only Fireworks-billed usage, not closed-model costs billed
to your Anthropic / OpenAI accounts.

Nexus CLI's Claude Code status line is a separate local estimate: it reads the Claude Code
transcript, shows the model that actually served each Auto turn, and recomputes session
cost with that model's rates. This Magpie plugin does not read Claude Code transcripts and
does not modify Claude Code's status line configuration.

## Anthropic / OpenAI routing

With only a Fireworks key, Auto can use Fireworks open models. To let it choose Anthropic
or OpenAI models, use Provider Keys in the Nexus account.

The plugin's `auth.loader` handles only the Fireworks key. It does not save or forward
additional `x-anthropic-api-key` or `x-openai-api-key` values. This keeps other providers'
credentials out of plugin options while Nexus manages Provider Keys centrally.

## Troubleshooting

- **401**: check that the Fireworks key is valid, then sign in to `fireworks-nexus` again.
- **404 / `auto` unavailable**: confirm that the account has Nexus Auto access. Do not use
  the retired `firerouter/auto` ID instead.
- **Auto never chooses Anthropic or OpenAI**: check the Provider Keys in the Nexus account.
- **Changes do not appear**: turn the plugin off and on in Magpie to reload its host.
- **The icon does not load**: the icon uses Nexus' official HTTPS asset. Offline use or a
  network policy may block it without affecting model requests.

## Development

`index.mjs` contains the provider declaration, the official Auto metadata, an API-key
loader and the estimated-usage query. There are no runtime dependencies; model requests do
not use a custom `fetch`, while the usage hook uses standard `fetch` to call Fireworks'
control API.

```sh
magpie plugin --json
magpie provider test fireworks-nexus auto
```

When developing your own copy, use a Magpie sandbox with an isolated HOME rather than the
credentials and configuration of your working installation.

## License

MIT; see [LICENSE](LICENSE). Metadata and documentation sources, plus the boundaries around
the official logo, are covered in [NOTICE.md](NOTICE.md).
