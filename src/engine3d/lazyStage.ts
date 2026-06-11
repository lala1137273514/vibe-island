import { lazy } from 'react'

// 共享的懒加载 3D 模块(App 与各会话组件共用同一 chunk)
export const Stage3D = lazy(() => import('./Stage3D'))
export const MiniIsland = lazy(() => import('./MiniIsland'))
