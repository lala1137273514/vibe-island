# Vibe Coding 群岛 2.0 Phase A 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 1.0 的 2D 像素站升级为立体像素(voxel)浮空岛世界:程序化体素岛 3D 大地图与岛内场景、四种新创意玩法、BYOK AI 网关、Agent 对话创岛(本地保存),并落地「Voxel Stardew」设计系统与模块化架构。

**Architecture:** 单 Canvas 的 r3f 3D 呈现层(`engine3d/`)+ 纯逻辑域(`game/`)+ 可插拔玩法(`tasks/` 经注册表发现)+ 接口化外设(`services/`:saveService/aiGateway)+ 2D 像素 UI 组件库(`ui/`)。所有游戏关键交互都有 2D DOM 等价入口(岛屿罗盘 IslandDock、节点清单 NodeDrawer),3D 是增强层——保证 jsdom 可测、键盘可达、无 WebGL 环境有明确提示。

**Tech Stack:** 既有 Vite 8 + React 19 + TS + Vitest;新增 three / @react-three/fiber@9 / @react-three/drei@10 / @react-three/postprocessing@3 / simplex-noise / zod(全 MIT)。

**权威 spec:** `docs/superpowers/specs/2026-06-12-vibe-islands-2.0-design.md`。内容研究:`scratch/easy-vibe-stage1-notes.md`(章节原文提炼,含原文 URL)、`scratch/easy-vibe-gameplay-research.md`(玩法设计)、`scratch/voxel-assets-research.md`(3D 技术与素材)。

**单测约定(沿用 1.0):** 纯逻辑(判分函数/注册表/schema/网关配置/体素生成)严格 TDD 红→绿;视觉组件(3D 场景/对话面板)以「能渲染+关键交互冒烟+跑站验收」为准。新玩法内容必须取自 scratch 笔记中的真实 easy-vibe 要点,不许杜撰。

---

## 文件结构地图(目标态)

```
src/
├─ ui/                      # Task 2:像素组件库(唯一样式来源)
│  ├─ PixelPanel.tsx  PixelButton.tsx  PixelDialog.tsx  PixelToast.tsx  ProgressBar.tsx  index.ts
├─ game/                    # Task 3:纯逻辑域(零 React/零 IO)
│  ├─ gameLogic.ts(自 state/ 迁移)  achievements.ts(自 content/ 迁移)
│  ├─ taskRegistry.ts  taskRegistry.test.ts
│  └─ islandSchema.ts  islandSchema.test.ts        # Task 14
├─ tasks/                   # 每玩法一目录:组件+纯判分+测试
│  ├─ basic/(Quiz/TrueFalse/Match/FillPrompt 迁入)
│  ├─ error-er/    ErrorErTask.tsx  scoring.ts  scoring.test.ts        # Task 4
│  ├─ npc-dialog/  NpcDialogTask.tsx  scoring.ts  scoring.test.ts      # Task 5
│  ├─ prompt-forge/ PromptForgeTask.tsx  scoring.ts  scoring.test.ts   # Task 6
│  ├─ proto-builder/ ProtoBuilderTask.tsx  scoring.ts  scoring.test.ts # Task 7
│  ├─ TaskRenderer.tsx(改为注册表分发)                                  # Task 8
│  └─ registerAll.ts                                                    # Task 8
├─ services/                # 接口化外设
│  ├─ aiGateway.ts  aiGateway.test.ts               # Task 9
│  └─ saveService.ts  saveService.test.ts           # Task 10
├─ engine3d/                # 3D 呈现域(全部 lazy)
│  ├─ voxelGen.ts  voxelGen.test.ts                 # Task 11:纯函数体素生成
│  ├─ Scene3D.tsx(Canvas 壳:WebGL 检测/光照/Pixelation/场景切换)        # Task 12
│  ├─ VoxelIsland.tsx  WorldScene.tsx               # Task 12
│  └─ IslandScene.tsx  VoxelCharacter.tsx  NodeObject.tsx              # Task 13
├─ components/              # 2D overlay(保留/新增)
│  ├─ NodePanel.tsx  LearnCards.tsx  HUD.tsx  AchievementShelf.tsx  Celebration.tsx(保留)
│  ├─ IslandDock.tsx  NodeDrawer.tsx                # Task 12/13:DOM 等价入口
│  ├─ AiSettings.tsx                                # Task 9
│  └─ CreatorBay.tsx  IslandPreview.tsx             # Task 14
├─ creator/                 # Task 14:生成编排
│  ├─ generatePrompt.ts  createIslandFlow.ts  createIslandFlow.test.ts
├─ content/  types.ts(扩展 4 新任务类型)  stage1.ts(4 节点换新玩法)  islands.ts
└─ state/    useGameState.ts(多岛支持)  storage.ts(per-island key)
删除(Task 13 完成后):components/WorldMap.tsx、Island.tsx、NodeMarker.tsx、Character.tsx 及其测试(被 3D + Dock/Drawer 取代)。
```

