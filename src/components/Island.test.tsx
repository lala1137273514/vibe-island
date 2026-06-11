import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Island } from './Island'
import { ORIGIN_ISLAND } from '../content/stage1'
import { initSave } from '../state/gameLogic'

const setup = () => {
  const onOpenNode = vi.fn()
  const onBack = vi.fn()
  const save = initSave(ORIGIN_ISLAND)
  render(<Island island={ORIGIN_ISLAND} nodeStatus={save.nodeStatus}
    onOpenNode={onOpenNode} onBack={onBack} activeNodeId={null} />)
  return { onOpenNode, onBack }
}

it('点 available 节点触发 onOpenNode', async () => {
  const { onOpenNode } = setup()
  await userEvent.click(screen.getByRole('button', { name: '学习地图' }))
  expect(onOpenNode).toHaveBeenCalledWith(expect.objectContaining({ id: 'origin-1' }))
})

it('点 locked 节点不触发 onOpenNode', async () => {
  const { onOpenNode } = setup()
  await userEvent.click(screen.getByRole('button', { name: '找到好点子' }))
  expect(onOpenNode).not.toHaveBeenCalled()
})

it('点返回触发 onBack,小人在起点', async () => {
  const { onBack } = setup()
  expect(screen.getByTestId('character')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '← 返回大地图' }))
  expect(onBack).toHaveBeenCalled()
})
