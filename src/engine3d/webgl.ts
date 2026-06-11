// 独立于 three 的能力检测:不支持 WebGL(含 jsdom 测试环境)时,App 不加载 3D chunk。
export function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
