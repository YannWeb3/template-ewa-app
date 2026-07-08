export interface AIProvider {
  id: string
  label: string
  models: AIModel[]
  envKey: string
  baseUrl: string
}

export interface AIModel {
  id: string
  label: string
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "openai",
    label: "OpenAI",
    envKey: "OPENAI_API_KEY",
    baseUrl: "https://api.openai.com/v1",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini" },
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-5", label: "GPT-5" },
    ],
  },
  {
    id: "ollama-cloud",
    label: "Ollama Cloud",
    envKey: "OLLAMA_CLOUD_API_KEY",
    baseUrl: "https://api.ollama.cloud/v1",
    models: [
      { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash" },
      { id: "deepseek-v4", label: "DeepSeek V4" },
      { id: "llama-4", label: "Llama 4" },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    envKey: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1",
    models: [
      { id: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
      { id: "anthropic/claude-haiku-4", label: "Claude Haiku 4" },
      { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    ],
  },
]

export interface AISettings {
  provider: string
  model: string
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: "openai",
  model: "gpt-4o-mini",
}

export function getProvider(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id)
}

export function getModelLabel(providerId: string, modelId: string): string {
  const provider = getProvider(providerId)
  if (!provider) return modelId
  const model = provider.models.find((m) => m.id === modelId)
  return model?.label ?? modelId
}

export async function callAI(
  settings: AISettings,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const provider = getProvider(settings.provider)
  if (!provider) throw new Error(`Provider "${settings.provider}" not supported`)

  const apiKey = process.env[provider.envKey]
  if (!apiKey) {
    throw new Error(`${provider.envKey} not configured in environment variables`)
  }

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  }

  if (settings.provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`${provider.label} API error: ${errText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse."
}
