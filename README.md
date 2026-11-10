# magpie-plugins

我的 Magpie / OpenCode provider 插件集合。仓库根目录的 `package.json` 是远程安装入口；
当前它暴露下面的 Fireworks Nexus Auto 插件，插件本体保留在对应文件夹中。

## 插件

### [Fireworks Nexus Auto](opencode-fireworks-nexus-auth/README.md)

- Provider：`fireworks-nexus`
- 模型：`fireworks-nexus/auto`
- 上下文：1,048,575 tokens
- 输出上限：131,072 tokens
- 推理档位：`low` / `medium` / `high` / `xhigh` / `max`
- 用量：显示最近 5 小时和本月的 Fireworks 估算成本，不是 Nexus Pro 套餐限额
- API：`https://api.fireworks.ai/inference/v1`
- 无 npm 运行时依赖

详细说明：

- 中文：[opencode-fireworks-nexus-auth/README.md](opencode-fireworks-nexus-auth/README.md)
- English：[opencode-fireworks-nexus-auth/README.en.md](opencode-fireworks-nexus-auth/README.en.md)
- 来源与合规：[opencode-fireworks-nexus-auth/NOTICE.md](opencode-fireworks-nexus-auth/NOTICE.md)
- 许可证：[opencode-fireworks-nexus-auth/LICENSE](opencode-fireworks-nexus-auth/LICENSE)

## 安装

```sh
magpie plugin add github:bluenight91/magpie-plugins
```

安装后登录自己的 Fireworks API key：

```sh
magpie plugin login fireworks-nexus
```

测试模型：

```sh
magpie provider test fireworks-nexus auto
```

## 更新

这个包来自 Git 仓库。推送新提交后，在 Magpie 里运行：

```sh
magpie plugin update
```

或在插件页选择更新。

## 目录

```text
opencode-fireworks-nexus-auth/   Fireworks Nexus Auto 插件与文档
package.json                      Magpie 远程安装入口
```

## 许可证

插件使用 MIT 许可证，见
[opencode-fireworks-nexus-auth/LICENSE](opencode-fireworks-nexus-auth/LICENSE)。
Nexus 官方图标及第三方服务的权利边界见
[opencode-fireworks-nexus-auth/NOTICE.md](opencode-fireworks-nexus-auth/NOTICE.md)。
