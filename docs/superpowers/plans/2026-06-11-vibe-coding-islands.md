# Vibe Coding 群岛 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 datawhalechina/easy-vibe 教程做成星露谷像素风的「群岛闯关」教学落地页——MVP:群岛大地图(起源岛可玩,其余锁定占位)+ 起源岛 6 主线节点+4 隐藏宝箱完整可玩 + 成就/金币/存档系统。

**Architecture:** Vite + React + TypeScript 单页应用。两个场景 `WorldMap` ↔ `Island` 切换。全部进度走一个纯逻辑层(`gameLogic.ts`,无副作用、可单测)+ `useGameState` hook(包 localStorage)。内容即数据:节点定义在 `src/content/`,加新岛=加一个数据文件,组件零改动。像素美术用 Kenney CC0 素材,下载失败自动回退 CSS/SVG。

**Tech Stack:** Vite, React 18, TypeScript, Vitest + @testing-library/react, 原生 CSS(像素变量/`image-rendering:pixelated`)。

参考规格:`docs/superpowers/specs/2026-06-11-vibe-coding-islands-design.md`(权威来源,本计划与其一致)。

---

## 文件结构地图

```
vibe-islands/
├─ index.html
├─ package.json            vite/react/ts/vitest 脚本与依赖
├─ vite.config.ts          react 插件 + vitest 配置(jsdom)
├─ tsconfig.json
├─ public/assets/          Kenney 素材(脚本拉取;失败则空,走 CSS 回退)
├─ scripts/fetch-assets.mjs  拉取 CC0 素材脚本(含失败容错)
└─ src/
   ├─ main.tsx             React 挂载
   ├─ App.tsx              场景路由(map/island)+ 顶层 state 注入
   ├─ content/
   │  ├─ types.ts          所有领域类型(GameNode/IslandDef/NodeTask/...)
   │  ├─ achievements.ts   成就定义(id/name/desc/check)
   │  ├─ stage1.ts         起源岛真实内容(取自 easy-vibe Stage 1)
   │  └─ islands.ts        岛屿注册表(起源岛 + Stage2/3 占位)
   ├─ state/
   │  ├─ gameLogic.ts      纯函数:initSave/scoreTask/completeNode/earnedAchievements/openTreasure
   │  ├─ gameLogic.test.ts 纯逻辑单测
   │  ├─ storage.ts        localStorage 读写(load/save/clear)
   │  ├─ useGameState.ts   hook:包 gameLogic + storage,暴露动作
   │  └─ useGameState.test.tsx hook 测试
   ├─ components/
   │  ├─ WorldMap.tsx      海域 + 岛屿(可点/云雾锁定)
   │  ├─ Island.tsx        岛景 + 路径 + 节点 + 小人 + 返回
   │  ├─ NodeMarker.tsx    单节点标记(locked/available/done 三态)
   │  ├─ Character.tsx     像素小人(沿路径 CSS transition 跳点)
   │  ├─ NodePanel.tsx     弹窗:学一学(翻页)+ 试一试(挂任务组件)
   │  ├─ LearnCards.tsx    学习卡翻页器
   │  ├─ HUD.tsx           金币 + 进度条
   │  ├─ AchievementShelf.tsx  成就墙
   │  └─ Celebration.tsx   通关像素烟花
   ├─ tasks/
   │  ├─ QuizTask.tsx
   │  ├─ TrueFalseTask.tsx
   │  ├─ MatchTask.tsx
   │  ├─ FillPromptTask.tsx
   │  └─ TaskRenderer.tsx  按 task.type 分发到上面 4 个
   └─ styles/
      ├─ pixel.css         像素基础(字体、image-rendering、按钮、对话框)
      └─ tokens.css        星露谷调色板 CSS 变量
```

**单测约定:** 逻辑层(gameLogic、storage、hook、各 task 的判分)走 TDD 真实测试;纯视觉组件(WorldMap/Island/Character/Celebration)以「能渲染 + 关键交互冒烟测试 + 跑站验收」为准,不强求像素级测试。

---

## Task 1: 脚手架与工具链

**Files:**
- Create: 整个项目骨架(vite 模板)、`vite.config.ts`、`src/styles/tokens.css`、`src/styles/pixel.css`

- [x] **Step 1: 用 Vite 创建 React+TS 项目**

在 `C:\Users\QYL\Desktop\AI赋能\vibe-islands` 目录(已存在,内含 docs/)。运行:
```bash
cd "C:\Users\QYL\Desktop\AI赋能\vibe-islands"
npm create vite@latest . -- --template react-ts
```
若提示目录非空,选择「忽略并继续 / Ignore files and continue」(保留 docs/)。

- [x] **Step 2: 安装依赖(含测试)**

