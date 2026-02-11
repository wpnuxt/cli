// Nuxt green (same as create-nuxt: RGB 0, 220, 130)
export const themeColor = '\x1B[38;2;0;220;130m'
const defaultFg = '\x1B[39m'
const reset = '\x1B[0m'

// ASCII art: WPNuxt (Slant font)
// Bold default for "WP", Nuxt green for "Nuxt"
// Per-line split points where P meets N (shared strokes go green)
const lines: [string, number][] = [
  [' _       ______  _   __            __', 15],
  ['| |     / / __ \\/ | / /_  ___  __/ /_', 16],
  ['| | /| / / /_/ /  |/ / / / / |/_/ __/', 15],
  ['| |/ |/ / ____/ /|  / /_/ />  </ /_  ', 14],
  ['|__/|__/_/   /_/ |_/\\__,_/_/|_|\\__/  ', 13],
]

export const wpNuxtAscii = lines
  .map(([line, split]) => `${defaultFg}${line.slice(0, split)}${reset}${themeColor}${line.slice(split)}${reset}`)
  .join('\n')
