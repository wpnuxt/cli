import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'pathe'
import { loadFile, writeFile, builders } from 'magicast'

export interface AddBlocksOptions {
  cwd: string
  skipInstall?: boolean
  force?: boolean
}

export async function addBlocks(options: AddBlocksOptions): Promise<void> {
  const { cwd } = options
  const configPath = resolve(cwd, 'nuxt.config.ts')

  if (!existsSync(configPath)) {
    throw new Error('nuxt.config.ts not found. Are you in a Nuxt project?')
  }

  // Update nuxt.config.ts
  const mod = await loadFile(configPath)
  const config = mod.exports.default.$args[0]

  if (!config.modules) config.modules = []
  if (!config.modules.includes('@wpnuxt/blocks')) {
    config.modules.push('@wpnuxt/blocks')
  }

  if (!config.wpNuxtBlocks) config.wpNuxtBlocks = {}
  config.wpNuxtBlocks.imageDomains = builders.raw("[new URL(process.env.WPNUXT_WORDPRESS_URL || 'http://localhost').hostname]")

  await writeFile(mod, configPath)

  // Update package.json
  const pkgPath = resolve(cwd, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  pkg.dependencies ||= {}
  if (!pkg.dependencies['@wpnuxt/blocks']) {
    pkg.dependencies['@wpnuxt/blocks'] = 'latest'
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}
