import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorErTask } from './ErrorErTask'
import type { ErrorErTask as ErrorErT } from '../../content/types'

const t: ErrorErT = { type: 'error-er', intro: '救救病人', cases: [{ symptom: '页面白屏', steps: [
  { prompt: '第一步?', options: [
    { text: '先截图问AI', correct: true, feedback: '' },
    { text: '先开F12', correct: false, feedback: '别急着开F12' }] },
]}]}

it('渲染症状,走对路径触发 onResult(true)', async () => {
  const onResult = vi.fn()
  render(<ErrorErTask task={t} onResult={onResult} />)
  expect(screen.getByText(/页面白屏/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '先截图问AI' }))
  expect(onResult).toHaveBeenCalledWith(true)
  expect(screen.getByText(/治愈出院/)).toBeInTheDocument()
})

it('选错显示 feedback 且不前进', async () => {
  const onResult = vi.fn()
  render(<ErrorErTask task={t} onResult={onResult} />)
  await userEvent.click(screen.getByRole('button', { name: '先开F12' }))
  expect(screen.getByText(/别急着开F12/)).toBeInTheDocument()
  expect(onResult).not.toHaveBeenCalled()
})
