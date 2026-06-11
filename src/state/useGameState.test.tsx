import { it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState'
import { ORIGIN_ISLAND } from '../content/stage1'

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
