import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'pathe'
import { loadFile, writeFile, builders } from 'magicast'

export interface AddCoreOptions {
  cwd: string
  skipInstall?: boolean
  force?: boolean
}

export async function addCore(options: AddCoreOptions): Promise<void> {
  const { cwd } = options
  const configPath = resolve(cwd, 'nuxt.config.ts')

  if (!existsSync(configPath)) {
    throw new Error('nuxt.config.ts not found. Are you in a Nuxt project?')
  }

  // Update nuxt.config.ts
  const mod = await loadFile(configPath)
  const config = mod.exports.default.$args[0]

  if (!config.modules) config.modules = []
  if (!config.modules.includes('@wpnuxt/core')) {
    config.modules.push('@wpnuxt/core')
  }

  if (!config.wpNuxt) config.wpNuxt = {}
  config.wpNuxt.wordpressUrl = builders.raw('process.env.WPNUXT_WORDPRESS_URL')

  await writeFile(mod, configPath)

  // Update package.json
  const pkgPath = resolve(cwd, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  pkg.dependencies ||= {}
  if (!pkg.dependencies['@wpnuxt/core']) {
    pkg.dependencies['@wpnuxt/core'] = 'latest'
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  // Create/update .env
  const envPath = resolve(cwd, '.env')
  let envContent = ''
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8')
  }
  if (!envContent.includes('WPNUXT_WORDPRESS_URL')) {
    const separator = envContent && !envContent.endsWith('\n') ? '\n' : ''
    writeFileSync(envPath, envContent + separator + 'WPNUXT_WORDPRESS_URL=\n')
  }
}