---

## Task 1: 依赖与地基

**Files:** Modify `package.json`、`src/styles/tokens.css`

- [x] **Step 1:** 安装依赖:
```bash
pnpm add three @react-three/fiber@^9 @react-three/drei@^10 @react-three/postprocessing simplex-noise zod
pnpm add -D @types/three
```
- [x] **Step 2:** `tokens.css` `:root` 内追加 `--c-stone:#7a7a72;`。
- [x] **Step 3:** 验证:`pnpm test` 全绿、`pnpm build` 成功(新依赖未引用,仅确认安装无冲突)。
- [x] **Step 4:** 提交 `chore: add 3d/ai deps + stone token`。

## Task 2: ui/ 像素组件库

**Files:** Create `src/ui/PixelPanel.tsx`、`PixelButton.tsx`、`PixelDialog.tsx`、`PixelToast.tsx`、`ProgressBar.tsx`、`index.ts`;Modify 现有组件改用之。

- [x] **Step 1:** 实现五组件(薄封装现有 CSS 类,统一 API):
```tsx
// PixelPanel.tsx
export function PixelPanel({ className = '', children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`pixel-panel ${className}`} {...rest}>{children}</div>
}
// PixelButton.tsx
export function PixelButton({ className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`pixel-btn ${className}`} {...rest} />
}
// PixelDialog.tsx — 模态:overlay 点击关闭,内容 stopPropagation
export function PixelDialog({ onClose, children, className = '' }:
    { onClose: () => void; children: React.ReactNode; className?: string }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`pixel-panel ${className}`} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}
// PixelToast.tsx
export function PixelToast({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <div className="toast" onClick={onClick}>{children}</div>
}
// ProgressBar.tsx
export function ProgressBar({ ratio, label }: { ratio: number; label?: string }) {
  return <div className="progressbar" aria-label={label}><div style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }} /></div>
}
// index.ts 统一导出
```
- [x] **Step 2:** 把 `NodePanel`/`AchievementShelf`/`HUD`/`WorldMap`/`Celebration`/4 个 basic 任务组件里的裸 `className="pixel-btn"`、`pixel-panel`、`modal-overlay`、`toast`、`progressbar` 用法替换为组件库调用(行为不变)。
- [x] **Step 3:** `pnpm test` 全绿(既有 31 测试不改断言)。
- [x] **Step 4:** 提交 `refactor: extract pixel ui kit`。

## Task 3: game/ 纯逻辑域重组 + 任务注册表(TDD)

**Files:** Move `src/state/gameLogic.ts→src/game/gameLogic.ts`、`src/content/achievements.ts→src/game/achievements.ts`(测试同步移动);Create `src/game/taskRegistry.ts`、`taskRegistry.test.ts`;Modify 全部 import 路径。

- [x] **Step 1:** `git mv` 迁移四文件,更新所有 import(`useGameState`、各任务组件、AchievementShelf、App、测试)。`pnpm test` 全绿。
- [x] **Step 2:** 写注册表失败测试:
```ts
import { it, expect } from 'vitest'
import { registerTask, getTaskPlugin, listTaskTypes } from './taskRegistry'
const Dummy = () => null
it('注册后可按 type 取回,重复注册报错,未注册取用报错', () => {
  registerTask({ type: 'quiz', Component: Dummy })
  expect(getTaskPlugin('quiz').Component).toBe(Dummy)
  expect(listTaskTypes()).toContain('quiz')
  expect(() => registerTask({ type: 'quiz', Component: Dummy })).toThrow(/已注册/)
  expect(() => getTaskPlugin('match')).toThrow(/未注册/)
})
```
- [x] **Step 3:** 跑红 → 实现:
```ts
import type { ComponentType } from 'react'
import type { NodeTask, TaskType } from '../content/types'
export interface TaskPlugin {
  type: TaskType
  Component: ComponentType<{ task: never; onResult: (correct: boolean) => void }>
}
const plugins = new Map<TaskType, TaskPlugin>()
export function registerTask(p: TaskPlugin) {
  if (plugins.has(p.type)) throw new Error(`任务类型已注册: ${p.type}`)
  plugins.set(p.type, p)
}
export function getTaskPlugin(type: TaskType): TaskPlugin {
  const p = plugins.get(type)
  if (!p) throw new Error(`任务类型未注册: ${type}`)
  return p
}
export function listTaskTypes(): TaskType[] { return [...plugins.keys()] }
export function resetRegistry() { plugins.clear() }   // 仅测试用
```
(`Component` 的 task 形参用插件内部窄化;测试里 beforeEach `resetRegistry()`。)
- [x] **Step 4:** 跑绿 → 提交 `refactor: game domain + task registry`。

## Task 4: 玩法「报错急诊室」error-er(TDD)

