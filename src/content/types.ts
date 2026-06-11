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
