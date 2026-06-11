import type { SaveState } from '../content/types'

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
  { id:'all-rounder', name:'全能学徒', desc:'完成「集成 AI 能力」和「完整项目实战」',
    check:s => done(s,'origin-5') && done(s,'origin-6') },
  { id:'treasure-hunter', name:'寻宝者', desc:'开启1个隐藏宝箱', check:s=>s.openedTreasures.length>=1 },
  { id:'collector', name:'集邮册', desc:'开启全部4个隐藏宝箱', check:s=>s.openedTreasures.length>=4 },
  { id:'perfect-scholar', name:'满分学霸', desc:'累计3关小任务一次全对', check:s=>s.stars>=3 },
  { id:'origin-master', name:'起源岛主', desc:'通关起源岛',
    check:s => ['origin-1','origin-2','origin-3','origin-4','origin-5','origin-6'].every(id=>done(s,id)) },
]
