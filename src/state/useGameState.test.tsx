import { it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState'
// TODO(Task 6): 切回 import { ORIGIN_ISLAND } from '../content/stage1'
import type { IslandDef } from '../content/types'

const ORIGIN_ISLAND: IslandDef = {
  id: 'origin', name: '起源岛', region: 'stage-1', lockedByDefault: false,
  nextIslandId: 'sea2-island1', nodes: [
    { id: 'origin-1', title: '学习地图', chapterSlug:'learning-map', kind:'main', order:1, learn:[], coins:10,
      position:{x:10,y:80}, task:{ type:'quiz', question:'q', options:['x','y'], answerIndex:1, explain:'' } },
    { id: 'origin-2', title: '找到好点子', chapterSlug:'finding-great-idea', kind:'main', order:2, learn:[], coins:10,
      position:{x:30,y:60}, task:{ type:'quiz', question:'q', options:['x','y'], answerIndex:0, explain:'' } },
  ],
}

beforeEach(() => localStorage.clear())

it('完成主线节点后金币增长且持久化', () => {
  const { result } = renderHook(() => useGameState(ORIGIN_ISLAND))
  act(() => result.current.finishNode('origin-1', true))
  expect(result.current.save.nodeStatus['origin-1']).toBe('done')
  expect(result.current.save.coins).toBeGreaterThan(0)
  expect(JSON.parse(localStorage.getItem('vibe-islands-save')!).coins).toBe(result.current.save.coins)
})

it('完成后自动结算新成就', () => {
  const { result } = renderHook(() => useGameState(ORIGIN_ISLAND))
  act(() => result.current.finishNode('origin-1', true))
  expect(result.current.save.achievements).toContain('starter')
})
