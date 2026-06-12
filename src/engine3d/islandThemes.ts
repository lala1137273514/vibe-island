export type IslandTheme = 'origin' | 'desert' | 'snow' | 'creator' | 'custom'

export const themeRadius: Record<IslandTheme, number> = {
  origin: 7.5,
  desert: 6.7,
  snow: 7.2,
  creator: 5.6,
  custom: 5.4,
}

export const themeTopColor: Record<IslandTheme, string | undefined> = {
  origin: undefined,
  desert: '#e6c47a',
  snow: '#f4ecd6',
  creator: '#e6c47a',
  custom: undefined,
}
