import { useState } from 'react'
import type { ProtoBuilderTask as ProtoT } from '../../content/types'
import { scoreProto, type ProtoResult } from './scoring'
import { PixelButton } from '../../ui'

export function ProtoBuilderTask({ task, onResult }: { task: ProtoT; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [placement, setPlacement] = useState<Record<string, string[]>>(
    Object.fromEntries(task.slots.map(s => [s.id, []])))
  const [result, setResult] = useState<ProtoResult | null>(null)

  const placedIds = new Set(Object.values(placement).flat())
  const tray = task.blocks.filter(b => !placedIds.has(b.id))
  const labelOf = (blockId: string) => task.blocks.find(b => b.id === blockId)?.label ?? blockId

  const placeInto = (slotId: string) => {
    if (!selected) return
    setPlacement(p => ({ ...p, [slotId]: [...p[slotId], selected] }))
    setSelected(null)
    setResult(null)
  }
  const removeFrom = (slotId: string, blockId: string) => {
    setPlacement(p => ({ ...p, [slotId]: p[slotId].filter(id => id !== blockId) }))
    setResult(null)
  }
  const check = () => {
    const r = scoreProto(task, placement)
    setResult(r)
    onResult(r.pass)
  }

  return (
    <div className="task proto-builder-task">
      <p className="body-text task-question">🧱 原型积木台:{task.brief}</p>
      <div className="proto-slots">
        {task.slots.map(s => (
          <div key={s.id} className="proto-slot" role="button" aria-label={`槽-${s.label}`}
            onClick={() => placeInto(s.id)}>
            <span className="proto-slot-label">{s.label}</span>
            {placement[s.id].map(id => {
              const b = task.blocks.find(x => x.id === id)!
              return (
                <PixelButton key={id} className="proto-chip body-text" aria-label={`移除-${b.label}`}
                  onClick={e => { e.stopPropagation(); removeFrom(s.id, id) }}>
                  {b.emoji} {b.label} ✕
                </PixelButton>
              )
            })}
          </div>
        ))}
      </div>
      <p className="body-text">积木栏(点积木再点槽位放入):</p>
      <div className="proto-tray">
        {tray.map(b => (
          <PixelButton key={b.id}
            className={`proto-block body-text${selected === b.id ? ' picked' : ''}`}
            aria-pressed={selected === b.id}
            onClick={() => setSelected(selected === b.id ? null : b.id)}>
            {b.emoji} {b.label}
          </PixelButton>
        ))}
      </div>
      <div className="panel-actions">
        <PixelButton onClick={check} disabled={result?.pass === true}>检查原型</PixelButton>
      </div>
      {result && (result.pass ? (
        <p className="feedback-ok">✔ 原型结构达标!{result.perfect ? '而且没堆无用功能,克制!' :
          `不过 ${result.extras.map(labelOf).join('、')} 是没人要的功能——原文:做一两个真帮到用户的功能,胜过十个没人用的。`}</p>
      ) : (
        <p className="feedback-bad">✘ 核心功能没拼全,缺:{result.missing.map(m => {
          const [slotId, blockId] = m.split(':')
          const slot = task.slots.find(s => s.id === slotId)
          return `${slot?.label ?? slotId}里的「${labelOf(blockId)}」`
        }).join('、')}</p>
      ))}
    </div>
  )
}
