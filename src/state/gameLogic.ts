import type { IslandDef, NodeTask, TaskAnswer, SaveState } from '../content/types'
import type { Achievement } from '../content/achievements'

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

export function earnedAchievements(state: SaveState, list: Achievement[]): string[] {
  return list.filter(a => a.check(state) && !state.achievements.includes(a.id)).map(a => a.id)
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
