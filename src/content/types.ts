export type NodeStatus = 'locked' | 'available' | 'done'
export type Region = 'stage-1' | 'stage-2' | 'stage-3'
export type TaskType =
  | 'quiz' | 'truefalse' | 'match' | 'fill-prompt'
  | 'error-er' | 'npc-dialog' | 'prompt-forge'

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
// ===== 报错急诊室 =====
export interface ErrorStep {
  prompt: string
  options: { text: string; correct: boolean; feedback: string }[]
}
export interface ErrorCase { symptom: string; steps: ErrorStep[] }
export interface ErrorErTask { type: 'error-er'; intro: string; cases: ErrorCase[] }

// ===== 老妈访谈屋(Mom Test) =====
export interface DialogCard { question: string; valid: boolean; reply: string; lesson: string }
export interface NpcDialogTask {
  type: 'npc-dialog'
  npcName: string
  scenario: string
  rounds: { cards: DialogCard[] }[]
  goal: { validNeeded: number; maxViolations: number }
}

// ===== 提示词锻造铺 =====
export interface ForgeRound {
  options: { text: string; effective: boolean; why: string; fragment: string }[]
  // fragment:选中后拼进当前提示词展示的文本片段(有效项才有内容,无效项为空串)
}
export interface PromptForgeTask {
  type: 'prompt-forge'
  brief: string
  basePrompt: string
  forgeRounds: ForgeRound[]            // 3 轮,每轮 3 选 1
  rubric: string[]                     // 实战模式 LLM 评分要点
  exampleGood: string                  // 过关后展示的参考提示词(取自原文模板)
}

export type NodeTask =
  | QuizTask | TrueFalseTask | MatchTask | FillPromptTask
  | ErrorErTask | NpcDialogTask | PromptForgeTask

// 各任务对应的作答数据
export type TaskAnswer =
  | { type: 'quiz'; choice: number }
  | { type: 'truefalse'; choices: boolean[] }
  | { type: 'match'; mapping: number[] }     // mapping[i]=左 i 选的右项下标
  | { type: 'fill-prompt'; values: string[] }
  | { type: 'error-er'; picks: number[][] }  // picks[case][step] = 该步首选下标
  | { type: 'npc-dialog'; picks: number[] }  // picks[round] = 选的问题卡下标
  | { type: 'prompt-forge'; picks: number[] } // picks[round] = 选的锻打项下标

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