```bash
pnpm install
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [x] **Step 3: 配置 vitest(jsdom)**

`vite.config.ts`:
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',                         // 静态托管/妙搭可用相对路径
  test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.ts' },
})
```
`src/setupTests.ts`:
```ts
import '@testing-library/jest-dom'
```
`package.json` 的 scripts 加:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [x] **Step 4: 调色板 + 像素基础样式**

`src/styles/tokens.css`:
```css
:root{
  --c-grass:#5fa64d; --c-grass-dark:#3a7a2c; --c-sand:#e6c47a;
  --c-sea:#5b9bd5; --c-sea-dark:#2e5a8a; --c-wood:#8a5a3c;
  --c-cream:#f4ecd6; --c-ink:#3a2a1a; --c-gold:#f2c14e;
  --tile:16px;
}
```
`src/styles/pixel.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
*{box-sizing:border-box}
html,body,#root{height:100%;margin:0}
body{background:var(--c-sea-dark);color:var(--c-ink);
  font-family:'Press Start 2P',system-ui,"Microsoft YaHei",sans-serif;}
img,canvas{image-rendering:pixelated;}
.pixel-panel{background:var(--c-cream);border:4px solid var(--c-ink);
  box-shadow:6px 6px 0 rgba(0,0,0,.35);padding:16px;}
.pixel-btn{font-family:inherit;background:var(--c-gold);border:3px solid var(--c-ink);
  padding:8px 12px;cursor:pointer;box-shadow:3px 3px 0 var(--c-ink);}
.pixel-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--c-ink);}
/* 正文(非标题)允许普通中文字体,避免中文像素字版权/糊 */
.body-text{font-family:system-ui,"Microsoft YaHei",sans-serif;line-height:1.7;}
```
在 `src/main.tsx` 顶部 import 两个 css。

- [x] **Step 5: 初始化 git 并首次提交**

```bash
git init
printf "node_modules\ndist\npublic/assets\n" > .gitignore
git add -A
git commit -m "chore: scaffold vite react ts + pixel base + vitest"
```

- [x] **Step 6: 冒烟验证**

```bash
pnpm test    # 目前无测试,应 0 passed 正常退出
pnpm dev     # 启动后 Ctrl+C;确认无报错
```
Expected: dev 正常起站,无编译错误。

---

## Task 2: 领域类型

**Files:**
- Create: `src/content/types.ts`

- [x] **Step 1: 写类型(无逻辑,直接落地)**

```ts
export type NodeStatus = 'locked' | 'available' | 'done'
export type Region = 'stage-1' | 'stage-2' | 'stage-3'
export type TaskType = 'quiz' | 'truefalse' | 'match' | 'fill-prompt'

export interface LearnCard { title: string; body: string }

export interface QuizTask {
  type: 'quiz'; question: string; options: string[]; answerIndex: number; explain: string
}
export interface TrueFalseTask {
  type: 'truefalse'; statements: { text: string; isTrue: boolean }[]; explain: string
}
export interface MatchTask {
  type: 'match'; pairs: { left: string; right: string }[]
}
export interface FillPromptTask {
  type: 'fill-prompt'; template: string; blanks: { accept: string[]; hint: string }[]; explain: string
}
export type NodeTask = QuizTask | TrueFalseTask | MatchTask | FillPromptTask

// 各任务对应的作答数据
export type TaskAnswer =
  | { type: 'quiz'; choice: number }
  | { type: 'truefalse'; choices: boolean[] }
  | { type: 'match'; mapping: number[] }     // mapping[i]=左 i 选的右项下标
  | { type: 'fill-prompt'; values: string[] }

export interface GameNode {
  id: string
  title: string
  chapterSlug: string                 // easy-vibe 来源章节
  kind: 'main' | 'treasure'
  order: number                       // 主线顺序(1..6);宝箱为 0
  learn: LearnCard[]
  task: NodeTask
  coins: number
  position: { x: number; y: number }  // 岛上百分比坐标 0..100
}

export interface IslandDef {
  id: string
  name: string
  region: Region
  lockedByDefault: boolean            // true=初始锁定(Stage2/3 占位)
  nextIslandId?: string               // 通关后解锁谁
  nodes: GameNode[]
}

export interface SaveState {
  version: 1
  nodeStatus: Record<string, NodeStatus>
  achievements: string[]
  coins: number
  stars: number
  unlockedIslands: string[]
  openedTreasures: string[]
}
```

- [x] **Step 2: 提交**

```bash
git add src/content/types.ts && git commit -m "feat: domain types"
```

---

## Task 3: 纯逻辑层(TDD)

**Files:**
- Create: `src/state/gameLogic.ts`, `src/state/gameLogic.test.ts`

纯函数,无 React、无 localStorage。这是全系统的单一真相源。

- [x] **Step 1: 写失败测试**

