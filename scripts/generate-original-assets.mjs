import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'public', 'original-assets', 'sprites')
mkdirSync(outDir, { recursive: true })

function asset(name, body, size = 96) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
<rect width="${size}" height="${size}" fill="none"/>
${body}
</svg>
`
  writeFileSync(join(outDir, `${name}.svg`), svg, 'utf8')
}

asset('origin-emblem', `
<rect x="10" y="18" width="76" height="62" fill="#3a2a1a"/>
<rect x="14" y="14" width="68" height="62" fill="#f2c14e"/>
<rect x="18" y="20" width="60" height="48" fill="#5fa64d"/>
<rect x="24" y="40" width="26" height="20" fill="#8a5a3c"/>
<rect x="22" y="34" width="30" height="8" fill="#c0392b"/>
<rect x="32" y="48" width="8" height="12" fill="#3a2a1a"/>
<rect x="56" y="32" width="8" height="28" fill="#6b4226"/>
<rect x="48" y="22" width="24" height="18" fill="#3a7a2c"/>
<rect x="52" y="18" width="16" height="8" fill="#245d26"/>
<rect x="26" y="66" width="44" height="6" fill="#e6c47a"/>
<rect x="34" y="8" width="28" height="6" fill="#fff3c4"/>
<rect x="42" y="2" width="12" height="8" fill="#fff3c4"/>
`)

asset('desert-emblem', `
<rect x="12" y="16" width="72" height="62" fill="#3a2a1a"/>
<rect x="16" y="12" width="64" height="62" fill="#e6c47a"/>
<rect x="20" y="58" width="56" height="10" fill="#c9963f"/>
<rect x="26" y="48" width="44" height="10" fill="#d8aa4f"/>
<rect x="32" y="38" width="32" height="10" fill="#e6c47a"/>
<rect x="38" y="28" width="20" height="10" fill="#f2c14e"/>
<rect x="44" y="18" width="8" height="10" fill="#fff3c4"/>
<rect x="22" y="28" width="6" height="28" fill="#3a7a2c"/>
<rect x="16" y="38" width="6" height="8" fill="#3a7a2c"/>
<rect x="28" y="34" width="6" height="8" fill="#3a7a2c"/>
<rect x="68" y="34" width="6" height="24" fill="#3a7a2c"/>
<rect x="62" y="44" width="6" height="8" fill="#3a7a2c"/>
<rect x="74" y="40" width="6" height="8" fill="#3a7a2c"/>
<rect x="32" y="72" width="32" height="6" fill="#5b9bd5"/>
`)

asset('snow-emblem', `
<rect x="12" y="16" width="72" height="62" fill="#3a2a1a"/>
<rect x="16" y="12" width="64" height="62" fill="#f4ecd6"/>
<rect x="22" y="54" width="52" height="14" fill="#c7f2ff"/>
<rect x="42" y="16" width="12" height="46" fill="#80d8ff"/>
<rect x="34" y="28" width="28" height="18" fill="#5b9bd5"/>
<rect x="38" y="20" width="20" height="8" fill="#c7f2ff"/>
<rect x="30" y="42" width="36" height="8" fill="#ffffff"/>
<rect x="24" y="32" width="8" height="26" fill="#6b4226"/>
<rect x="18" y="28" width="20" height="10" fill="#f4ecd6"/>
<rect x="20" y="20" width="16" height="8" fill="#ffffff"/>
<rect x="66" y="36" width="6" height="20" fill="#6b4226"/>
<rect x="58" y="30" width="22" height="10" fill="#f4ecd6"/>
<rect x="62" y="22" width="14" height="8" fill="#ffffff"/>
`)

asset('creator-emblem', `
<rect x="12" y="20" width="72" height="58" fill="#3a2a1a"/>
<rect x="16" y="16" width="64" height="58" fill="#e6c47a"/>
<rect x="20" y="48" width="48" height="12" fill="#8a5a3c"/>
<rect x="24" y="42" width="36" height="6" fill="#6b4226"/>
<rect x="36" y="22" width="6" height="30" fill="#6b4226"/>
<rect x="42" y="24" width="20" height="18" fill="#f4ecd6"/>
<rect x="62" y="34" width="6" height="24" fill="#3a2a1a"/>
<rect x="62" y="28" width="16" height="6" fill="#f2c14e"/>
<rect x="72" y="34" width="6" height="12" fill="#f2c14e"/>
<rect x="18" y="62" width="18" height="6" fill="#5b9bd5"/>
<rect x="38" y="64" width="28" height="4" fill="#5b9bd5"/>
<rect x="30" y="8" width="36" height="6" fill="#fff3c4"/>
`)

asset('custom-emblem', `
<rect x="12" y="18" width="72" height="62" fill="#3a2a1a"/>
<rect x="16" y="14" width="64" height="62" fill="#9cc4e4"/>
<rect x="20" y="54" width="56" height="12" fill="#5b9bd5"/>
<rect x="28" y="46" width="40" height="10" fill="#5fa64d"/>
<rect x="34" y="36" width="28" height="10" fill="#f2c14e"/>
<rect x="42" y="20" width="12" height="16" fill="#fff3c4"/>
<rect x="38" y="28" width="20" height="8" fill="#c7f2ff"/>
<rect x="30" y="24" width="8" height="8" fill="#f4ecd6"/>
<rect x="58" y="24" width="8" height="8" fill="#f4ecd6"/>
<rect x="24" y="64" width="8" height="8" fill="#e6c47a"/>
<rect x="64" y="64" width="8" height="8" fill="#e6c47a"/>
<rect x="18" y="8" width="10" height="6" fill="#fff3c4"/>
<rect x="68" y="8" width="10" height="6" fill="#fff3c4"/>
<rect x="44" y="4" width="8" height="8" fill="#fff3c4"/>
`)

asset('coin', `
<rect x="24" y="18" width="48" height="60" fill="#3a2a1a"/>
<rect x="18" y="24" width="60" height="48" fill="#3a2a1a"/>
<rect x="26" y="18" width="44" height="60" fill="#c9963f"/>
<rect x="18" y="26" width="60" height="44" fill="#f2c14e"/>
<rect x="28" y="32" width="38" height="28" fill="#fff3c4"/>
<rect x="42" y="26" width="10" height="38" fill="#d8aa4f"/>
<rect x="34" y="38" width="28" height="8" fill="#f2c14e"/>
<rect x="38" y="50" width="20" height="6" fill="#c9963f"/>
`, 64)

asset('starfruit', `
<rect x="28" y="4" width="8" height="16" fill="#3a2a1a"/>
<rect x="20" y="20" width="24" height="8" fill="#3a2a1a"/>
<rect x="4" y="28" width="56" height="8" fill="#3a2a1a"/>
<rect x="16" y="36" width="32" height="8" fill="#3a2a1a"/>
<rect x="12" y="44" width="12" height="12" fill="#3a2a1a"/>
<rect x="40" y="44" width="12" height="12" fill="#3a2a1a"/>
<rect x="30" y="8" width="4" height="16" fill="#fff3c4"/>
<rect x="22" y="22" width="20" height="8" fill="#f2c14e"/>
<rect x="8" y="30" width="48" height="6" fill="#f2c14e"/>
<rect x="20" y="36" width="24" height="8" fill="#f2c14e"/>
<rect x="16" y="44" width="8" height="8" fill="#e6c47a"/>
<rect x="40" y="44" width="8" height="8" fill="#e6c47a"/>
`, 64)

asset('trophy', `
<rect x="18" y="10" width="28" height="8" fill="#3a2a1a"/>
<rect x="14" y="18" width="36" height="28" fill="#3a2a1a"/>
<rect x="8" y="22" width="10" height="18" fill="#3a2a1a"/>
<rect x="46" y="22" width="10" height="18" fill="#3a2a1a"/>
<rect x="24" y="46" width="16" height="10" fill="#3a2a1a"/>
<rect x="18" y="56" width="28" height="6" fill="#3a2a1a"/>
<rect x="20" y="12" width="24" height="6" fill="#fff3c4"/>
<rect x="18" y="18" width="28" height="24" fill="#f2c14e"/>
<rect x="10" y="24" width="8" height="12" fill="#f2c14e"/>
<rect x="46" y="24" width="8" height="12" fill="#f2c14e"/>
<rect x="26" y="44" width="12" height="10" fill="#c9963f"/>
<rect x="22" y="56" width="20" height="4" fill="#e6c47a"/>
`, 64)

asset('gear', `
<rect x="28" y="4" width="8" height="12" fill="#3a2a1a"/>
<rect x="28" y="48" width="8" height="12" fill="#3a2a1a"/>
<rect x="4" y="28" width="12" height="8" fill="#3a2a1a"/>
<rect x="48" y="28" width="12" height="8" fill="#3a2a1a"/>
<rect x="16" y="12" width="32" height="40" fill="#3a2a1a"/>
<rect x="12" y="16" width="40" height="32" fill="#3a2a1a"/>
<rect x="30" y="6" width="4" height="12" fill="#f4ecd6"/>
<rect x="30" y="46" width="4" height="12" fill="#f4ecd6"/>
<rect x="6" y="30" width="12" height="4" fill="#f4ecd6"/>
<rect x="46" y="30" width="12" height="4" fill="#f4ecd6"/>
<rect x="20" y="16" width="24" height="32" fill="#9cc4e4"/>
<rect x="16" y="20" width="32" height="24" fill="#9cc4e4"/>
<rect x="24" y="24" width="16" height="16" fill="#3a2a1a"/>
<rect x="28" y="28" width="8" height="8" fill="#f4ecd6"/>
`, 64)

asset('wood-panel-corner', `
<rect x="0" y="0" width="96" height="96" fill="#3a2a1a"/>
<rect x="8" y="8" width="80" height="80" fill="#8a5a3c"/>
<rect x="16" y="16" width="64" height="64" fill="#f4ecd6"/>
<rect x="8" y="8" width="72" height="8" fill="#c9963f"/>
<rect x="8" y="16" width="8" height="64" fill="#6b4226"/>
<rect x="70" y="18" width="8" height="8" fill="#f2c14e"/>
<rect x="20" y="70" width="8" height="8" fill="#f2c14e"/>
`)

writeFileSync(join(process.cwd(), 'public', 'original-assets', 'manifest.json'), JSON.stringify({
  name: 'Vibe Islands Original Cozy Pixel Pack',
  license: 'Original assets generated in-repo for this project.',
  sprites: {
    themes: {
      origin: 'sprites/origin-emblem.svg',
      desert: 'sprites/desert-emblem.svg',
      snow: 'sprites/snow-emblem.svg',
      creator: 'sprites/creator-emblem.svg',
      custom: 'sprites/custom-emblem.svg',
    },
    ui: {
      coin: 'sprites/coin.svg',
      star: 'sprites/starfruit.svg',
      trophy: 'sprites/trophy.svg',
      gear: 'sprites/gear.svg',
      panelCorner: 'sprites/wood-panel-corner.svg',
    },
  },
}, null, 2), 'utf8')

console.log(`Generated original assets in ${outDir}`)
