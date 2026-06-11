// 对照 spec 第 11 节 10 条验收标准的自动化验收(①-⑨;⑩像素观感由 pnpm dev 人工核对)
import { it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { ORIGIN_ISLAND } from './content/stage1'

beforeEach(() => localStorage.clear())

const user = userEvent.setup()

const readCardsAndStartChallenge = async () => {
  while (screen.queryByRole('button', { name: '下一页' })) {
    await user.click(screen.getByRole('button', { name: '下一页' }))
  }
  await user.click(screen.getByRole('button', { name: '开始挑战' }))
}
const closePanel = async () => user.click(screen.getByRole('button', { name: '关闭' }))
const openNode = async (title: string) => user.click(screen.getByRole('button', { name: title }))

const solveTrueFalse = async (answers: boolean[]) => {
  const yes = screen.getAllByRole('button', { name: '对' })
  const no = screen.getAllByRole('button', { name: '错' })
  for (let i = 0; i < answers.length; i++) await user.click(answers[i] ? yes[i] : no[i])
  await user.click(screen.getByRole('button', { name: '提交' }))
}

it('完整通关流程覆盖验收标准 ①-⑨', async () => {
  const { unmount } = render(<App />)

  // ① 首屏大地图:起源岛可点,其余 🔒;锁定岛点击不进入(3D 在 jsdom 不渲染,经码头 Dock 验证)
  expect(screen.getByRole('button', { name: '起源岛' })).toBeInTheDocument()
  expect(screen.getAllByText(/🔒/).length).toBeGreaterThanOrEqual(2)
  await user.click(screen.getByRole('button', { name: '进阶之岛' }))
  expect(screen.getByText('完成上一海域后解锁')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '学习地图' })).not.toBeInTheDocument()

  // ② 进起源岛:6 主线 + 4 宝箱 + 小人
  await user.click(screen.getByRole('button', { name: '起源岛' }))
  for (const n of ORIGIN_ISLAND.nodes) {
    expect(screen.getByRole('button', { name: n.title })).toBeInTheDocument()
  }
  expect(screen.getByTestId('character')).toBeInTheDocument()

  // ③ 节点1可玩:学一学翻页 + 试一试做错有反馈、做对过关(⑨ 面板标注 easy-vibe 来源章节)
  await openNode('学习地图')
  expect(screen.getByText(/来自 easy-vibe: learning-map/)).toBeInTheDocument()
  expect(screen.getByText(/什么是 Vibe Coding/)).toBeInTheDocument()
  await readCardsAndStartChallenge()
  await user.click(screen.getByRole('button', { name: '用更快的打字速度写代码' }))
  expect(screen.getByText(/不对/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /主要靠和 AI 对话/ }))
  expect(screen.getByText(/答对了/)).toBeInTheDocument()
  await closePanel()

  // ④ 过关后:金币+10、节点1✅不可点、节点2解锁、小人移动到节点2、成就「启程者」
  expect(screen.getByText('🪙 10')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '学习地图' })).toHaveAttribute('aria-disabled', 'true')
  expect(screen.getByRole('button', { name: '找到好点子' })).toHaveAttribute('aria-disabled', 'false')
  expect(screen.getByTestId('character')).toHaveStyle({ left: '32%' })
  expect(screen.getByText(/启程者/)).toBeInTheDocument()

  // 主线 2:提示词锻造铺(prompt-forge):三锤全中(一次全对 → 星星)
  await openNode('找到好点子')
  await readCardsAndStartChallenge()
  await user.click(screen.getByRole('button', { name: /横切人群/ }))
  await user.click(screen.getByRole('button', { name: /说出担忧,并要求规划 MVP/ }))
  await user.click(screen.getByRole('button', { name: /设定验证指标/ }))
  expect(screen.getByText(/锻出神器/)).toBeInTheDocument()
  await closePanel()

  // 主线 3:match
  await openNode('AI IDE 入门')
  await readCardsAndStartChallenge()
  await user.selectOptions(screen.getByLabelText('配对-端口 (Port)'), '同一栋大楼里每个房间的门牌号')
  await user.selectOptions(screen.getByLabelText('配对-localhost'), '"这台电脑自己"')
  await user.selectOptions(screen.getByLabelText('配对-前端'), '用户看得见、点得到的"店面和店员"')
  await user.selectOptions(screen.getByLabelText('配对-后端'), '服务器上看不见的"仓库和账本系统"')
  await user.click(screen.getByRole('button', { name: '提交' }))
  expect(screen.getByText(/全部配对正确/)).toBeInTheDocument()
  await closePanel()

  // 主线 4:原型积木台(proto-builder):放对全部必选块(此时 3 星 → 满分学霸)
  await openNode('搭建原型')
  await readCardsAndStartChallenge()
  const place = async (block: RegExp, slot: string) => {
    await user.click(screen.getByRole('button', { name: block }))
    await user.click(screen.getByRole('button', { name: slot }))
  }
  await place(/标题栏/, '槽-顶栏')
  await place(/商品信息表单/, '槽-输入区')
  await place(/图片上传/, '槽-输入区')
  await place(/批量生成按钮/, '槽-操作区')
  await place(/图文草稿列表/, '槽-结果区')
  await place(/模板库/, '槽-侧栏')
  await user.click(screen.getByRole('button', { name: '检查原型' }))
  expect(screen.getByText(/原型结构达标/)).toBeInTheDocument()
  await closePanel()
  expect(screen.getByText(/满分学霸/)).toBeInTheDocument()

  // 主线 5:match
  await openNode('集成 AI 能力')
  await readCardsAndStartChallenge()
  await user.selectOptions(screen.getByLabelText('配对-DeepSeek'), '文本生成 LLM(让应用真正写出文案)')
  await user.selectOptions(screen.getByLabelText('配对-Qwen3 VL'), '图像理解/看图说话(上传商品图生成卖点)')
  await user.selectOptions(screen.getByLabelText('配对-Seedream 即梦'), '图像生成与编辑(文生图、做电商海报)')
  await user.selectOptions(screen.getByLabelText('配对-API Key'), '"通行证+钱包钥匙"(泄露会被别人花钱)')
  await user.click(screen.getByRole('button', { name: '提交' }))
  await closePanel()

  // ⑤ 宝箱:开 1 个得「寻宝者」,开满 4 个得「集邮册」
  await openNode('双钻模型')
  await readCardsAndStartChallenge()
  await solveTrueFalse([true, false, true, false])
  await closePanel()
  expect(screen.getByText(/寻宝者/)).toBeInTheDocument()

  // Mom Test → 老妈访谈屋(npc-dialog):连选 3 张有效问题卡
  await openNode('Mom Test')
  await readCardsAndStartChallenge()
  await user.click(screen.getByRole('button', { name: /最近一次想恢复锻炼/ }))
  await user.click(screen.getByRole('button', { name: /你现在是怎么解决产后恢复/ }))
  await user.click(screen.getByRole('button', { name: /花过钱吗/ }))
  expect(screen.getByText(/情报集齐/)).toBeInTheDocument()
  await closePanel()

  await openNode('JTBD')
  await readCardsAndStartChallenge()
  await user.click(screen.getByRole('button', { name: /用户当前所有可接受的替代方案/ }))
  await closePanel()

  // 常见报错 → 报错急诊室(error-er):按方法论走对全部诊断路径
  await openNode('常见报错')
  await readCardsAndStartChallenge()
  await user.click(screen.getByRole('button', { name: '描述现象 + 截图,直接丢给 AI' }))
  await user.click(screen.getByRole('button', { name: 'Console 标签里的红色报错信息' }))
  await user.click(screen.getByRole('button', { name: '刚才做了什么 + 现在看到什么 + 想要什么效果' }))
  await user.click(screen.getByRole('button', { name: '描述现象 + 截图,直接问 AI' }))
  await user.click(screen.getByRole('button', { name: /Network 面板:重新操作一遍/ }))
  expect(screen.getByText(/治愈出院/)).toBeInTheDocument()
  await closePanel()
  expect(screen.getByText(/集邮册/)).toBeInTheDocument()

  // ⑥ 通关:最后一个主线 → 烟花 + 起源岛主 + 解锁进阶之海
  await openNode('完整项目实战')
  await readCardsAndStartChallenge()
  await user.click(screen.getByRole('button', { name: /人工在后台手动改数据来模拟 AI 返回/ }))
  expect(screen.getByTestId('celebration')).toBeInTheDocument()
  expect(screen.getByText(/起源岛通关/)).toBeInTheDocument()
  expect(screen.getByText(/起源岛主/)).toBeInTheDocument()

  // 烟花结束自动回大地图;进阶之岛已解锁可进入(占位)
  const sea2 = await screen.findByRole('button', { name: '进阶之岛' }, { timeout: 5000 })
  await user.click(sea2)
  expect(screen.getByText(/新海域已解锁/)).toBeInTheDocument()

  // 金币总数:6×10 + 4×5 = 80
  expect(screen.getByText('🪙 80')).toBeInTheDocument()

  // ⑧ 成就墙:9 个成就全部解锁,无 ???
  await user.click(screen.getByRole('button', { name: '🏆 成就' }))
  for (const name of ['启程者', '点子猎人', '工具大师', '原型师', '全能学徒', '寻宝者', '集邮册', '满分学霸', '起源岛主']) {
    expect(screen.getByText(name)).toBeInTheDocument()
  }
  expect(screen.queryByText('???')).not.toBeInTheDocument()

  // ⑦ 刷新不丢档:卸载重渲染(localStorage 仍在),金币/进度/成就保持
  unmount()
  const saved = JSON.parse(localStorage.getItem('vibe-islands-save')!)
  expect(saved.coins).toBe(80)
  expect(saved.achievements).toHaveLength(9)
  render(<App />)
  // HUD 与大地图各显示一处金币
  expect(screen.getAllByText('🪙 80').length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText('起源岛 6/6')).toBeInTheDocument()
}, 60000)
