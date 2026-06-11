import type { IslandDef } from './types'
import { ORIGIN_ISLAND } from './stage1'

// Stage2/3 占位岛(无节点,云雾锁定)
const placeholder = (id: string, name: string, region: IslandDef['region']): IslandDef =>
  ({ id, name, region, lockedByDefault: true, nodes: [] })

export const ISLANDS: IslandDef[] = [
  ORIGIN_ISLAND,
  placeholder('sea2-island1', '进阶之岛', 'stage-2'),
  placeholder('sea3-island1', '大师之岛', 'stage-3'),
]
export const REGIONS: { id: IslandDef['region']; name: string }[] = [
  { id: 'stage-1', name: '入门之海' },
  { id: 'stage-2', name: '进阶之海' },
  { id: 'stage-3', name: '大师之海' },
]
