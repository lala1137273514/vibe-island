import { getLocalDecorSprite, type LocalAssetPack, type LocalDecorKey } from '../services/localAssetPack'

const DECOR_SLOTS: { key: LocalDecorKey; className: string }[] = [
  { key: 'day', className: 'sky-day' },
  { key: 'night', className: 'sky-night' },
  { key: 'lantern', className: 'lantern' },
  { key: 'tree', className: 'tree' },
  { key: 'palm', className: 'palm' },
  { key: 'mushroom', className: 'mushroom' },
  { key: 'winterTree', className: 'winter-tree' },
]

export function LocalDecorLayer({ pack, scene }: {
  pack: LocalAssetPack | null
  scene: 'map' | 'island'
}) {
  const sprites = DECOR_SLOTS
    .map(slot => ({ ...slot, src: getLocalDecorSprite(pack, slot.key) }))
    .filter((slot): slot is { key: LocalDecorKey; className: string; src: string } => Boolean(slot.src))

  if (!sprites.length) return null

  return (
    <div className={`local-decor-layer ${scene}`} aria-hidden="true">
      {sprites.map(slot => (
        <img
          key={slot.key}
          className={`local-decor ${slot.className}`}
          src={slot.src}
          alt=""
          draggable={false}
        />
      ))}
    </div>
  )
}
