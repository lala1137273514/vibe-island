# Vibe Coding 群岛 — 设计文档(Design Spec)

- 日期:2026-06-11
- 状态:已与用户对齐,待审
- 一句话:把 datawhalechina/easy-vibe 教程改造成星露谷像素风的「群岛闯关」教学落地页。

---

## 1. 目标与定位

把 easy-vibe(Datawhale 的 vibe coding 教程,三大阶段)做成一个**像素风、可闯关、有成就系统**的单页 Web 应用:

- 三片海域 = easy-vibe 三大阶段(入门 / 进阶 / 大师)。
- 每座岛 = 一个章节主题。
- 岛上一串节点 = 该章的学习任务。
- 完成节点小任务 → 解锁下一节点;通关一座岛 → 拨开下一海域云雾。
- 边玩边学:节点内嵌 easy-vibe 章节精华 + 小任务。

**成功标准**:用户进站即看到群岛大地图,能进起源岛、按顺序学+做任务过关、看到金币/成就增长、通关后看到庆祝并解锁下一海域占位。刷新不丢进度。

## 2. 范围(MVP)

### 包含
- 群岛**总览大地图**:所有海域/岛屿可见,Stage 1「起源岛」可玩,其余盖云雾+🔒 占位。
- **起源岛完整可玩**:6 个主线节点(取自 easy-vibe Stage 1 真实章节)+ 4 个隐藏宝箱(附录彩蛋,选做)。
- **节点交互**:学一学(像素卡片讲解)+ 试一试(小任务过关)。
- **成就系统** + 金币/星星收集 + 成就墙。
- **角色**:像素小人沿岛上路径「跳点」式移动。
- **存档**:localStorage 持久化进度/成就/金币/解锁状态。
- **通关庆祝**:像素烟花 + 解锁下一海域。

### 不包含(明确砍掉)
- 不做真实 2D 物理/自由行走(小人是沿路径跳点,不是 Phaser 自由移动)。
- 不做多语言(easy-vibe 有 10 语言,MVP 只做简体中文)。
- 不做后端 / 账号 / 云端同步(存档仅本地浏览器)。
- 不做 Stage 2 / Stage 3 的真实节点内容(仅占位)。
- 不做音乐/音效(留作后续可选增强)。

## 3. 世界与导航结构

```
入门之海 (Stage 1)        进阶之海 (Stage 2)        大师之海 (Stage 3)
┌───────────┐            ┌────🔒────┐             ┌────🔒────┐
│ 🏝 起源岛  │ ──船──▶    │ 云雾遮住 │             │ 云雾遮住 │
│ (可玩 MVP) │            │ (锁定)   │             │ (锁定)   │
└───────────┘            └─────────┘             └─────────┘
   ⛵ 出发点               完成上一海域才拨云雾
```

- 两个场景:`WorldMap`(海上群岛)↔ `Island`(进入某座岛)。点岛进入,岛内有「返回大地图」。
- 锁定岛点击 → 像素提示框「完成起源岛后解锁」。

## 4. 起源岛节点设计

主线 6 关(线性解锁)+ 隐藏宝箱(附录,随时可点,给稀有成就):

```
🚩起点 ─① 学习地图 ─② 找到好点子 ─③ AI IDE入门 ─④ 搭建原型 ─⑤ 集成AI能力 ─⑥ 完整项目实战 ─🏆通关
                     └─💎双钻模型     └─💎Mom Test    └─💎JTBD      └─💎常见报错
```

| # | 节点 | easy-vibe 章节(slug) | 类型 |
|---|---|---|---|
| 1 | 学习地图 | learning-map | 主线 |
| 2 | 找到好点子 | finding-great-idea | 主线 |
| 3 | AI IDE 入门 | introduction-to-ai-ide | 主线 |
| 4 | 搭建原型 | building-prototype | 主线 |
| 5 | 集成 AI 能力 | integrating-ai-capabilities | 主线 |
| 6 | 完整项目实战 | complete-project-practice | 主线 |
| T1 | 双钻模型 | appendix-double-diamond | 隐藏宝箱 |
| T2 | Mom Test | appendix-mom-test | 隐藏宝箱 |
| T3 | JTBD | appendix-jobs-to-be-done | 隐藏宝箱 |
| T4 | 常见报错 | appendix-b-common-errors | 隐藏宝箱 |

