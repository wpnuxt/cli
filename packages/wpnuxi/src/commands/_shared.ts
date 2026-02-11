import type { ArgDef } from 'citty'

export const cwdArgs = {
  cwd: {
    type: 'string',
    description: 'Working directory',
    default: '.'
  }
} satisfies Record<string, ArgDef>

export const addArgs = {
  ...cwdArgs,
  'skip-install': {
    type: 'boolean',
    description: 'Skip dependency installation',
    default: false
  },
  force: {
    type: 'boolean',
    description: 'Overwrite existing files',
    default: false
  }
} satisfies Record<string, ArgDef>