`src/state/gameLogic.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { initSave, scoreTask, completeNode, openTreasure } from './gameLogic'
import type { IslandDef, NodeTask } from '../content/types'

const island: IslandDef = {
  id: 'origin', name: '起源岛', region: 'stage-1', lockedByDefault: false,
  nextIslandId: 's2', nodes: [
    { id: 'n1', title: 'A', chapterSlug:'a', kind:'main', order:1, learn:[], coins:10,
      position:{x:0,y:0}, task:{ type:'quiz', question:'q', options:['x','y'], answerIndex:1, explain:'' } },
    { id: 'n2', title: 'B', chapterSlug:'b', kind:'main', order:2, learn:[], coins:10,
      position:{x:0,y:0}, task:{ type:'quiz', question:'q', options:['x','y'], answerIndex:0, explain:'' } },
    { id: 't1', title: 'T', chapterSlug:'t', kind:'treasure', order:0, learn:[], coins:5,
      position:{x:0,y:0}, task:{ type:'quiz', question:'q', options:['x'], answerIndex:0, explain:'' } },
  ],
}

describe('initSave', () => {
  it('第1个主线 available,其余主线 locked,宝箱 available', () => {
    const s = initSave(island)
    expect(s.nodeStatus.n1).toBe('available')
    expect(s.nodeStatus.n2).toBe('locked')
    expect(s.nodeStatus.t1).toBe('available')
    expect(s.coins).toBe(0)
    expect(s.unlockedIslands).toEqual(['origin'])
  })
})

describe('scoreTask', () => {
  it('quiz 选对=correct', () => {
    const t: NodeTask = { type:'quiz', question:'', options:['a','b'], answerIndex:1, explain:'' }
    expect(scoreTask(t, { type:'quiz', choice:1 })).toBe(true)
    expect(scoreTask(t, { type:'quiz', choice:0 })).toBe(false)
  })
  it('truefalse 全对才 correct', () => {
    const t: NodeTask = { type:'truefalse', statements:[{text:'',isTrue:true},{text:'',isTrue:false}], explain:'' }
    expect(scoreTask(t, { type:'truefalse', choices:[true,false] })).toBe(true)
    expect(scoreTask(t, { type:'truefalse', choices:[true,true] })).toBe(false)
  })
  it('match 全配对才 correct', () => {
    const t: NodeTask = { type:'match', pairs:[{left:'a',right:'1'},{left:'b',right:'2'}] }
    expect(scoreTask(t, { type:'match', mapping:[0,1] })).toBe(true)
    expect(scoreTask(t, { type:'match', mapping:[1,0] })).toBe(false)
  })
  it('fill-prompt 每空命中 accept(忽略大小写/空白)才 correct', () => {
    const t: NodeTask = { type:'fill-prompt', template:'用 ___ 做 ___',
      blanks:[{accept:['cursor'],hint:''},{accept:['网站','app'],hint:''}], explain:'' }
    expect(scoreTask(t, { type:'fill-prompt', values:[' Cursor ','APP'] })).toBe(true)
    expect(scoreTask(t, { type:'fill-prompt', values:['xx','网站'] })).toBe(false)
  })
})

describe('completeNode', () => {
  it('完成 n1:置 done、解锁 n2、加金币;star=true 时加星', () => {
    const s0 = initSave(island)
    const s1 = completeNode(s0, island, 'n1', { star: true })
    expect(s1.nodeStatus.n1).toBe('done')
    expect(s1.nodeStatus.n2).toBe('available')
    expect(s1.coins).toBe(10)
    expect(s1.stars).toBe(1)
  })
  it('完成全部主线 → 解锁 nextIslandId', () => {
    let s = initSave(island)
    s = completeNode(s, island, 'n1', { star:false })
    s = completeNode(s, island, 'n2', { star:false })
    expect(s.unlockedIslands).toContain('s2')
  })
  it('重复完成同一节点不重复加币', () => {
    let s = initSave(island)
    s = completeNode(s, island, 'n1', { star:false })
    const coins = s.coins
    s = completeNode(s, island, 'n1', { star:false })
    expect(s.coins).toBe(coins)
  })
})

describe('openTreasure', () => {
  it('开宝箱:done + 记入 openedTreasures + 加币', () => {
    const s0 = initSave(island)
    const s1 = openTreasure(s0, island, 't1')
    expect(s1.nodeStatus.t1).toBe('done')
    expect(s1.openedTreasures).toContain('t1')
    expect(s1.coins).toBe(5)
  })
})
```

- [x] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL(模块/函数未定义)。

- [x] **Step 3: 实现 gameLogic**

