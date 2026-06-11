import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NodePanel } from './NodePanel'
import { ORIGIN_ISLAND } from '../content/stage1'

const node = ORIGIN_ISLAND.nodes[0] // origin-1 学习地图,4 张学习卡

it('渲染含第一张学习卡标题', () => {
  render(<NodePanel node={node} onPass={vi.fn()} onClose={vi.fn()} />)
  expect(screen.getByText(/什么是 Vibe Coding/)).toBeInTheDocument()
})

it('翻到末页出现「开始挑战」', async () => {
  render(<NodePanel node={node} onPass={vi.fn()} onClose={vi.fn()} />)
  for (let i = 0; i < node.learn.length - 1; i++) {
    await userEvent.click(screen.getByRole('button', { name: '下一页' }))
  }
  expect(screen.getByRole('button', { name: '开始挑战' })).toBeInTheDocument()
})

it('点关闭触发 onClose', async () => {
  const onClose = vi.fn()
  render(<NodePanel node={node} onPass={vi.fn()} onClose={onClose} />)
  await userEvent.click(screen.getByRole('button', { name: '关闭' }))
  expect(onClose).toHaveBeenCalled()
})
