import { useState } from 'react'
import type { GameNode } from '../content/types'
import { LearnCards } from './LearnCards'
import { TaskRenderer } from '../tasks/TaskRenderer'
import { PixelDialog, PixelButton } from '../ui'

interface Props {
  node: GameNode
  onPass: (star: boolean) => void
  onClose: () => void
}

export function NodePanel({ node, onPass, onClose }: Props) {
  const [phase, setPhase] = useState<'learn' | 'task'>('learn')
  return (
    <PixelDialog onClose={onClose} className="node-panel">
      <h2>{node.kind === 'treasure' ? '💎 ' : ''}{node.title}
        <span className="chapter-slug body-text">
          {node.id.startsWith('origin-') ? `(来自 easy-vibe: ${node.chapterSlug})` : '(社区 / AI 生成内容)'}
        </span>
      </h2>
      {phase === 'learn'
        ? <LearnCards cards={node.learn} onAllRead={() => setPhase('task')} />
        : <TaskRenderer task={node.task} onPass={onPass} />}
      <div className="panel-actions">
        <PixelButton onClick={onClose}>关闭</PixelButton>
      </div>
    </PixelDialog>
  )
}
