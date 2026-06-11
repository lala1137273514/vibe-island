import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizTask } from './QuizTask'
import { TrueFalseTask } from './TrueFalseTask'
import { MatchTask } from './MatchTask'
import { FillPromptTask } from './FillPromptTask'
import { TaskRenderer } from '../TaskRenderer'
import type {
  QuizTask as QuizT, TrueFalseTask as TfT, MatchTask as MatchT, FillPromptTask as FillT,
} from '../../content/types'

const quiz: QuizT = { type: 'quiz', question: '一加一等于几?', options: ['一', '二', '三'], answerIndex: 1, explain: '基础算术。' }
const tf: TfT = { type: 'truefalse', statements: [
  { text: '天是蓝的', isTrue: true }, { text: '火是冷的', isTrue: false }], explain: '常识。' }
const match: MatchT = { type: 'match', pairs: [
  { left: '猫', right: '喵' }, { left: '狗', right: '汪' }] }
const fill: FillT = { type: 'fill-prompt', template: '请规划一个 ___ 来验证需求',
  blanks: [{ accept: ['MVP', '最小可行产品'], hint: '三个英文字母' }], explain: '最小可行产品。' }

it('QuizTask 点正确项 onResult(true)', async () => {
  const onResult = vi.fn()
  render(<QuizTask task={quiz} onResult={onResult} />)
  await userEvent.click(screen.getByRole('button', { name: '二' }))
  expect(onResult).toHaveBeenCalledWith(true)
})

it('QuizTask 点错误项 onResult(false) 且有反馈', async () => {
  const onResult = vi.fn()
  render(<QuizTask task={quiz} onResult={onResult} />)
  await userEvent.click(screen.getByRole('button', { name: '一' }))
  expect(onResult).toHaveBeenCalledWith(false)
  expect(screen.getByText(/不对/)).toBeInTheDocument()
})

it('TrueFalseTask 全判对提交后 onResult(true)', async () => {
  const onResult = vi.fn()
  render(<TrueFalseTask task={tf} onResult={onResult} />)
  await userEvent.click(screen.getAllByRole('button', { name: '对' })[0])
  await userEvent.click(screen.getAllByRole('button', { name: '错' })[1])
  await userEvent.click(screen.getByRole('button', { name: '提交' }))
  expect(onResult).toHaveBeenCalledWith(true)
})

it('MatchTask 全部配对正确提交后 onResult(true)', async () => {
  const onResult = vi.fn()
  render(<MatchTask task={match} onResult={onResult} />)
  await userEvent.selectOptions(screen.getByLabelText('配对-猫'), '喵')
  await userEvent.selectOptions(screen.getByLabelText('配对-狗'), '汪')
  await userEvent.click(screen.getByRole('button', { name: '提交' }))
  expect(onResult).toHaveBeenCalledWith(true)
})

it('FillPromptTask 输入命中 accept(忽略大小写)→ onResult(true)', async () => {
  const onResult = vi.fn()
  render(<FillPromptTask task={fill} onResult={onResult} />)
  await userEvent.type(screen.getByLabelText('空1'), 'mvp')
  await userEvent.click(screen.getByRole('button', { name: '提交' }))
  expect(onResult).toHaveBeenCalledWith(true)
})

it('TaskRenderer 首次就对 → onPass(true);先错后对 → onPass(false)', async () => {
  const onPass1 = vi.fn()
  const { unmount } = render(<TaskRenderer task={quiz} onPass={onPass1} />)
  await userEvent.click(screen.getByRole('button', { name: '二' }))
  expect(onPass1).toHaveBeenCalledWith(true)
  unmount()

  const onPass2 = vi.fn()
  render(<TaskRenderer task={quiz} onPass={onPass2} />)
  await userEvent.click(screen.getByRole('button', { name: '一' }))
  expect(onPass2).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: '二' }))
  expect(onPass2).toHaveBeenCalledWith(false)
})