- 主线节点 1 默认 `available`,其余 `locked`;完成 N 解锁 N+1。
- 宝箱节点默认可见可点(藏在岛角),开过即 `done`,不影响主线解锁。
- 节点的「学一学」文案由实现阶段读取 easy-vibe 对应章节原文(raw markdown)提炼,不杜撰。

## 5. 节点交互

点节点弹出像素卷轴面板 `NodePanel`,两段式:

1. **学一学**:2–4 张像素卡片/对话框,逐张「下一页」,讲该章精华。
2. **试一试**:一个小任务,做对才算过关。任务类型按章节性质从下面选一种:

| 任务类型 | 形态 | 适用 |
|---|---|---|
| `quiz` | 单选小测 | 概念理解类(学习地图、JTBD) |
| `truefalse` | 判断对错(多条) | 易踩坑的认知(Mom Test、常见报错) |
| `match` | 概念连连看 | 工具/概念配对(AI IDE、AI 能力) |
| `fill-prompt` | 提示词填空 | 动手类(找点子、搭原型) |

过关 → 掉金币(满分额外给星星)→ 节点变 ✅ → 小人走到下一关 → 下一关亮起 → 检查是否触发成就。

## 6. 玩法与成就系统

### 收集
- **金币**:每过一关 +N。
- **星星**:小任务一次全对 +1。
- **印章**:集齐一岛全部主线 = 该岛印章。

### 成就清单(MVP)

| 成就 | 解锁条件 |
|---|---|
| 启程者 | 完成第 1 个节点 |
| 点子猎人 | 完成「找到好点子」 |
| 工具大师 | 完成「AI IDE 入门」 |
| 原型师 | 完成「搭建原型」 |
| 全能学徒 | 完成全部 5、6 主线 |
| 寻宝者 | 开启 1 个隐藏宝箱 |
| 集邮册 | 开启全部 4 个隐藏宝箱 |
| 满分学霸 | 任意 3 关小任务一次全对 |
| 起源岛主 | 通关起源岛(全主线 done)→ 解锁进阶之海 |

### 反馈
- `AchievementShelf`:像素奖杯陈列架,已解锁亮、未解锁灰,点开看条件。
- `HUD`:常驻金币数 + 起源岛进度条。
- 通关:像素烟花动画 + 大地图进阶之海云雾散开。

## 7. 技术架构

**栈**:Vite + React + TypeScript。环境已确认:Node v24 / npm 11 / pnpm 9。

### 组件树
```
App
├─ WorldMap          海域 + 岛屿(可点/锁定)
├─ Island            岛景 + 节点路径 + 小人 + 返回按钮
│  ├─ NodeMarker     单个节点标记(locked/available/done)
│  └─ NodePanel      弹窗:学一学(LearnCards) + 试一试(TaskWidget)
│     └─ TaskWidget  按 task.type 渲染 quiz/truefalse/match/fill-prompt
├─ AchievementShelf  成就墙
├─ HUD               金币 / 进度
└─ Celebration       通关烟花
```

### 状态与存档
- `useGameState` 自定义 hook 统一管理 + 持久化到 `localStorage`(key:`vibe-islands-save`)。
- 派生:节点状态机、解锁判定、成就判定都在 hook 里集中处理(单一真相源)。

```ts
interface SaveState {
  version: 1
  nodeStatus: Record<string, 'locked' | 'available' | 'done'>
  achievements: string[]      // 已解锁成就 id
  coins: number
  stars: number
  unlockedIslands: string[]   // 已解锁海域/岛 id
  openedTreasures: string[]   // 已开宝箱 id
}
```

## 8. 内容数据结构(内容即数据)

所有岛/节点内容放 `src/content/`,**加新岛 = 加一个 content 文件 + 在岛列表注册**,不改组件。