**Files:** Modify `src/content/types.ts`;Create `src/tasks/error-er/scoring.ts`、`scoring.test.ts`、`ErrorErTask.tsx`;Modify `src/content/stage1.ts`(origin-t4 换玩法)。

- [x] **Step 1:** types.ts 增加(并入 `NodeTask`/`TaskAnswer` 联合、`TaskType`):
```ts
export interface ErrorStep {
  prompt: string
  options: { text: string; correct: boolean; feedback: string }[]
}
export interface ErrorCase { symptom: string; steps: ErrorStep[] }
export interface ErrorErTask { type: 'error-er'; intro: string; cases: ErrorCase[] }
// TaskAnswer 增:{ type: 'error-er'; picks: number[][] }   // picks[case][step] = 选项下标
```
- [x] **Step 2:** 失败测试(`scoring.test.ts`):
```ts
import { it, expect } from 'vitest'
import { scoreErrorRun } from './scoring'
import type { ErrorErTask } from '../../content/types'
const t: ErrorErTask = { type:'error-er', intro:'', cases:[{ symptom:'白屏', steps:[
  { prompt:'第一步?', options:[{text:'先截图问AI',correct:true,feedback:''},{text:'先开F12',correct:false,feedback:'原文:不要急着打开F12'}] },
  { prompt:'AI要更多信息,看哪?', options:[{text:'Console',correct:true,feedback:''},{text:'Network',correct:false,feedback:''}] },
]}]}
it('全对 pass+perfect', () => expect(scoreErrorRun(t,[[0,0]])).toEqual({ pass:true, perfect:true, mistakes:0 }))
it('错 1 步仍可过(mistakes<3)但非 perfect', () => expect(scoreErrorRun(t,[[1,0]])).toEqual({ pass:true, perfect:false, mistakes:1 }))
it('错满 3 步判失败', () => {
  const t3 = { ...t, cases:[{...t.cases[0], steps:[...t.cases[0].steps, ...t.cases[0].steps, ...t.cases[0].steps]}]}
  expect(scoreErrorRun(t3,[[1,1,1,0,0,0]]).pass).toBe(false)
})
```
判定语义:`picks` 是玩家每步**最终选择**前的错误次数由组件累计——简化为:`picks[i][j]` 为该步首选下标;错误选择计 1 mistake 且组件强制重选直至正确;`pass = mistakes < 3`,`perfect = mistakes === 0`。
- [x] **Step 3:** 跑红 → 实现 `scoring.ts`(纯函数,按上述语义统计 mistakes)→ 跑绿。
- [x] **Step 4:** 实现 `ErrorErTask.tsx`:急诊室面板(病床 emoji 🤖 病人 + 症状卡 + 步骤选项按钮);选错显示 feedback(扣 1 HP,❤️×3 显示),选对进下一步;全 case 完成调 `onResult(pass)`(perfect 经 TaskRenderer 首试机制自然映射 star)。冒烟测试并入 Step 5 文件:渲染症状文案、点正确路径到底触发 `onResult(true)`。
- [x] **Step 5:** `stage1.ts` origin-t4 的 task 换为 error-er:**内容取自 scratch 笔记 appendix-b-common-errors 节**——2 个病例:①页面白屏(正确路径:先描述+截图问AI→AI 要更多信息→Console 截红字);②数据保存失败(先问AI→Network 面板重操作截请求/返回)。错误选项的 feedback 引用原文要点(如「不要急着打开 F12」)。learn 卡保持不变。
- [x] **Step 6:** `pnpm test` 全绿 → 提交 `feat: error-er gameplay (ER triage)`。

## Task 5: 玩法「老妈访谈屋」npc-dialog 卡牌模式(TDD)

**Files:** Modify `types.ts`;Create `src/tasks/npc-dialog/scoring.ts`、`scoring.test.ts`、`NpcDialogTask.tsx`;Modify `stage1.ts`(origin-t2)。