`src/state/gameLogic.ts`:
```ts
import type { IslandDef, NodeTask, TaskAnswer, SaveState } from '../content/types'

const norm = (s: string) => s.trim().toLowerCase()

export function initSave(island: IslandDef): SaveState {
  const nodeStatus: SaveState['nodeStatus'] = {}
  for (const n of island.nodes) {
    if (n.kind === 'treasure') nodeStatus[n.id] = 'available'
    else nodeStatus[n.id] = n.order === 1 ? 'available' : 'locked'
  }
  return { version:1, nodeStatus, achievements:[], coins:0, stars:0,
    unlockedIslands:[island.id], openedTreasures:[] }
}

export function scoreTask(task: NodeTask, answer: TaskAnswer): boolean {
  if (task.type === 'quiz' && answer.type === 'quiz')
    return answer.choice === task.answerIndex
  if (task.type === 'truefalse' && answer.type === 'truefalse')
    return task.statements.length === answer.choices.length &&
      task.statements.every((s,i) => s.isTrue === answer.choices[i])
  if (task.type === 'match' && answer.type === 'match')
    return task.pairs.every((_,i) => answer.mapping[i] === i)
  if (task.type === 'fill-prompt' && answer.type === 'fill-prompt')
    return task.blanks.every((b,i) =>
      b.accept.some(a => norm(a) === norm(answer.values[i] ?? '')))
  return false
}

export function completeNode(state: SaveState, island: IslandDef,
    nodeId: string, opts: { star: boolean }): SaveState {
  if (state.nodeStatus[nodeId] === 'done') return state
  const node = island.nodes.find(n => n.id === nodeId)
  if (!node) return state
  const nodeStatus = { ...state.nodeStatus, [nodeId]: 'done' as const }
  // 解锁下一主线
  if (node.kind === 'main') {
    const next = island.nodes.find(n => n.kind==='main' && n.order === node.order + 1)
    if (next && nodeStatus[next.id] === 'locked') nodeStatus[next.id] = 'available'
  }
  let unlockedIslands = state.unlockedIslands
  const allMainDone = island.nodes.filter(n=>n.kind==='main')
    .every(n => nodeStatus[n.id] === 'done')
  if (allMainDone && island.nextIslandId && !unlockedIslands.includes(island.nextIslandId))
    unlockedIslands = [...unlockedIslands, island.nextIslandId]
  return { ...state, nodeStatus,
    coins: state.coins + node.coins,
    stars: state.stars + (opts.star ? 1 : 0),
    unlockedIslands }
}

export function openTreasure(state: SaveState, island: IslandDef, nodeId: string): SaveState {
  if (state.openedTreasures.includes(nodeId)) return state
  const node = island.nodes.find(n => n.id === nodeId && n.kind === 'treasure')
  if (!node) return state
  return { ...state,
    nodeStatus: { ...state.nodeStatus, [nodeId]: 'done' },
    openedTreasures: [...state.openedTreasures, nodeId],
    coins: state.coins + node.coins }
}
```

- [x] **Step 4: 跑测试确认通过**

Run: `pnpm test` → Expected: PASS(全绿)。

- [x] **Step 5: 提交**

```bash
git add src/state/gameLogic.ts src/state/gameLogic.test.ts
git commit -m "feat: pure game logic with tests"
```

---

## Task 4: 成就系统(TDD)

**Files:**
- Create: `src/content/achievements.ts`, `src/state/achievements.test.ts`
- Modify: `src/state/gameLogic.ts`(加 `earnedAchievements`)

- [x] **Step 1: 写失败测试**

`src/state/achievements.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { earnedAchievements } from './gameLogic'
import { ACHIEVEMENTS } from '../content/achievements'
import type { SaveState } from '../content/types'

const base: SaveState = { version:1, nodeStatus:{}, achievements:[], coins:0, stars:0,
  unlockedIslands:['origin'], openedTreasures:[] }

it('开1宝箱 → 寻宝者;新解锁不含已有', () => {
  const s = { ...base, openedTreasures:['t1'] }
  const ids = earnedAchievements(s, ACHIEVEMENTS)
  expect(ids).toContain('treasure-hunter')
})
it('3关满分 → 满分学霸', () => {
  const s = { ...base, stars:3 }
  expect(earnedAchievements(s, ACHIEVEMENTS)).toContain('perfect-scholar')
})
it('已在 achievements 里的不再返回', () => {
  const s = { ...base, stars:3, achievements:['perfect-scholar'] }
  expect(earnedAchievements(s, ACHIEVEMENTS)).not.toContain('perfect-scholar')
})
```

- [x] **Step 2: 跑测试确认失败** → Run `pnpm test` → FAIL。

- [x] **Step 3: 实现成就定义 + earnedAchievements**(按 spec 第6节补了计划遗漏的「全能学徒」成就)

