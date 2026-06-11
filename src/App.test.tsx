import { it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => localStorage.clear())

it('默认 map 见起源岛 → 进岛见节点 → 点节点1见第一张学习卡', async () => {
  render(<App />)
  expect(screen.getByText('起源岛')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '起源岛' }))
  expect(screen.getByRole('button', { name: '学习地图' })).toBeInTheDocument()
  expect(screen.getByTestId('character')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '学习地图' }))
  expect(screen.getByText(/什么是 Vibe Coding/)).toBeInTheDocument()
})
