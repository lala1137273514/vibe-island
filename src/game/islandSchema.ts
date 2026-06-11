// AI 生成岛屿的强校验(zod):任务类型限四种基础可机判类型;
// 校验失败抛错(带字段路径),由 creator 流程回喂 AI 重试一次,绝不静默修补。
import { z } from 'zod'
import type { IslandDef } from '../content/types'

const learnCard = z.object({
  title: z.string().min(1),
  body: z.string().min(20, '学习卡正文至少 20 字'),
})

const quiz = z.object({
  type: z.literal('quiz'),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4, 'quiz 必须 4 个选项'),
  answerIndex: z.number().int().min(0).max(3, 'answerIndex 必须在 0..3'),
  explain: z.string(),
})
const truefalse = z.object({
  type: z.literal('truefalse'),
  statements: z.array(z.object({ text: z.string().min(1), isTrue: z.boolean() })).min(2).max(5),
  explain: z.string(),
})
const match = z.object({
  type: z.literal('match'),
  pairs: z.array(z.object({ left: z.string().min(1), right: z.string().min(1) })).length(4, 'match 必须 4 对'),
})
const fillPrompt = z.object({
  type: z.literal('fill-prompt'),
  template: z.string().refine(s => s.includes('___'), 'template 必须含 ___ 空位'),
  blanks: z.array(z.object({ accept: z.array(z.string().min(1)).min(1), hint: z.string() })).min(1).max(3),
  explain: z.string(),
}).refine(t => t.blanks.length === t.template.split('___').length - 1, '空位数与 blanks 数不一致')

const node = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(20),
  chapterSlug: z.string().min(1),
  kind: z.enum(['main', 'treasure']),
  order: z.number().int().min(0),
  learn: z.array(learnCard).min(2, '每节点至少 2 张学习卡').max(4),
  task: z.discriminatedUnion('type', [quiz, truefalse, match, fillPrompt]),
  coins: z.number().int().min(1).max(50),
  position: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
})

const islandSchema = z.object({
  id: z.string().regex(/^custom-[a-z0-9][a-z0-9-]*$/, '岛 id 必须形如 custom-xxx'),
  name: z.string().min(1).max(24),
  region: z.enum(['stage-1', 'stage-2', 'stage-3']),
  lockedByDefault: z.literal(false),
  nodes: z.array(node).min(3, '至少 3 个节点').max(8),
}).superRefine((isle, ctx) => {
  const mains = isle.nodes.filter(n => n.kind === 'main')
  if (mains.length < 3 || mains.length > 6) {
    ctx.addIssue({ code: 'custom', path: ['nodes'], message: '主线节点须 3~6 个' })
  }
  const orders = mains.map(n => n.order).sort((a, b) => a - b)
  if (!orders.every((o, i) => o === i + 1)) {
    ctx.addIssue({ code: 'custom', path: ['nodes'], message: '主线 order 必须恰为 1..n 连续' })
  }
  for (const t of isle.nodes.filter(n => n.kind === 'treasure')) {
    if (t.order !== 0) ctx.addIssue({ code: 'custom', path: ['nodes'], message: '宝箱节点 order 必须为 0' })
  }
  const ids = new Set<string>()
  for (const n of isle.nodes) {
    if (ids.has(n.id)) ctx.addIssue({ code: 'custom', path: ['nodes'], message: `节点 id 重复:${n.id}` })
    ids.add(n.id)
    if (!n.id.startsWith(`${isle.id}-`)) {
      ctx.addIssue({ code: 'custom', path: ['nodes'], message: `节点 id 必须以 ${isle.id}- 开头:${n.id}` })
    }
  }
})

export function validateGeneratedIsland(json: unknown): IslandDef {
  const r = islandSchema.safeParse(json)
  if (!r.success) {
    const lines = r.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    throw new Error(`生成的岛屿不合法:\n${lines.join('\n')}`)
  }
  return r.data as IslandDef
}