`src/content/achievements.ts`(check 基于 SaveState;节点级成就用 nodeStatus 判定):
```ts
import type { SaveState } from './types'

export interface Achievement {
  id: string; name: string; desc: string; check: (s: SaveState) => boolean
}
const done = (s: SaveState, id: string) => s.nodeStatus[id] === 'done'

export const ACHIEVEMENTS: Achievement[] = [
  { id:'starter', name:'启程者', desc:'完成第一个节点',
    check:s => Object.values(s.nodeStatus).some(v=>v==='done') },
  { id:'idea-hunter', name:'点子猎人', desc:'完成「找到好点子」', check:s=>done(s,'origin-2') },
  { id:'tool-master', name:'工具大师', desc:'完成「AI IDE 入门」', check:s=>done(s,'origin-3') },
  { id:'prototyper', name:'原型师', desc:'完成「搭建原型」', check:s=>done(s,'origin-4') },
  { id:'treasure-hunter', name:'寻宝者', desc:'开启1个隐藏宝箱', check:s=>s.openedTreasures.length>=1 },
  { id:'collector', name:'集邮册', desc:'开启全部4个隐藏宝箱', check:s=>s.openedTreasures.length>=4 },
  { id:'perfect-scholar', name:'满分学霸', desc:'累计3关小任务一次全对', check:s=>s.stars>=3 },
  { id:'origin-master', name:'起源岛主', desc:'通关起源岛',
    check:s => ['origin-1','origin-2','origin-3','origin-4','origin-5','origin-6'].every(id=>done(s,id)) },
]
```
> 节点 id 约定:起源岛主线为 `origin-1..origin-6`,宝箱为 `origin-t1..origin-t4`。Task 6 内容必须用这套 id。

在 `gameLogic.ts` 追加:
```ts
import type { Achievement } from '../content/achievements'
export function earnedAchievements(state: SaveState, list: Achievement[]): string[] {
  return list.filter(a => a.check(state) && !state.achievements.includes(a.id)).map(a => a.id)
}
```

- [x] **Step 4: 跑测试确认通过** → `pnpm test` → PASS。

- [x] **Step 5: 提交**
```bash
git add src/content/achievements.ts src/state/achievements.test.ts src/state/gameLogic.ts
git commit -m "feat: achievements with tests"
```

---

## Task 5: 存档 + useGameState hook(TDD)

**Files:**
- Create: `src/state/storage.ts`, `src/state/useGameState.ts`, `src/state/useGameState.test.tsx`

- [x] **Step 1: 写 storage(无副作用包装,直接落地)**

`src/state/storage.ts`:
```ts
import type { SaveState } from '../content/types'
const KEY = 'vibe-islands-save'
export function loadSave(): SaveState | null {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) as SaveState : null }
  catch { return null }
}
export function persist(s: SaveState) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {} }
export function clearSave() { try { localStorage.removeItem(KEY) } catch {} }
```

- [x] **Step 2: 写 hook 失败测试**

`src/state/useGameState.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState'
import { ORIGIN_ISLAND } from '../content/stage1'

beforeEach(() => localStorage.clear())

it('完成主线节点后金币增长且持久化', () => {
  const { result } = renderHook(() => useGameState(ORIGIN_ISLAND))
  act(() => result.current.finishNode('origin-1', true))
  expect(result.current.save.nodeStatus['origin-1']).toBe('done')
  expect(result.current.save.coins).toBeGreaterThan(0)
  expect(JSON.parse(localStorage.getItem('vibe-islands-save')!).coins).toBe(result.current.save.coins)
})

it('完成后自动结算新成就', () => {
  const { result } = renderHook(() => useGameState(ORIGIN_ISLAND))
  act(() => result.current.finishNode('origin-1', true))
  expect(result.current.save.achievements).toContain('starter')
})
```

- [x] **Step 3: 跑测试确认失败** → `pnpm test` → FAIL(依赖 Task 6 的 `ORIGIN_ISLAND`;若 Task 6 未做,先用 Task 3 测试里的临时 island 桩,完成 Task 6 后切回)。

- [x] **Step 4: 实现 hook**

`src/state/useGameState.ts`:
```ts
import { useState, useCallback, useEffect } from 'react'
import type { IslandDef, SaveState } from '../content/types'
import { initSave, completeNode, openTreasure, earnedAchievements } from './gameLogic'
import { ACHIEVEMENTS } from '../content/achievements'
import { loadSave, persist } from './storage'

export function useGameState(island: IslandDef) {
  const [save, setSave] = useState<SaveState>(() => loadSave() ?? initSave(island))
  const [justEarned, setJustEarned] = useState<string[]>([])
  useEffect(() => persist(save), [save])

  const settle = (s: SaveState): SaveState => {
    const newly = earnedAchievements(s, ACHIEVEMENTS)
    setJustEarned(newly)
    return newly.length ? { ...s, achievements: [...s.achievements, ...newly] } : s
  }
  const finishNode = useCallback((id: string, star: boolean) =>
    setSave(s => settle(completeNode(s, island, id, { star }))), [island])
  const openChest = useCallback((id: string) =>
    setSave(s => settle(openTreasure(s, island, id))), [island])

  return { save, justEarned, finishNode, openChest }
}
```

- [x] **Step 5: 跑测试确认通过** → `pnpm test` → PASS。

- [x] **Step 6: 提交**
```bash
git add src/state/storage.ts src/state/useGameState.ts src/state/useGameState.test.tsx
git commit -m "feat: persistence + useGameState hook with tests"
```

---

## Task 6: 起源岛真实内容(取自 easy-vibe)