- [x] **Step 1:** types:
```ts
export interface DialogCard { question: string; valid: boolean; reply: string; lesson: string }
export interface NpcDialogTask {
  type: 'npc-dialog'; npcName: string; scenario: string
  rounds: { cards: DialogCard[] }[]              // 每轮 3 张卡
  goal: { validNeeded: number; maxViolations: number }   // 3 / 3
}
// TaskAnswer 增:{ type: 'npc-dialog'; picks: number[] }
```
- [x] **Step 2:** 失败测试:`evalDialogPicks(task, picks)` → `{ collected, violations, done(pass|fail|ongoing) }`;用 4 轮卡(valid 分布 [真,假,真,真])断言:选 3 valid → pass;选 3 invalid → fail;中途 → ongoing。
- [x] **Step 3:** 红 → 实现纯函数 → 绿。
- [x] **Step 4:** `NpcDialogTask.tsx`:像素对话屋(NPC 头像 emoji 👵 + 台词气泡 + 3 张问题卡按钮);选卡后展示 NPC 回应 + lesson 点评(有效情报 +📋,违规 +⚠️);进度条「情报 x/3,违规 y/3」;pass→`onResult(true)`,fail→`onResult(false)` 并可重开。**预留**:面板底部「✍️ 自由提问(需接入 AI)」入口,Task 9 启用。冒烟:渲染 scenario、选有效卡推进、集满 3 触发 onResult(true)。
- [x] **Step 5:** origin-t2 内容:**取自 scratch 笔记 appendix-mom-test 节的问废 vs 有价值对照表**——scenario「你想做产后妈妈恢复 APP,去验证需求」;5 轮卡,有效卡如「最近一次遇到这个问题是什么时候?」「你现在怎么处理?」「为此花过钱吗?」,违规卡如「你觉得我这个想法怎么样?」「如果有你会用吗?」;reply/lesson 按原文规则写(夸奖=礼貌不是数据等)。
- [x] **Step 6:** 全绿 → 提交 `feat: npc-dialog gameplay (Mom Test interview)`。

## Task 6: 玩法「提示词锻造铺」prompt-forge 基础模式(TDD)

**Files:** Modify `types.ts`;Create `src/tasks/prompt-forge/scoring.ts`、`scoring.test.ts`、`PromptForgeTask.tsx`;Modify `stage1.ts`(origin-2)。

- [x] **Step 1:** types:
```ts
export interface ForgeRound { options: { text: string; effective: boolean; why: string }[] }
export interface PromptForgeTask {
  type: 'prompt-forge'; brief: string; basePrompt: string
  forgeRounds: ForgeRound[]                       // 3 轮,每轮 3 选 1
  rubric: string[]                                // 实战模式评分要点(Task 9 用)
  exampleGood: string                             // 过关后展示的参考提示词(取自原文模板)
}
// TaskAnswer 增:{ type: 'prompt-forge'; picks: number[] }
```
- [x] **Step 2:** 失败测试:`scoreForge(task, picks)` → `{ level, pass, perfect }`;level=有效选择数;`pass = level >= 2`,`perfect = level === 3`。
- [x] **Step 3:** 红 → 实现 → 绿。
- [x] **Step 4:** `PromptForgeTask.tsx`:铁匠铺面板——当前提示词展示区(生铁→精铁→神器,炉火 emoji 随 level 变 🔥🔥🔥),每轮 3 个锻打选项;选有效项提示词文本实时变长变好(把选项文本拼进 basePrompt 展示);3 轮完按 scoreForge 调 `onResult(pass)`;过关展示 exampleGood 对照。**预留**「⚒️ 实战模式(需接入 AI)」入口。冒烟:3 轮全选有效 → onResult(true)。
- [x] **Step 5:** origin-2 内容:**取自 scratch 笔记 finding-great-idea 节**——brief「把模糊点子磨成能发给 AI 的提示词」;basePrompt「帮我做一个健身 APP」;3 轮有效项=加目标人群(产后妈妈)/加担忧与验证(MVP+付费验证指标)/加输出格式(行动计划),干扰项=「要求更华丽的辞藻」「让 AI 夸我点子好」等违背原文方法论的选项;exampleGood 用原文模板「我想做一个[产品概念],但我担心[担忧]。请帮我:1.规划一个 MVP…4.设定验证指标」;rubric=['说清产品概念与目标人群','说出担忧/风险','要求 MVP 规划','要求验证指标']。
- [x] **Step 6:** 全绿 → 提交 `feat: prompt-forge gameplay (smithy)`。

## Task 7: 玩法「原型积木台」proto-builder(TDD)

**Files:** Modify `types.ts`;Create `src/tasks/proto-builder/scoring.ts`、`scoring.test.ts`、`ProtoBuilderTask.tsx`;Modify `stage1.ts`(origin-4)。

- [x] **Step 1:** types:
```ts
export interface ProtoBlock { id: string; label: string; emoji: string; distractor?: boolean }
export interface ProtoSlot { id: string; label: string; accepts: string[] }   // accepts=该槽必须集齐的 block id
export interface ProtoBuilderTask {
  type: 'proto-builder'; brief: string; slots: ProtoSlot[]; blocks: ProtoBlock[]
}
// TaskAnswer 增:{ type: 'proto-builder'; placement: Record<string, string[]> }  // slotId→放入的 blockId
```
- [x] **Step 2:** 失败测试:`scoreProto(task, placement)` → `{ pass, perfect, missing, extras }`;pass=每槽 accepts 全命中;perfect=pass 且未放任何 distractor;断言三例(全对/缺块/放了干扰块)。
- [x] **Step 3:** 红 → 实现 → 绿。
- [x] **Step 4:** `ProtoBuilderTask.tsx`:需求卡(brief)+ 页面线框(slots 纵向排布的虚线槽)+ 底部积木栏;交互用**点选-放置**(点积木选中→点槽放入;槽内积木可点移除)——比拖拽简单且触屏/键盘可达,jsdom 可测;「检查原型」按钮调 scoreProto → onResult;未过显示 missing/extras 像素批注。冒烟:正确放置全部必选块 → onResult(true)。
- [x] **Step 5:** origin-4 内容:**取自 scratch 笔记 building-prototype 节电商素材工作台案例**——brief 引用「批量做图做文案太费劲+好方案存不下来」两痛点;slots:顶栏(accepts:[标题栏])、输入区(accepts:[商品信息表单,图片上传])、操作区(accepts:[批量生成按钮])、结果区(accepts:[图文草稿列表])、侧栏(accepts:[模板库]);blocks 含上述必选块+干扰块(会员充值弹窗、3D 商品展厅、积分商城——原文「大而全没人用」反例);learn 卡不变。
- [x] **Step 6:** 全绿 → 提交 `feat: proto-builder gameplay (blueprint bench)`。

