const PROVIDER = "fireworks-nexus"
const BASE = "https://api.fireworks.ai/inference/v1"
const CONTROL_BASE = "https://api.fireworks.ai"
const EFFORTS = ["low", "medium", "high", "xhigh", "max"]

function moneyText(money = {}) {
  const value = Number(money.units ?? 0) + Number(money.nanos ?? 0) / 1_000_000_000
  return `$${value.toFixed(2)}`
}

function usageWindow(name, subtotal) {
  return {
    name,
    display: `~${moneyText(subtotal)} · estimated, may lag`,
    aside: true,
    ...(name === "5 hours" ? { span: 18_000 } : {}),
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

async function readUsage(getAuth) {
  const auth = await getAuth()
  if (auth?.type !== "api") {
    return { plan: "Nexus (estimated costs)", error: "Sign in to read usage", windows: [] }
  }

  const accounts = await fetchJson("/v1/accounts", auth.key)
  const slug = accounts.accounts?.[0]?.name?.split("/").at(-1)
  if (!slug) throw new Error("Fireworks did not return an account")

  let user
  try {
    const users = await fetchJson(`/v1/accounts/${slug}/users`, auth.key)
    user = users.users?.[0]?.name
  } catch {}

  const now = new Date()
  const fiveHoursStart = new Date(now.getTime() - 5 * 3_600_000)
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

  async function costs(start, end, groupBy, filter) {
    const body = {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      scope: "ACCOUNT",
      groupBy,
      pageSize: 100,
    }
    if (filter) body.filter = filter
    const data = await fetchJson(`/v1/accounts/${slug}/usageCosts:query`, auth.key, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    return data.subtotal
  }

  const fiveHours = await costs(fiveHoursStart, now, ["HOUR"], user ? { user } : undefined)
  const month = await costs(monthStart, now, ["DAY"])
  return {
    plan: "Nexus (estimated costs)",
    windows: [
      usageWindow("5 hours", fiveHours),
      usageWindow("This month", month),
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
          plan: "Nexus (estimated costs)",
          error: "Couldn't read Fireworks usage costs; they may lag",
          windows: [],
        }
      }
    },
  },
})
