import { useState } from 'react'
import type { GameNode } from '../content/types'
import { LearnCards } from './LearnCards'
import { TaskRenderer } from '../tasks/TaskRenderer'

interface Props {
  node: GameNode
  onPass: (star: boolean) => void
  onClose: () => void
}

export function NodePanel({ node, onPass, onClose }: Props) {
  const [phase, setPhase] = useState<'learn' | 'task'>('learn')
  return (
    <div className="modal-overlay">
      <div className="pixel-panel node-panel">
        <h2>{node.kind === 'treasure' ? '💎 ' : ''}{node.title}
          <span className="chapter-slug body-text">(来自 easy-vibe: {node.chapterSlug})</span>
        </h2>
        {phase === 'learn'
          ? <LearnCards cards={node.learn} onAllRead={() => setPhase('task')} />
          : <TaskRenderer task={node.task} onPass={onPass} />}
        <div className="panel-actions">
          <button className="pixel-btn" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}
