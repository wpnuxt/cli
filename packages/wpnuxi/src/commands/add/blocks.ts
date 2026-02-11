import { defineCommand } from 'citty'
import * as p from '@clack/prompts'
import { resolve } from 'pathe'
import pc from 'picocolors'
import { installDependencies } from 'nypm'
import { addArgs } from '../_shared'
import { addBlocks } from '../../add'

export default defineCommand({
  meta: {
    name: 'blocks',
    description: 'Add @wpnuxt/blocks to your Nuxt project'
  },
  args: addArgs,
  async run({ args }) {
    p.intro(pc.bold('wpnuxi add blocks'))

    const cwd = resolve(args.cwd)
    const s = p.spinner()
    s.start('Adding @wpnuxt/blocks...')

    try {
      await addBlocks({ cwd, skipInstall: args['skip-install'], force: args.force })
      s.stop('@wpnuxt/blocks added.')
    }
    catch (err) {
      s.stop('Failed to add @wpnuxt/blocks.')
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

    p.outro(pc.green('@wpnuxt/blocks is ready!'))
  }
})
