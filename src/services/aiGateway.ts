// BYOK(Bring Your Own Key)AI 网关:OpenAI 兼容接口,配置存 localStorage,不进 git、不上传。
// Phase B 将增加 Supabase Edge Function 实现,同接口可替换。
export interface AiConfig { baseURL: string; apiKey: string; model: string }
export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }

const KEY = 'vibe-islands-ai'

export function loadAiConfig(): AiConfig | null {
  try {
    const r = localStorage.getItem(KEY)
    return r ? JSON.parse(r) as AiConfig : null
  } catch { return null }
}

export function saveAiConfig(c: AiConfig) {
  localStorage.setItem(KEY, JSON.stringify(c))
}

export function clearAiConfig() {
  localStorage.removeItem(KEY)
}

export function hasAiConfig(): boolean {
  const c = loadAiConfig()
  return !!(c && c.baseURL && c.apiKey && c.model)
}

export async function chat(messages: ChatMessage[], opts?: { temperature?: number }): Promise<string> {
  const c = loadAiConfig()
  if (!c || !c.baseURL || !c.apiKey || !c.model) throw new Error('未配置 AI:请先到设置里填入 baseURL / API Key / 模型名')
  const res = await fetch(`${c.baseURL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.apiKey}` },
    body: JSON.stringify({ model: c.model, messages, temperature: opts?.temperature ?? 0.7 }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`AI 调用失败 HTTP ${res.status}: ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') throw new Error(`AI 返回格式异常: ${JSON.stringify(data).slice(0, 300)}`)
  return content
}
