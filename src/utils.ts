import { existsSync, readdirSync } from 'node:fs'

export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(input)
    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  catch {
    return false
  }
}

export function isDirEmpty(path: string): boolean {
  if (!existsSync(path)) return true
  return readdirSync(path).length === 0
}