```ts
type TaskType = 'quiz' | 'truefalse' | 'match' | 'fill-prompt'

interface LearnCard { title: string; body: string; sprite?: string }

interface GameNode {
  id: string
  title: string
  chapterSlug: string                 // easy-vibe 来源章节
  kind: 'main' | 'treasure'
  learn: LearnCard[]
  task: NodeTask                       // 见下,4 种之一的联合类型
  reward: { coins: number; achievement?: string }
  position: { x: number; y: number }   // 岛上路径坐标(%)
}

interface IslandDef {
  id: string
  name: string
  region: 'stage-1' | 'stage-2' | 'stage-3'
  locked: boolean
  nodes: GameNode[]
}
```

`NodeTask` 为 4 种任务的可辨识联合(每种带自己的字段 + 判分逻辑)。

## 9. 美术与视觉规范

- **素材**:Kenney CC0 包(Tiny Town / Roguelike / 像素地块)做岛、地块、小人、宝箱、UI;像素字体用 Press Start 2P(英文)+ 一款 CC0 中文像素字体或 fusion 处理;CC0 可商用、零版权风险。
- **获取与回退**:构建脚本拉取素材到 `public/assets/`;**任一素材包下载失败 → 自动回退 CSS/SVG 手绘像素**,保证项目一定能跑起来(Let it crash 的反面在这里不适用:素材是外部依赖,必须有确定性回退)。
- **调色板(星露谷暖调)**:草绿 `#5fa64d`、深绿 `#3a7a2c`、沙黄 `#e6c47a`、海蓝 `#5b9bd5`、深海 `#2e5a8a`、木棕 `#8a5a3c`、UI 米白 `#f4ecd6`、描边深褐 `#3a2a1a`。
- **像素锐利**:全局 `image-rendering: pixelated;`,整数倍缩放。
- **基准分辨率**:设计稿按 16px tile;画布逻辑分辨率固定,容器等比放大,适配桌面浏览器(MVP 不强求移动端)。

## 10. 目录结构 / 运行 / 部署

```
vibe-islands/
├─ docs/superpowers/specs/        本设计文档
├─ public/assets/                 像素素材(脚本拉取)
├─ src/
│  ├─ components/                 WorldMap / Island / NodePanel / ...
│  ├─ content/                    stage1.ts(真实内容) + islands.ts(注册表)
│  ├─ state/                      useGameState + 存档
│  ├─ tasks/                      4 种任务组件 + 判分
│  ├─ styles/                     像素 CSS / 调色板变量
│  └─ main.tsx / App.tsx
├─ index.html
├─ package.json
└─ vite.config.ts
```

- 开发:`pnpm dev`;构建:`pnpm build`(出静态 `dist/`,后续可发妙搭/Vercel)。

## 11. 验收标准

1. `pnpm dev` 起站,首屏是群岛大地图,起源岛可点、其余盖云雾🔒。
2. 进起源岛,看到 6 主线节点路径 + 4 个隐藏宝箱,小人在起点。
3. 节点 1 可玩:学一学翻页正常,试一试做对才过关、做错有反馈。
4. 过关后:金币增长、节点变✅、小人移动、下一关解锁。
5. 隐藏宝箱可开,得「寻宝者」成就;开全 4 个得「集邮册」。
6. 通关起源岛触发烟花 + 解锁进阶之海占位 + 得「起源岛主」。
7. 刷新页面进度/金币/成就不丢(localStorage)。
8. 成就墙正确显示已/未解锁。
9. 节点「学一学」内容来自 easy-vibe Stage 1 真实章节,非杜撰。
10. 像素风格统一,星露谷暖调,像素不糊。

## 12. 风险与缓解

| 风险 | 缓解 |
|---|---|
| Kenney 素材下载在本环境失败 | 必须实现 CSS/SVG 像素回退,素材为增强而非阻塞项 |
| easy-vibe 章节原文较长、提炼走样 | 实现阶段逐章读 raw md 提炼,保留原章节核心要点,标注来源 slug |
| React 做岛地图过度复杂 | 节点用绝对定位 + 数据驱动,小人用 CSS transition 跳点,不引游戏引擎 |
| 中文像素字体版权/体积 | 优先 CC0 字体;不行则正文用普通字体、仅标题像素化,避免侵权和大体积 |
| 范围蔓延 | 严守 MVP:只做起源岛 + 大地图占位,Stage 2/3 真实内容明确不做 |
