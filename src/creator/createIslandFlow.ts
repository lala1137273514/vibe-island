// 创岛编排:对话简报 → LLM 生成 → 提取 JSON → zod 校验 → 失败回喂重试一次 → 再失败如实抛错。
import type { IslandDef } from '../content/types'
import type { ChatMessage } from '../services/aiGateway'
import { validateGeneratedIsland } from '../game/islandSchema'
import { buildGenerationMessages, buildRetryMessage } from './generatePrompt'

export type ChatFn = (messages: ChatMessage[]) => Promise<string>

export function extractJson(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) ?? text.match(/```\s*([\s\S]*?)```/)
  if (!fenced) throw new Error('AI 输出中没有 ```json``` 围栏')
  return fenced[1].trim()
}

const parseAndValidate = (text: string): IslandDef =>
  validateGeneratedIsland(JSON.parse(extractJson(text)))

export async function generateIslandDef(brief: string, chatFn: ChatFn): Promise<IslandDef> {
  const messages = buildGenerationMessages(brief)
  const first = await chatFn(messages)
  let firstError: Error
  try {
    return parseAndValidate(first)
  } catch (e) {
    firstError = e as Error
  }
  const retry = await chatFn([
    ...messages,
    { role: 'assistant', content: first },
    { role: 'user', content: buildRetryMessage(firstError) },
  ])
  try {
    return parseAndValidate(retry)
  } catch (e2) {
    throw new Error(
      `AI 两次生成都未通过校验,已停止。\n第一次:${firstError.message.slice(0, 200)}\n第二次:${(e2 as Error).message.slice(0, 200)}`,
    )
  }
}

// 岛名 → 确定性 seed(预览与上岛后形状一致)
export function hashSeed(s: string): number {
  let h = 0
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0
  return h || 1
}
