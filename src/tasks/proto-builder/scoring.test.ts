import { it, expect } from 'vitest'
import { scoreProto } from './scoring'
import type { ProtoBuilderTask } from '../../content/types'

const t: ProtoBuilderTask = {
  type: 'proto-builder', brief: 'b',
  slots: [
    { id: 'top', label: '顶栏', accepts: ['title'] },
    { id: 'main', label: '主区', accepts: ['form', 'upload'] },
  ],
  blocks: [
    { id: 'title', label: '标题栏', emoji: '🏷️' },
    { id: 'form', label: '表单', emoji: '📋' },
    { id: 'upload', label: '上传', emoji: '📤' },
    { id: 'vip', label: '会员弹窗', emoji: '💰', distractor: true },
  ],
}

it('必选块全部放对 → pass+perfect', () => {
  expect(scoreProto(t, { top: ['title'], main: ['form', 'upload'] }))
    .toEqual({ pass: true, perfect: true, missing: [], extras: [] })
})

it('缺块 → 不过,missing 指出缺什么', () => {
  const r = scoreProto(t, { top: ['title'], main: ['form'] })
  expect(r.pass).toBe(false)
  expect(r.missing).toEqual(['main:upload'])
})

it('放了干扰块 → pass 但非 perfect,extras 指出多余', () => {
  const r = scoreProto(t, { top: ['title'], main: ['form', 'upload', 'vip'] })
  expect(r.pass).toBe(true)
  expect(r.perfect).toBe(false)
  expect(r.extras).toEqual(['vip'])
})

it('块放错槽 → 既算缺也不算命中', () => {
  const r = scoreProto(t, { top: ['form'], main: ['title', 'upload'] })
  expect(r.pass).toBe(false)
})
