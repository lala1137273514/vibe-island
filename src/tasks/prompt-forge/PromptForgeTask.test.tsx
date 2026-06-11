import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptForgeTask } from './PromptForgeTask'
import type { PromptForgeTask as ForgeT } from '../../content/types'

const t: ForgeT = {
  type: 'prompt-forge', brief: '把点子磨成提示词', basePrompt: '帮我做一个健身 APP',
  forgeRounds: [
    { options: [
      { text: '加目标人群', effective: true, why: '人群越细,痛点越真', fragment: '目标用户:产后妈妈' },
      { text: '加华丽辞藻', effective: false, why: '辞藻不解决问题', fragment: '' }] },
    { options: [
      { text: '让AI夸我', effective: false, why: '访谈不是找认可', fragment: '' },
      { text: '加担忧与MVP', effective: true, why: '担忧+MVP 是原文模板核心', fragment: '我担心内容成本,请规划 MVP' }] },
    { options: [
      { text: '加验证指标', effective: true, why: '没有指标无法验证', fragment: '设定验证指标' },
      { text: '要求源码加密', effective: false, why: '与验证需求无关', fragment: '' }] },
  ],
  rubric: ['人群', 'MVP'], exampleGood: '我想做一个[产品概念]…',
}

it('三锤全中 → onResult(true) + 展示参考模板', async () => {
  const onResult = vi.fn()
  render(<PromptForgeTask task={t} onResult={onResult} />)
  expect(screen.getByText(/把点子磨成提示词/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /加目标人群/ }))
  await userEvent.click(screen.getByRole('button', { name: /加担忧与MVP/ }))
  await userEvent.click(screen.getByRole('button', { name: /加验证指标/ }))
  expect(onResult).toHaveBeenCalledWith(true)
  expect(screen.getByText(/锻出神器/)).toBeInTheDocument()
})

it('只中一锤 → onResult(false) + 可重新锻造', async () => {
  const onResult = vi.fn()
  render(<PromptForgeTask task={t} onResult={onResult} />)
  await userEvent.click(screen.getByRole('button', { name: /加目标人群/ }))
  await userEvent.click(screen.getByRole('button', { name: /让AI夸我/ }))
  await userEvent.click(screen.getByRole('button', { name: /要求源码加密/ }))
  expect(onResult).toHaveBeenCalledWith(false)
  expect(screen.getByRole('button', { name: '重新锻造' })).toBeInTheDocument()
})
