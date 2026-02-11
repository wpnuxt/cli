import { defineCommand } from 'citty'
import * as p from '@clack/prompts'
import { resolve } from 'pathe'
import pc from 'picocolors'
import { installDependencies } from 'nypm'
import { addArgs } from '../_shared'
import { addCore } from '../../add'
import { isValidUrl } from '../../utils'

export default defineCommand({
  meta: {
    name: 'core',
    description: 'Add @wpnuxt/core to your Nuxt project'
  },
  args: {
    ...addArgs,
    'wordpress-url': {
      type: 'string',
      description: 'WordPress site URL',
      alias: 'w'
    }
  },
  async run({ args }) {
    p.intro(pc.bold('wpnuxi add core'))

    const cwd = resolve(args.cwd)

    let wpUrl = args['wordpress-url']
    if (!wpUrl) {
      const result = await p.text({
        message: 'WordPress site URL',
        placeholder: 'http://127.0.0.1:9400',
        defaultValue: 'http://127.0.0.1:9400',
        validate(value) {
          if (!isValidUrl(value)) return 'Please enter a valid URL (http:// or https://)'
        }
      })
      if (p.isCancel(result)) {
        p.cancel('Operation cancelled.')
        process.exit(0)
      }
      wpUrl = result
    }
    wpUrl = wpUrl.replace(/\/+$/, '')

    const s = p.spinner()
    s.start('Adding @wpnuxt/core...')

    try {
      await addCore({ cwd, skipInstall: args['skip-install'], force: args.force })

      // Write the WordPress URL to .env
      const { writeFileSync, readFileSync, existsSync } = await import('node:fs')
      const envPath = resolve(cwd, '.env')
      let envContent = ''
      if (existsSync(envPath)) {
        envContent = readFileSync(envPath, 'utf-8')
      }
      // Replace or set the URL
      if (envContent.includes('WPNUXT_WORDPRESS_URL=')) {
        envContent = envContent.replace(/WPNUXT_WORDPRESS_URL=.*/, `WPNUXT_WORDPRESS_URL=${wpUrl}`)
      }
      else {
        const separator = envContent && !envContent.endsWith('\n') ? '\n' : ''
        envContent += separator + `WPNUXT_WORDPRESS_URL=${wpUrl}\n`
      }
      writeFileSync(envPath, envContent)

      s.stop('@wpnuxt/core added.')
    }
    catch (err) {
      s.stop('Failed to add @wpnuxt/core.')
      p.log.error(String(err))
      process.exit(1)
    }

    if (!args['skip-install']) {
      s.start('Installing dependencies...')
      try {
        await installDependencies({ cwd })
        s.stop('Dependencies installed.')
      }
      catch {
        s.stop(pc.yellow('Failed to install dependencies. Run install manually.'))
      }
    }

    p.outro(pc.green('@wpnuxt/core is ready!'))
  }
})
