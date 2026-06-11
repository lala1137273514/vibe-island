// 像素小人:纯 CSS 方块人,left/top 走 CSS transition 实现跳点移动
export function Character({ x, y }: { x: number; y: number }) {
  return (
    <div className="character" data-testid="character" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="head" />
      <div className="body" />
      <div className="legs" />
    </div>
  )
}
