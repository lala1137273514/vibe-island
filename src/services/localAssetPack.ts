import type { IslandTheme } from '../engine3d/islandThemes'

const THEMES: IslandTheme[] = ['origin', 'desert', 'snow', 'creator', 'custom']

export interface LocalAssetPack {
  name: string
  description?: string
  sprites: {
    themes: Partial<Record<IslandTheme, string>>
    islands: Record<string, string>
  }
}

export type LocalAssetPackState =
  | { status: 'loading'; pack: null; message?: string }
  | { status: 'missing'; pack: null; message: string }
  | { status: 'ready'; pack: LocalAssetPack; message: string }
  | { status: 'error'; pack: null; message: string }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function toLocalAssetUrl(path: unknown): string | null {
  if (typeof path !== 'string') return null
  const normalized = path.trim().replaceAll('\\', '/')
  if (!normalized || normalized.startsWith('/') || /^[a-z]+:/i.test(normalized)) return null
  const parts = normalized.split('/').filter(Boolean)
  if (!parts.length || parts.some(part => part === '.' || part === '..')) return null
  return `/local-assets/${parts.join('/')}`
}

export function normalizeLocalAssetPack(raw: unknown): LocalAssetPack {
  if (!isRecord(raw)) throw new Error('manifest 必须是 JSON 对象')
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : '本地素材包'
  const description = typeof raw.description === 'string' ? raw.description.trim() : undefined
  const spritesRaw = isRecord(raw.sprites) ? raw.sprites : {}
  const themesRaw = isRecord(spritesRaw.themes) ? spritesRaw.themes : {}
  const islandsRaw = isRecord(spritesRaw.islands) ? spritesRaw.islands : {}
  const themes: Partial<Record<IslandTheme, string>> = {}
  const islands: Record<string, string> = {}

  for (const theme of THEMES) {
    const url = toLocalAssetUrl(themesRaw[theme])
    if (url) themes[theme] = url
  }
  for (const [id, path] of Object.entries(islandsRaw)) {
    const safeId = id.trim()
    const url = toLocalAssetUrl(path)
    if (safeId && url) islands[safeId] = url
  }

  return { name, description, sprites: { themes, islands } }
}

export function getIslandSprite(pack: LocalAssetPack | null, islandId: string, theme: IslandTheme): string | null {
  if (!pack) return null
  return pack.sprites.islands[islandId] ?? pack.sprites.themes[theme] ?? null
}

export async function loadLocalAssetPack(): Promise<LocalAssetPackState> {
  try {
    const res = await fetch('/local-assets/manifest.json', { cache: 'no-store' })
    if (res.status === 404) {
      return { status: 'missing', pack: null, message: '未检测到 public/local-assets/manifest.json' }
    }
    if (!res.ok) throw new Error(`读取 manifest 失败 HTTP ${res.status}`)
    const text = await res.text()
    if (text.trimStart().startsWith('<')) {
      return { status: 'missing', pack: null, message: '未检测到 public/local-assets/manifest.json' }
    }
    const pack = normalizeLocalAssetPack(JSON.parse(text))
    const count = Object.keys(pack.sprites.islands).length + Object.keys(pack.sprites.themes).length
    return { status: 'ready', pack, message: `已加载 ${pack.name} (${count} 个 sprite 映射)` }
  } catch (e) {
    return { status: 'error', pack: null, message: (e as Error).message }
  }
}
