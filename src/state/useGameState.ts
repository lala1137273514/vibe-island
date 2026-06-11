import { useState, useCallback, useEffect } from 'react'
import type { IslandDef, SaveState } from '../content/types'
import { initSave, completeNode, openTreasure, earnedAchievements } from '../game/gameLogic'
import { ACHIEVEMENTS } from '../game/achievements'
import { saveService } from '../services/saveService'

export function useGameState(island: IslandDef) {
  const [save, setSave] = useState<SaveState>(() => saveService.loadSave(island.id) ?? initSave(island))
  const [justEarned, setJustEarned] = useState<string[]>([])
  useEffect(() => saveService.persistSave(island.id, save), [island.id, save])

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
