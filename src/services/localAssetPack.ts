import type { IslandTheme } from '../engine3d/islandThemes'

const THEMES: IslandTheme[] = ['origin', 'desert', 'snow', 'creator', 'custom']
const DECOR_KEYS = ['day', 'night', 'lantern', 'tree', 'palm', 'mushroom', 'winterTree'] as const

export type LocalDecorKey = typeof DECOR_KEYS[number]

export interface LocalIslandProp {
  id: string
  src: string
  position: [number, number, number]
  width: number
}

export interface LocalAssetPack {
  name: string
  description?: string
  sprites: {
    themes: Partial<Record<IslandTheme, string>>
    islands: Record<string, string>
    decor: Partial<Record<LocalDecorKey, string>>
    props: {
      themes: Partial<Record<IslandTheme, LocalIslandProp[]>>
      islands: Record<string, LocalIslandProp[]>
    }
  }
}

export type LocalAssetPackState =
  | { status: 'loading'; pack: null; message?: string }
  | { status: 'missing'; pack: null; message: string }
  | { status: 'ready'; pack: LocalAssetPack; message: string }
  | { status: 'error'; pack: null; message: string }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

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
  const decorRaw = isRecord(spritesRaw.decor) ? spritesRaw.decor : {}
  const propsRaw = isRecord(spritesRaw.props) ? spritesRaw.props : {}
  const propThemesRaw = isRecord(propsRaw.themes) ? propsRaw.themes : {}
  const propIslandsRaw = isRecord(propsRaw.islands) ? propsRaw.islands : {}
  const themes: Partial<Record<IslandTheme, string>> = {}
  const islands: Record<string, string> = {}
  const decor: Partial<Record<LocalDecorKey, string>> = {}
  const props: LocalAssetPack['sprites']['props'] = { themes: {}, islands: {} }

  for (const theme of THEMES) {
    const url = toLocalAssetUrl(themesRaw[theme])
    if (url) themes[theme] = url
  }
  for (const [id, path] of Object.entries(islandsRaw)) {
    const safeId = id.trim()
    const url = toLocalAssetUrl(path)
    if (safeId && url) islands[safeId] = url
  }
  for (const key of DECOR_KEYS) {
    const url = toLocalAssetUrl(decorRaw[key])
    if (url) decor[key] = url
  }
  for (const theme of THEMES) {
    const parsed = normalizeLocalIslandProps(propThemesRaw[theme])
    if (parsed.length) props.themes[theme] = parsed
  }
  for (const [id, value] of Object.entries(propIslandsRaw)) {
    const safeId = id.trim()
    const parsed = normalizeLocalIslandProps(value)
    if (safeId && parsed.length) props.islands[safeId] = parsed
  }

  return { name, description, sprites: { themes, islands, decor, props } }
}

export function normalizeLocalIslandProps(raw: unknown): LocalIslandProp[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item, index) => {
    if (!isRecord(item)) return []
    const src = toLocalAssetUrl(item.src)
    const position = item.position
    const width = item.width
    if (!src || !Array.isArray(position) || position.length !== 3 || !isFiniteNumber(width)) return []
    const [x, y, z] = position
    if (width < 16 || width > 220 || !isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(z)) return []
    const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `prop-${index + 1}`
    return [{ id, src, position: [x, y, z], width }]
  })
}

export function getIslandSprite(pack: LocalAssetPack | null, islandId: string, theme: IslandTheme): string | null {
  if (!pack) return null
  return pack.sprites.islands[islandId] ?? pack.sprites.themes[theme] ?? null
}

export function getLocalDecorSprite(pack: LocalAssetPack | null, key: LocalDecorKey): string | null {
  if (!pack) return null
  return pack.sprites.decor[key] ?? null
}

export function getIslandProps(pack: LocalAssetPack | null, islandId: string, theme: IslandTheme): LocalIslandProp[] {
  if (!pack) return []
  return pack.sprites.props.islands[islandId] ?? pack.sprites.props.themes[theme] ?? []
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
    const count = Object.keys(pack.sprites.islands).length
      + Object.keys(pack.sprites.themes).length
      + Object.keys(pack.sprites.decor).length
      + Object.values(pack.sprites.props.islands).reduce((sum, items) => sum + items.length, 0)
      + Object.values(pack.sprites.props.themes).reduce((sum, items) => sum + items.length, 0)
    return { status: 'ready', pack, message: `已加载 ${pack.name} (${count} 个 sprite 映射)` }
  } catch (e) {
    return { status: 'error', pack: null, message: (e as Error).message }
  }
}
