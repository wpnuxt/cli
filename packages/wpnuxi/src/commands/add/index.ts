import type { CommandDef } from 'citty'
import { defineCommand } from 'citty'

function _rDefault(mod: { default: CommandDef }) {
  return mod.default
}

export default defineCommand({
  meta: {
    name: 'add',
    description: 'Add WPNuxt modules to your project'
  },
  subCommands: {
    core: () => import('./core').then(_rDefault),
    blocks: () => import('./blocks').then(_rDefault),
    auth: () => import('./auth').then(_rDefault),
  }
})