**Files:**
- Create: `src/content/stage1.ts`, `src/content/islands.ts`

**这是内容核心,必须忠于 easy-vibe 原文,不许杜撰。**

- [x] **Step 1: 抓取 Stage 1 章节原文**(实际路径为 `docs/zh-cn/stage-1/<slug>/index.md`,10/10 抓取成功,笔记在 scratch/easy-vibe-stage1-notes.md)

逐章读取(GitHub API 列目录 + raw 取文件):
```
列目录: https://api.github.com/repos/datawhalechina/easy-vibe/contents/docs/zh-cn/stage-1/<slug>
取原文: https://raw.githubusercontent.com/datawhalechina/easy-vibe/main/docs/zh-cn/stage-1/<slug>/<file>.md
```
主线 slug(对应 origin-1..6):
`learning-map` / `finding-great-idea` / `introduction-to-ai-ide` / `building-prototype` / `integrating-ai-capabilities` / `complete-project-practice`
宝箱 slug(对应 origin-t1..t4):
`appendix-double-diamond` / `appendix-mom-test` / `appendix-jobs-to-be-done` / `appendix-b-common-errors`

- [x] **Step 2: 每个节点提炼内容**

每节点:`learn` 写 2–4 张 `LearnCard`(标题 + 100–200 字精华,忠实原章核心观点,大白话);`task` 按下表选型并基于该章真实知识点出题:

| 节点 | id | 任务类型 |
|---|---|---|
| 学习地图 | origin-1 | quiz |
| 找到好点子 | origin-2 | fill-prompt |
| AI IDE 入门 | origin-3 | match |
| 搭建原型 | origin-4 | fill-prompt |
| 集成 AI 能力 | origin-5 | match |
| 完整项目实战 | origin-6 | quiz |
| 双钻模型 | origin-t1 | truefalse |
| Mom Test | origin-t2 | truefalse |
| JTBD | origin-t3 | quiz |
| 常见报错 | origin-t4 | truefalse |

position 沿一条 S 形路径铺开(x/y 用 0–100,主线按 order 递增;4 宝箱散在角落)。coins:主线 10,宝箱 5。

- [x] **Step 3: 落地 `src/content/stage1.ts`**

导出 `export const ORIGIN_ISLAND: IslandDef`,`id:'origin'`,`region:'stage-1'`,`lockedByDefault:false`,`nextIslandId:'sea2-island1'`,nodes 为上面 10 个 `GameNode`。每个节点字段完整(参考 types.ts),不留空数组占位的主线 learn。

`src/content/islands.ts`:
```ts
import type { IslandDef } from './types'
import { ORIGIN_ISLAND } from './stage1'

// Stage2/3 占位岛(无节点,云雾锁定)
const placeholder = (id:string,name:string,region:IslandDef['region']):IslandDef =>
  ({ id, name, region, lockedByDefault:true, nodes:[] })

export const ISLANDS: IslandDef[] = [
  ORIGIN_ISLAND,
  placeholder('sea2-island1','进阶之岛','stage-2'),
  placeholder('sea3-island1','大师之岛','stage-3'),
]
export const REGIONS: { id: IslandDef['region']; name: string }[] = [
  { id:'stage-1', name:'入门之海' },
  { id:'stage-2', name:'进阶之海' },
  { id:'stage-3', name:'大师之海' },
]
```

- [x] **Step 4: 验证类型 + 回跑 Task 5 测试**(已切回 ORIGIN_ISLAND,14/14 PASS,tsc 无错)

Run: `pnpm test` → 之前桩切回 `ORIGIN_ISLAND` 后应 PASS;`pnpm exec tsc --noEmit` 无类型错误。

- [x] **Step 5: 提交**
```bash
git add src/content/stage1.ts src/content/islands.ts
git commit -m "feat: origin island content from easy-vibe stage 1"
```

---

## Task 7: 视觉地基 + 素材加载(含回退)

**Files:**
- Create: `scripts/fetch-assets.mjs`
- Modify: `package.json`(加 `assets` 脚本)、`src/styles/pixel.css`(补组件类)

- [x] **Step 1: 写素材拉取脚本(失败容错)**

`scripts/fetch-assets.mjs`:从 Kenney CC0 包下载到 `public/assets/`(地块、小人、宝箱、UI)。**任何下载失败 → 打印警告并退出 0(不报错),由组件走 CSS 回退**。脚本须:逐个 URL try/catch;成功写文件,失败记日志;最终始终 `process.exit(0)`。在文件头注释列出所用 Kenney 包名与 CC0 来源。
`package.json` 加 `"assets": "node scripts/fetch-assets.mjs"`。

- [x] **Step 2: 跑一次素材脚本**(实测全部 404 → 正确走 CSS 回退并 exit 0)

Run: `pnpm assets`
Expected: 要么素材进 `public/assets/`,要么打印「下载失败,使用 CSS 回退」并正常退出。两种都可接受。