## Task 8: 注册表接入与 basic 玩法归位

**Files:** Move 4 个 basic 任务组件 → `src/tasks/basic/`;Create `src/tasks/registerAll.ts`;Modify `src/tasks/TaskRenderer.tsx`、`src/main.tsx`。

- [x] **Step 1:** `git mv` QuizTask/TrueFalseTask/MatchTask/FillPromptTask(+tasks.test.tsx)到 `src/tasks/basic/`,改 import。
- [x] **Step 2:** `registerAll.ts`:对 8 种 type 各调一次 `registerTask`(幂等防 HMR:已注册则跳过——用 `listTaskTypes().includes(type)` 守卫,这是模块加载幂等性不是兜底);`main.tsx` 顶部 `import './tasks/registerAll'`。
- [x] **Step 3:** `TaskRenderer.tsx` 改为注册表分发(保留 firstTry→star 逻辑):
```tsx
const plugin = getTaskPlugin(task.type)
return <plugin.Component task={task as never} onResult={handleResult} />
```
测试文件顶部同样 import registerAll。
- [x] **Step 4:** `pnpm test` 全绿、`tsc --noEmit` 无错 → 提交 `refactor: registry-driven task rendering`。

## Task 9: AiGateway(BYOK)+ 设置面板 + 两玩法 AI 模式

**Files:** Create `src/services/aiGateway.ts`、`aiGateway.test.ts`、`src/components/AiSettings.tsx`;Modify `NpcDialogTask.tsx`、`PromptForgeTask.tsx`、`HUD.tsx`(设置入口 ⚙️)。

- [x] **Step 1:** 失败测试(配置纯逻辑,fetch 用 vi.stubGlobal mock):
```ts
import { it, expect, vi, beforeEach } from 'vitest'
import { loadAiConfig, saveAiConfig, hasAiConfig, chat } from './aiGateway'
beforeEach(() => localStorage.clear())
it('无配置 hasAiConfig=false;存取 roundtrip', () => {
  expect(hasAiConfig()).toBe(false)
  saveAiConfig({ baseURL:'https://api.deepseek.com', apiKey:'sk-x', model:'deepseek-chat' })
  expect(hasAiConfig()).toBe(true)
  expect(loadAiConfig()!.model).toBe('deepseek-chat')
})
it('chat 拼 OpenAI 兼容请求并取回内容;HTTP 错误原样抛出', async () => {
  saveAiConfig({ baseURL:'https://api.deepseek.com', apiKey:'sk-x', model:'deepseek-chat' })
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ choices:[{ message:{ content:'你好' } }] }), { status:200 })))
  expect(await chat([{ role:'user', content:'hi' }])).toBe('你好')
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":{"message":"bad key"}}', { status:401 })))
  await expect(chat([{ role:'user', content:'hi' }])).rejects.toThrow(/401/)
})
```
- [x] **Step 2:** 红 → 实现:key `vibe-islands-ai`;`chat()` POST `${baseURL}/chat/completions`,headers Bearer,body `{model, messages, temperature?}`;非 2xx `throw new Error(\`AI 调用失败 HTTP ${status}: ${正文摘要}\`)`;无配置调用 chat 直接 throw「未配置 AI」→ 绿。
- [x] **Step 3:** `AiSettings.tsx`(PixelDialog):三输入框(baseURL 预填 `https://api.deepseek.com`、apiKey、model 预填 `deepseek-chat`)+「测试连接」按钮(发一条 `ping` 消息,成功✅/失败原样显示错误)+ DeepSeek 注册指引一行(呼应教程第 5 章);HUD 加 ⚙️ 按钮开关。冒烟:填表保存后 localStorage 有值。
- [x] **Step 4:** 接入玩法 AI 模式:
  - NpcDialog 自由模式:`hasAiConfig()` 时显示输入框;玩家提问 → `chat` 两段式:系统提示词让 LLM ①以「老妈」人设回答 ②末行输出 `JUDGE: valid|invalid`(按 Mom Test 规则判该问题);解析尾行计入 collected/violations,解析失败则把原始输出展示并提示重试(不猜测判定)。
  - PromptForge 实战模式:玩家写完整提示词 → `chat` 让 LLM 按 task.rubric 逐条打分,末行输出 `SCORE: n/5`;≥3 过关、=5 给星;解析失败同上策略。
  - 两处无配置时显示「先到 ⚙️ 设置接入 AI(免费 DeepSeek Key 也行)」。
