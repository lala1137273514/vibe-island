import { it, expect, vi, beforeEach } from 'vitest'
import { loadAiConfig, saveAiConfig, hasAiConfig, chat } from './aiGateway'

beforeEach(() => localStorage.clear())

it('无配置 hasAiConfig=false;存取 roundtrip', () => {
  expect(hasAiConfig()).toBe(false)
  saveAiConfig({ baseURL: 'https://api.deepseek.com', apiKey: 'sk-x', model: 'deepseek-chat' })
  expect(hasAiConfig()).toBe(true)
  expect(loadAiConfig()!.model).toBe('deepseek-chat')
})

it('chat 发 OpenAI 兼容请求并取回内容', async () => {
  saveAiConfig({ baseURL: 'https://api.deepseek.com', apiKey: 'sk-x', model: 'deepseek-chat' })
  const fetchMock = vi.fn(async () => new Response(
    JSON.stringify({ choices: [{ message: { content: '你好' } }] }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  expect(await chat([{ role: 'user', content: 'hi' }])).toBe('你好')
  const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toBe('https://api.deepseek.com/chat/completions')
  expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-x')
  expect(JSON.parse(init.body as string).model).toBe('deepseek-chat')
})

it('HTTP 错误原样抛出', async () => {
  saveAiConfig({ baseURL: 'https://api.deepseek.com', apiKey: 'sk-x', model: 'deepseek-chat' })
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":{"message":"bad key"}}', { status: 401 })))
  await expect(chat([{ role: 'user', content: 'hi' }])).rejects.toThrow(/401/)
})

it('未配置时调用 chat 直接报错', async () => {
  await expect(chat([{ role: 'user', content: 'hi' }])).rejects.toThrow(/未配置/)
})