- [x] **Step 3: 约定素材使用与回退**

在 `pixel.css` 增加:节点标记三态样式(locked 灰+🔒、available 高亮跳动、done 打勾)、宝箱、云雾遮罩、HUD、对话框。**所有用到图片的地方都设 CSS 背景色/边框回退**,即 `public/assets` 为空时仍是完整像素观感(纯色块+边框+emoji)。

- [x] **Step 4: 提交**
```bash
git add scripts/fetch-assets.mjs package.json src/styles/pixel.css
git commit -m "feat: asset fetch script with CSS fallback + component styles"
```
> 执行备注:Task 7 与 Task 6 无依赖,因 easy-vibe 内容抓取(后台 agent)尚在进行,先完成并提交 Task 7,Task 6 随后提交。

---

## Task 8: WorldMap(大地图)

**Files:** Create `src/components/WorldMap.tsx`

**职责:** 渲染三片海域(REGIONS)与岛屿(ISLANDS)。已解锁岛可点(回调 `onEnter(islandId)`);未解锁岛盖云雾+🔒,点击弹「完成上一海域解锁」提示。

**Props:**
```ts
{ islands: IslandDef[]; unlockedIslands: string[];
  onEnter: (islandId: string) => void; coins: number }
```
- [ ] **Step 1:** 实现组件:海域横向排布;每岛一个像素卡片;`unlockedIslands.includes(id)` 决定可点/云雾。起源岛高亮「可玩」。顶部放 `HUD`(Task 12 完成前先内联金币显示)。
- [ ] **Step 2: 冒烟测试** `src/components/WorldMap.test.tsx`:渲染后能看到「起源岛」,点击触发 `onEnter('origin')`;锁定岛点击不触发 onEnter。Run `pnpm test` → PASS。
- [ ] **Step 3: 提交** `git commit -m "feat: world map"`。

---

## Task 9: 岛屿场景 + 小人

**Files:** Create `src/components/Island.tsx`, `src/components/NodeMarker.tsx`, `src/components/Character.tsx`

**Island 职责:** 画岛背景 + 沿节点 position 渲染 `NodeMarker` + 一条连接路径 + `Character` + 「返回大地图」按钮。点 available 节点/未开宝箱 → 回调 `onOpenNode(node)`。

**Props(Island):**
```ts
{ island: IslandDef; nodeStatus: Record<string,NodeStatus>;
  onOpenNode: (node: GameNode) => void; onBack: () => void; activeNodeId: string | null }
```
**NodeMarker:** 按 status 三态渲染(locked 不可点;available 跳动可点;done 打勾)。
**Character:** 像素小人,用 CSS `transition` 把 `left/top` 过渡到「当前所在节点」的 position,实现跳点移动(由 Island 根据最近 available/最后 done 节点决定站位)。

- [ ] **Step 1:** 实现三个组件(绝对定位:`style={{left:`${x}%`,top:`${y}%`}}`)。
- [ ] **Step 2: 冒烟测试** `Island.test.tsx`:给起源岛 + 初始 nodeStatus,点 available 节点触发 `onOpenNode`,点 locked 不触发,点返回触发 `onBack`。`pnpm test` → PASS。
- [ ] **Step 3: 提交** `git commit -m "feat: island scene + character hop"`。

---

## Task 10: NodePanel + 学习卡翻页

**Files:** Create `src/components/NodePanel.tsx`, `src/components/LearnCards.tsx`

**NodePanel 职责:** 弹窗(pixel-panel)。先「学一学」(LearnCards 翻页,翻到最后一张出现「开始挑战」)→「试一试」(挂 `TaskRenderer`,Task 11)。任务过关回调 `onPass(star)`;关闭回调 `onClose`。

**Props(NodePanel):**
```ts
{ node: GameNode; onPass: (star: boolean) => void; onClose: () => void }
```
**LearnCards:** 接 `cards: LearnCard[]`,上一页/下一页,正文用 `.body-text`。

- [ ] **Step 1:** 实现两组件。学习阶段与挑战阶段用本地 state 切换。
- [ ] **Step 2: 冒烟测试** `NodePanel.test.tsx`:渲染含第一张卡标题;翻到末页出现「开始挑战」。`pnpm test` → PASS。
- [ ] **Step 3: 提交** `git commit -m "feat: node panel + learn cards"`。

---

## Task 11: 四种任务组件(TDD 判分,组件冒烟)

**Files:** Create `src/tasks/QuizTask.tsx`, `TrueFalseTask.tsx`, `MatchTask.tsx`, `FillPromptTask.tsx`, `TaskRenderer.tsx`, `src/tasks/tasks.test.tsx`

**约定:** 每个任务组件 props `{ task; onResult: (correct: boolean) => void }`。组件内部收集作答 → 组装对应 `TaskAnswer` → 调 `scoreTask`(复用 Task 3 纯函数,不另写判分)→ `onResult(correct)`。`TaskRenderer` 按 `task.type` 分发;并跟踪「首次尝试是否就对」以决定 star,向上回调 `onPass(star)`。