- [x] **Step 5:** 全绿 → 提交 `feat: BYOK ai gateway + settings + ai modes`。

## Task 10: SaveService(多岛存档)

**Files:** Create `src/services/saveService.ts`、`saveService.test.ts`;Modify `src/state/storage.ts`、`useGameState.ts`。

- [x] **Step 1:** 失败测试:`LocalSaveService`:`loadSave('origin')` 用 legacy key `vibe-islands-save`(兼容 1.0 存档);`loadSave('my-isle')` 用 `vibe-islands-save:my-isle`;`listCustomIslands/saveCustomIsland/deleteCustomIsland` 读写 `vibe-islands-custom`(`{ def: IslandDef; seed: number; palette: string; createdAt: string }[]`,按 def.id 去重覆盖)。
- [x] **Step 2:** 红 → 实现(接口 + Local 实现;`storage.ts` 改为接受 key 参数的底层读写)→ 绿。
- [x] **Step 3:** `useGameState(island)` 改用 saveService 按 `island.id` 读写;origin 行为与 1.0 完全一致(回归:既有 hook 测试不改断言,仅 import 调整)。
- [x] **Step 4:** 全绿 → 提交 `feat: per-island save service`。

## Task 11: 体素岛生成器 voxelGen(TDD)

**Files:** Create `src/engine3d/voxelGen.ts`、`voxelGen.test.ts`。

- [x] **Step 1:** 失败测试:
```ts
import { it, expect } from 'vitest'
import { generateIsland } from './voxelGen'
it('确定性:同 seed 同输出;不同 seed 不同', () => {
  const a = generateIsland({ seed: 42, radius: 8 })
  expect(generateIsland({ seed: 42, radius: 8 }).voxels).toEqual(a.voxels)
  expect(generateIsland({ seed: 7, radius: 8 }).voxels).not.toEqual(a.voxels)
})
it('结构:有体素;顶层为草色;底部有倒锥(y<0);surfaceY 返回岛面高度', () => {
  const isle = generateIsland({ seed: 1, radius: 8 })
  expect(isle.voxels.length).toBeGreaterThan(100)
  expect(isle.voxels.some(v => v.y < 0)).toBe(true)
  const top = isle.voxels.filter(v => v.x === 0 && v.z === 0).sort((p, q) => q.y - p.y)[0]
  expect(top.color).toBe('#5fa64d')
  expect(isle.surfaceY(0, 0)).toBe(top.y)
})
```
- [x] **Step 2:** 红 → 实现:`createNoise2D(seedFn)`(simplex-noise 接受自定义 random,用 mulberry32(seed) 保确定性);高度场 `h = base + noise*amp`,径向衰减 `falloff = max(0, 1 - (r/radius)^2)`;地表以上逐层填体素:顶层 `--c-grass` 值 `#5fa64d`、其下 2 层 `#8a5a3c` 泥土、再下 `#7a7a72` 岩石;底部倒锥:y<0 时半径线性收缩,填岩石,尖底;边缘随机点缀 `#e6c47a` 沙色;返回 `{ voxels: {x,y,z,color}[], surfaceY(x,z), radius }`。装饰(树=干1×2+叶3×3×2、花、石)由 `decor: boolean` 开关生成,同色板。→ 绿。
- [x] **Step 3:** 提交 `feat: deterministic voxel island generator`。

## Task 12: 3D 壳 + WorldScene(大地图)

**Files:** Create `src/engine3d/Scene3D.tsx`、`VoxelIsland.tsx`、`WorldScene.tsx`、`src/components/IslandDock.tsx`;Modify `App.tsx`、`pixel.css`(loading 页样式)。

