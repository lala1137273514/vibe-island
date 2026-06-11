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
