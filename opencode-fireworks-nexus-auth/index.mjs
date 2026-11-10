const PROVIDER = "fireworks-nexus"
const BASE = "https://api.fireworks.ai/inference/v1"
const CONTROL_BASE = "https://api.fireworks.ai"
const EFFORTS = ["low", "medium", "high", "xhigh", "max"]

function asNumber(value) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function formatTokens(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(Math.round(n))
}

function tokenWindow(name, prompt, completion, models, extras = {}) {
  const total = prompt + completion
  const modelNote = models.length ? ` · ${models.slice(0, 3).join("/")}${models.length > 3 ? "…" : ""}` : ""
  return {
    name,
    display: `${formatTokens(prompt)} in · ${formatTokens(completion)} out · ${formatTokens(total)} total${modelNote}`,
    aside: true,
    amount: total,
    unit: "tokens",
    ...extras,
  }
}

async function fetchJson(path, key, init = {}) {
  const response = await fetch(CONTROL_BASE + path, {
    ...init,
    headers: {
      ...init.headers,
      authorization: `Bearer ${key}`,
      accept: "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Fireworks usage API answered ${response.status}`)
  return response.json()
}

function sumServerless(rows = []) {
  let prompt = 0
  let completion = 0
  const models = new Set()
  for (const row of rows) {
    prompt += asNumber(row.promptTokens)
    completion += asNumber(row.completionTokens)
    const model = row.group?.model_name || row.modelName
    if (model) models.add(String(model).split("/").at(-1))
  }
  return { prompt, completion, models: [...models].sort() }
}

async function readUsage(getAuth) {
  const auth = await getAuth()
  if (auth?.type !== "api") {
    return { plan: "Nexus (Fireworks tokens)", error: "Sign in to read usage", windows: [] }
  }

  const accounts = await fetchJson("/v1/accounts", auth.key)
  const slug = accounts.accounts?.[0]?.name?.split("/").at(-1)
  if (!slug) throw new Error("Fireworks did not return an account")

  const now = new Date()
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const nextMidnight = new Date(dayStart.getTime() + 86_400_000)

  async function billingUsage(start) {
    const qs = new URLSearchParams({
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      usageType: "SERVERLESS",
      groupBy: "model_name",
    })
    const data = await fetchJson(`/v1/accounts/${slug}/billingUsage?${qs}`, auth.key)
    return sumServerless(data.serverlessCosts)
  }

  const today = await billingUsage(dayStart)
  const month = await billingUsage(monthStart)
  return {
    plan: "Nexus (Fireworks tokens)",
    windows: [
      tokenWindow("Today", today.prompt, today.completion, today.models, {
        span: 86_400,
        resetsAt: nextMidnight.toISOString(),
      }),
      tokenWindow("This month", month.prompt, month.completion, month.models),
    ],
  }
}

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
    async usage(getAuth) {
      try {
        return await readUsage(getAuth)
      } catch {
        return {
          plan: "Nexus (Fireworks tokens)",
          error: "Couldn't read Fireworks token usage; it may lag",
          windows: [],
        }
      }
    },
  },
})
