const PROVIDER = "fireworks-nexus"
const BASE = "https://api.fireworks.ai/inference/v1"
const EFFORTS = ["low", "medium", "high", "xhigh", "max"]

export const FireworksNexusPlugin = async () => ({
  config: async (cfg) => {
    cfg.provider ??= {}
    cfg.provider[PROVIDER] ??= {
      name: "Fireworks Nexus Auto",
      npm: "@ai-sdk/openai-compatible",
      api: BASE,
      models: {
        auto: {
          name: "Nexus Auto",
          limit: { context: 1048575, output: 131072 },
          modalities: { input: ["text", "image"] },
          tool_call: true,
          reasoning: true,
          variants: Object.fromEntries(
            EFFORTS.map((effort) => [effort, { reasoningEffort: effort }]),
          ),
        },
      },
    }
  },

  auth: {
    provider: PROVIDER,
    methods: [{ type: "api", label: "Fireworks API key", placeholder: "fw_…" }],
    async loader(getAuth) {
      const auth = await getAuth()
      if (auth?.type !== "api") return {}
      return { baseURL: BASE, apiKey: auth.key }
    },
  },
})