- [ ] **Step 1: 写组件冒烟测试** `tasks.test.tsx`:
  - QuizTask:点正确项后 `onResult(true)`;错项 `onResult(false)`。
  - FillPromptTask:输入命中 accept → `onResult(true)`。
  (用 @testing-library/user-event 模拟点击/输入。)
- [ ] **Step 2: 跑确认失败** → `pnpm test` → FAIL。
- [ ] **Step 3: 实现 4 组件 + TaskRenderer**(判分一律调 `scoreTask`)。
- [ ] **Step 4: 跑确认通过** → `pnpm test` → PASS。
- [ ] **Step 5: 提交** `git commit -m "feat: 4 task widgets + renderer"`。

---

## Task 12: HUD + 成就墙

**Files:** Create `src/components/HUD.tsx`, `src/components/AchievementShelf.tsx`

**HUD:** 常驻顶栏,显示金币、星星、起源岛进度(done 主线数/6)。**AchievementShelf:** 遍历 `ACHIEVEMENTS`,已解锁(在 `save.achievements`)亮+名称,未解锁灰+「???」,点开看 desc。可由 HUD 上一个奖杯按钮开关。

- [ ] **Step 1:** 实现两组件。Props 接 `save: SaveState`。
- [ ] **Step 2: 冒烟测试** `AchievementShelf.test.tsx`:给含 `achievements:['starter']` 的 save,「启程者」亮、其余灰。`pnpm test` → PASS。
- [ ] **Step 3: 提交** `git commit -m "feat: HUD + achievement shelf"`。

---

## Task 13: 通关庆祝 + App 集成

**Files:** Create `src/components/Celebration.tsx`;Modify `src/App.tsx`

**Celebration:** 纯 CSS/Canvas 像素烟花,接 `show: boolean` + `onDone`。**App:** 顶层用 `useGameState(ORIGIN_ISLAND)`;`scene` 本地 state(`'map'|'island'`);组合 WorldMap / Island / NodePanel / HUD / AchievementShelf / Celebration。流程:点岛→island;点节点→开 NodePanel;onPass→`finishNode`/`openChest`;检测起源岛主线全 done 且未庆祝过→放 Celebration→回 map 显示进阶之海云雾散开;`justEarned` 非空→弹成就 toast。

- [ ] **Step 1:** 实现 Celebration + 在 App 串联全部组件与回调。
- [ ] **Step 2: 集成冒烟测试** `App.test.tsx`:渲染→默认 map 见「起源岛」;点起源岛→见节点;点 origin-1→见 NodePanel 第一张学习卡。`pnpm test` → PASS。
- [ ] **Step 3: 提交** `git commit -m "feat: celebration + app integration"`。

---

## Task 14: 验收与构建

- [ ] **Step 1: 全测试** Run `pnpm test` → 全 PASS;`pnpm exec tsc --noEmit` 无错。
- [ ] **Step 2: 跑站手动核对 spec 第 11 节 10 条验收标准**

Run `pnpm dev`,逐条确认:① 首屏大地图、起源岛可点其余云雾;② 进岛见 6 主线+4 宝箱+小人;③ 节点1可学可做、错有反馈;④ 过关金币涨/节点✅/小人移动/下一关亮;⑤ 开宝箱得寻宝者、开全得集邮册;⑥ 通关烟花+解锁进阶之海+起源岛主;⑦ 刷新不丢档;⑧ 成就墙正确;⑨ 学习内容来自 easy-vibe 真章;⑩ 像素风统一不糊。
- [ ] **Step 3: 构建** Run `pnpm build` → `dist/` 产出无错。
- [ ] **Step 4: 提交** `git commit -am "chore: acceptance pass + production build"`。

---

## 自检(写完计划后,对照 spec)

- **覆盖:** spec 第 2–11 节均有对应 Task —— 大地图/锁定(T8)、起源岛节点(T6/T9)、学+任务(T10/T11)、成就(T4/T12)、收集/金币(T3/T12)、小人(T9)、存档(T5)、庆祝+解锁(T13)、美术+回退(T7)、验收(T14)。无缺口。
- **占位符:** 逻辑层(T2–T5)给了完整真实代码与测试;视觉层(T7–T13)给了 props/职责/冒烟测试规格,由执行 agent 生成实现——符合本次「交给新会话自动完成」的交付方式。
- **类型一致:** 全程统一 `GameNode/IslandDef/NodeTask/TaskAnswer/SaveState`;节点 id 统一 `origin-1..6` / `origin-t1..t4`;函数名 `initSave/scoreTask/completeNode/openTreasure/earnedAchievements/finishNode/openChest` 前后一致。
- **范围:** 仅起源岛 + Stage2/3 占位,符合 MVP,单计划可完成。
