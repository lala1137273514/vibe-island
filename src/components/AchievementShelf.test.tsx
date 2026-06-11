import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AchievementShelf } from './AchievementShelf'
import { ACHIEVEMENTS } from '../game/achievements'
import type { SaveState } from '../content/types'

const save: SaveState = { version: 1, nodeStatus: {}, achievements: ['starter'],
  coins: 10, stars: 0, unlockedIslands: ['origin'], openedTreasures: [] }

it('已解锁的「启程者」亮出名称,其余显示 ???', () => {
  render(<AchievementShelf save={save} onClose={vi.fn()} />)
  expect(screen.getByText('启程者')).toBeInTheDocument()
  expect(screen.queryByText('点子猎人')).not.toBeInTheDocument()
  expect(screen.getAllByText('???')).toHaveLength(ACHIEVEMENTS.length - 1)
})
