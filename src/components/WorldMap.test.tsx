import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorldMap } from './WorldMap'
import { ISLANDS } from '../content/islands'

it('渲染后能看到起源岛,点击触发 onEnter', async () => {
  const onEnter = vi.fn()
  render(<WorldMap islands={ISLANDS} unlockedIslands={['origin']} onEnter={onEnter} coins={0} />)
  expect(screen.getByText('起源岛')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '起源岛' }))
  expect(onEnter).toHaveBeenCalledWith('origin')
})

it('锁定岛点击不触发 onEnter,弹出解锁提示', async () => {
  const onEnter = vi.fn()
  render(<WorldMap islands={ISLANDS} unlockedIslands={['origin']} onEnter={onEnter} coins={0} />)
  await userEvent.click(screen.getByRole('button', { name: '进阶之岛' }))
  expect(onEnter).not.toHaveBeenCalled()
  expect(screen.getByText('完成上一海域后解锁')).toBeInTheDocument()
})
