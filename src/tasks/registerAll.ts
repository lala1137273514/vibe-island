import { registerTask, listTaskTypes, type TaskPlugin } from '../game/taskRegistry'
import { QuizTask } from './basic/QuizTask'
import { TrueFalseTask } from './basic/TrueFalseTask'
import { MatchTask } from './basic/MatchTask'
import { FillPromptTask } from './basic/FillPromptTask'
import { ErrorErTask } from './error-er/ErrorErTask'
import { NpcDialogTask } from './npc-dialog/NpcDialogTask'
import { PromptForgeTask } from './prompt-forge/PromptForgeTask'
import { ProtoBuilderTask } from './proto-builder/ProtoBuilderTask'

const ALL: TaskPlugin[] = [
  { type: 'quiz', Component: QuizTask },
  { type: 'truefalse', Component: TrueFalseTask },
  { type: 'match', Component: MatchTask },
  { type: 'fill-prompt', Component: FillPromptTask },
  { type: 'error-er', Component: ErrorErTask },
  { type: 'npc-dialog', Component: NpcDialogTask },
  { type: 'prompt-forge', Component: PromptForgeTask },
  { type: 'proto-builder', Component: ProtoBuilderTask },
]

// 模块可能被 HMR/多入口重复执行,注册保持幂等
for (const p of ALL) {
  if (!listTaskTypes().includes(p.type)) registerTask(p)
}
