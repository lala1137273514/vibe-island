import type { NodeTask } from '../content/types'

// 「试一试」挂载点 —— Task 11 以 TDD 方式实现四种任务组件后在此分发
export function TaskRenderer(_props: { task: NodeTask; onPass: (star: boolean) => void }) {
  return <div className="body-text">挑战加载中…</div>
}
