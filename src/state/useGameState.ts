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
