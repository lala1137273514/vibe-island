import { Suspense, useState } from 'react'
import type { IslandDef } from '../content/types'
import { saveService } from '../services/saveService'
import { hashSeed } from '../creator/createIslandFlow'
import { supportsWebGL } from '../engine3d/webgl'
import { MiniIsland } from '../engine3d/lazyStage'
import { PixelButton } from '../ui'

export const PALETTES = [
  { id: 'grass', name: '🌿 草原', topColor: undefined },
  { id: 'sand', name: '🏜️ 沙金', topColor: '#e6c47a' },
  { id: 'snow', name: '❄️ 雪原', topColor: '#f4ecd6' },
] as const

const TASK_NAMES: Record<string, string> = {
  'quiz': '单选题', 'truefalse': '判断题', 'match': '连连看', 'fill-prompt': '填空',
}

export function IslandPreview({ def, onBack, onRegenerate, onSaved }: {
  def: IslandDef
  onBack: () => void
  onRegenerate: () => void
  onSaved: () => void
}) {
  const [palette, setPalette] = useState<typeof PALETTES[number]>(PALETTES[0])
  const seed = hashSeed(def.name + def.id)
  const webgl = supportsWebGL()

  const save = () => {
    saveService.saveCustomIsland({ def, seed, palette: palette.id, createdAt: new Date().toISOString() })
    onSaved()
  }

  return (
    <div className="island-preview">
      <h3 className="preview-title">🏝 {def.name} <span className="ai-badge">AI 生成</span></h3>
      <div className="preview-body">
        <div className="preview-canvas">
          {webgl ? (
            <Suspense fallback={<div className="body-text">⛵ 装载中…</div>}>
              <MiniIsland seed={seed} topColor={palette.topColor} />
            </Suspense>
          ) : (
            <div className="preview-placeholder">🏝</div>
          )}
        </div>
        <ul className="preview-nodes body-text">
          {def.nodes.map(n => (
            <li key={n.id}>
              {n.kind === 'treasure' ? '💎' : `${n.order}.`} {n.title}
              <span className="preview-meta">{TASK_NAMES[n.task.type] ?? n.task.type} · {n.learn.length} 张学习卡</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="preview-palettes">
        {PALETTES.map(p => (
          <PixelButton key={p.id} className={`hud-btn${palette.id === p.id ? ' picked' : ''}`}
            aria-pressed={palette.id === p.id} onClick={() => setPalette(p)}>{p.name}</PixelButton>
        ))}
      </div>
      <div className="panel-actions">
        <PixelButton onClick={onBack}>← 返回修改</PixelButton>
        <PixelButton onClick={onRegenerate}>🎲 重新生成</PixelButton>
        <PixelButton onClick={save}>⚓ 保存上岛</PixelButton>
      </div>
    </div>
  )
}
