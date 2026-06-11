// 拉取 Kenney CC0 像素素材到 public/assets/(可选增强,非阻塞)。
// 素材包:Kenney "Tiny Town" / "Pixel Platformer"(https://kenney.nl/assets,CC0 1.0 可商用)。
// 任一下载失败只打警告,最终始终 exit 0 —— UI 全部自带 CSS/SVG 像素回退,素材缺失不影响运行。
import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'assets')

// 每项给多个候选 URL,取第一个成功的
const ASSETS = [
  {
    file: 'tilemap_tiny-town.png',
    urls: [
      'https://kenney.nl/media/pages/assets/tiny-town/kenney_tiny-town.zip',
      'https://raw.githubusercontent.com/kenneynl/kenney-assets/main/tiny-town/Tilemap/tilemap_packed.png',
    ],
  },
  {
    file: 'characters_pixel.png',
    urls: [
      'https://raw.githubusercontent.com/kenneynl/kenney-assets/main/pixel-platformer/Tilemap/tilemap-characters_packed.png',
    ],
  },
]

let ok = 0, fail = 0
await mkdir(outDir, { recursive: true })
for (const a of ASSETS) {
  let saved = false
  for (const url of a.urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      await writeFile(join(outDir, a.file), buf)
      console.log(`[ok] ${a.file} <- ${url}`)
      ok++; saved = true; break
    } catch (e) {
      console.warn(`[miss] ${url} (${e.message})`)
    }
  }
  if (!saved) { console.warn(`[fallback] ${a.file} 下载失败,使用 CSS 像素回退`); fail++ }
}
console.log(`done: ${ok} downloaded, ${fail} fell back to CSS. UI 不依赖素材,可直接运行。`)
process.exit(0)