**职责与规格(视觉层,冒烟+跑站验收):**
- `VoxelIsland`:props `{ seed, radius?, decor?, spin? }`;一个 `InstancedMesh`(BoxGeometry 共享,`setColorAt` 上色,`MeshLambertMaterial flatShading`);`useFrame` 自转(spin 默认 0.08 rad/s)+ drei `<Float speed={1} floatIntensity={0.3}>`。
- `Scene3D`:`<Canvas>` 壳——`supportsWebGL()` 检测(`document.createElement('canvas').getContext('webgl2'||'webgl')`),不支持时渲染像素提示面板「此浏览器不支持 WebGL,无法显示 3D 世界」(明确能力边界);内含暖色 DirectionalLight(#fff4d6, intensity 2.2)+ AmbientLight 0.7、`<EffectComposer><Pixelation granularity={5}/></EffectComposer>`、场景组切换(world/island 两 group 按 props.scene 显隐 + CameraRig 相机 lerp 飞行)。整体由 App `React.lazy` 引入,Suspense fallback 为像素加载页(⛵ 出航中…)。
- `WorldScene`:云海背景(大平面+雾色 `--c-sea-dark` 渐变,天空 `color` 背景);布阵:起源岛(seed 固定 1001)、进阶岛、大师岛、创造湾(seed 2002,码头色)、用户岛(来自 saveService,环形排开);锁定岛罩半透明体素云块+🔒 sprite;悬停 scale 1.05+变亮(onPointerOver);点击解锁岛 → 相机飞向 → `onEnter(id)`;点击锁定岛 → `onLockedClick()`。
- `IslandDock.tsx`(2D overlay,DOM 等价入口):底部像素码头条,列出全部岛(名称+状态:▶可玩/🔒/✨创造湾/🏝我的岛),按钮 aria-label=岛名,点击行为与 3D 点击一致。**1.0 验收测试的「起源岛/进阶之岛」按钮语义由 Dock 延续。**

- [x] **Step 1:** 实现四组件 + App 接入(scene state 'world'|'island';WorldMap 替换为 Scene3D+IslandDock;暂时进岛仍用旧 2D Island,Task 13 替换)。
- [x] **Step 2:** 冒烟测试:jsdom 无 WebGL → Scene3D 渲染能力提示而不崩;IslandDock 渲染全部岛、点「起源岛」触发 onEnter、点锁定岛弹 toast。`pnpm test` 全绿。
- [x] **Step 3:** `pnpm dev` 真浏览器自检:浮空岛群可转/可拖/可点,像素颗粒感生效。提交 `feat: 3d world scene with voxel floating islands`。

## Task 13: IslandScene(岛内 3D)+ App 集成 v2

**Files:** Create `src/engine3d/IslandScene.tsx`、`NodeObject.tsx`、`VoxelCharacter.tsx`、`src/components/NodeDrawer.tsx`;Modify `App.tsx`、`Scene3D.tsx`;Delete `components/WorldMap.tsx`、`Island.tsx`、`NodeMarker.tsx`、`Character.tsx` 及对应测试;Modify `src/App.test.tsx`、`src/acceptance.test.tsx`。

**规格:**
- `IslandScene`:放大版 VoxelIsland(radius 14,decor 开);节点物件按 `position{x,z}`(内容坐标 0..100 映射到岛面格,y=surfaceY)落在岛上;返回按钮(2D)。
- `NodeObject`:营火/宝箱体素组合(几个 Box 拼);三态:locked 灰暗、available 金色光柱(竖直半透明 Box 脉动)+浮动 ▼、done 升小旗+✅ sprite;onClick→onOpenNode(同 NodeDrawer)。
- `VoxelCharacter`:5 段体素小人(头肤色/身红/腿蓝,同 1.0 配色),站位=当前 available(或最后 done)节点;移动用位置 lerp+抛物线跳跃(useFrame)。
- `NodeDrawer`(2D overlay):右侧抽屉列出该岛全部节点(title+状态 emoji),aria-label=节点 title,点击可开 NodePanel——**1.0 验收测试的节点按钮语义由 Drawer 延续**;锁定节点 aria-disabled。
- `position` 类型:`{ x: number; y: number }` 重命名语义为岛面平面坐标(x→x, y→z),**类型与内容数据不改字段名**(避免大改),engine3d 内部映射 `z = position.y`。

- [x] **Step 1:** 实现组件,App 全量接线(world↔island 镜头切换;NodePanel/HUD/Shelf/Celebration/Toast 全保留)。
- [x] **Step 2:** 删除旧 2D 场景四组件与其测试;App.test/acceptance.test 改走 IslandDock+NodeDrawer(按钮 aria 语义不变,断言基本不动:进岛后节点列表在 Drawer 中)。
- [x] **Step 3:** `pnpm test` 全绿(验收测试完整通关流程仍过)+ `pnpm dev` 自检(进岛镜头飞入、小人跳点、节点三态)。提交 `feat: 3d island scene + integration, drop 2d scenes`。

## Task 14: Agent 创岛(CreatorBay)

**Files:** Create `src/game/islandSchema.ts`、`islandSchema.test.ts`、`src/creator/generatePrompt.ts`、`src/creator/createIslandFlow.ts`、`createIslandFlow.test.ts`、`src/components/CreatorBay.tsx`、`IslandPreview.tsx`;Modify `App.tsx`、`WorldScene.tsx`(用户岛已在 Task 12 预留)。

- [x] **Step 1(TDD schema):** 失败测试:合法 IslandDef(quiz/truefalse/match/fill-prompt 四类任务、2~4 learn 卡、id 形如 `<islandId>-n`)通过;非法(空 learn、answerIndex 越界、未知 type、节点数<3)逐个拒绝且错误信息含字段路径。实现:zod discriminatedUnion 四任务 + GameNode/IslandDef 校验器 `validateGeneratedIsland(json: unknown): IslandDef`(throw ZodError)。红→绿。
- [x] **Step 2(生成提示词):** `generatePrompt.ts` 导出系统提示词模板:角色=教学关卡设计师;输出**仅一个 ```json 围栏**;硬约束:任务 type 限四基础类、每节点 learn 2~4 张(每张 title+100~200字 body)、quiz 4 选项、match 4 对、节点 3~6 个主线(order 1..n)+0~2 宝箱、coins 主线10宝箱5、position 在 0..100 网格沿 S 形、内容必须围绕用户主题且**自我标注**:island.name 后缀不加,但 def 内 `id` 前缀 `custom-`,UI 展示「AI 生成」徽标。
- [x] **Step 3(TDD 编排):** `createIslandFlow.ts`:`async generateIsland(userBrief, chatFn)`:①拼消息调 chatFn;②提取 ```json 围栏(无围栏视为失败);③`validateGeneratedIsland`;④失败把 ZodError 文本回喂 chatFn 重试 **一次**;⑤再失败 throw(错误带两轮原始输出摘要)。测试用 stub chatFn:首次返回坏 JSON、二次返回好 JSON → 成功;两次都坏 → throw。红→绿。
- [x] **Step 4(UI):** `CreatorBay.tsx`(PixelDialog 全屏):对话区(轮次气泡)+ 输入框;流程:用户描述主题 → AI 追问一轮(普通 chat)→ 用户补充 → 点「⚒️ 开始生成」走 generateIsland(转圈像素动画)→ 成功进预览;`IslandPreview.tsx`:左 3D `VoxelIsland(seed=hash(name))` 小画布 + 右节点清单(title/类型/卡数)+ palette 三选一(草绿/沙金/雪白——只调 voxelGen 顶层色)+「重新生成」「保存上岛」;保存走 saveService.saveCustomIsland → WorldScene 用户岛区出现,进入可玩(useGameState 已支持多岛)。无 AI 配置时 CreatorBay 显示接入引导。
- [x] **Step 5:** 冒烟:stub chatFn 注入(props 允许传 chatFn,默认 aiGateway.chat)走通生成→预览→保存;`pnpm test` 全绿。提交 `feat: agent island creator (CreatorBay)`。

## Task 15: 验收与构建

- [x] **Step 1:** 对照 spec 第 10 节逐条核验:更新 `src/acceptance.test.tsx` 覆盖新流程(四新玩法卡牌/基础模式通关、Dock/Drawer 导航、创岛 stub 流程、1.0 回归链条);`pnpm test` 全绿。
- [x] **Step 2:** `pnpm exec tsc --noEmit` 无错;`pnpm build` 成功;bundle 检查:3D chunk 独立(rollup 自动 split lazy 入口)。
- [x] **Step 3:** `pnpm dev` 真浏览器全流程自检(含 BYOK 实测一次 DeepSeek 调用,若用户环境无 Key 则记录待用户自测项)。
- [x] **Step 4:** 提交 `chore: phase A acceptance + build`。

## Task 16(可选增强,不阻塞 Phase A 验收): GLB 装饰点缀

- [ ] `scripts/fetch-assets.mjs` 改为「先抓 kenney.nl 资产页解析 `href='…zip'` 再下载」(Nature Kit/Blocky Characters),解压取少量 GLB 入 `public/assets/glb/`;`IslandScene` 装饰位检测到 GLB 时用 `useGLTF` 加载替换程序化树(程序化为本体,GLB 为增强);失败照旧 exit 0。提交 `feat: optional glb decorations`。

---

## 自检(对照 spec)

- **覆盖:** spec §2 设计系统(T1/T2)、§3 世界场景(T11/T12/T13)、§4 玩法(T4-T8)、§5 AI(T9)、§6 创岛(T14)、§7 接口预留(T10)、§8 架构(T2/T3/T8/T10 目录重组)、§10 验收(T15)。Phase B/C 不在本计划。
- **类型一致:** 新任务 type 字符串 `error-er/npc-dialog/prompt-forge/proto-builder` 全文一致;判分函数名 `scoreErrorRun/evalDialogPicks/scoreForge/scoreProto`;注册表 API `registerTask/getTaskPlugin/listTaskTypes/resetRegistry`;服务 API `loadAiConfig/saveAiConfig/hasAiConfig/chat`、`LocalSaveService`。
- **测试环境约束:** jsdom 不挂 Canvas(WebGL 检测短路),全部游戏流程经 Dock/Drawer/Panel DOM 可测——验收测试可迁移。
- **范围:** 16 个 Task,T16 可选;每个 Task 独立可验收、独立提交。
