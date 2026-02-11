import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'pathe'
import { loadFile, writeFile } from 'magicast'

export interface AddAuthOptions {
  cwd: string
  skipInstall?: boolean
  force?: boolean
}

const LOGIN_PAGE_NUXT_UI = `<script setup lang="ts">
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    await navigateTo('/')
  }
  catch (e: any) {
    error.value = e.data?.message || 'Login failed'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-xl font-bold">Login</h1>
      </template>

      <UForm :state="{ username, password }" @submit="onSubmit">
        <UFormField label="Username" name="username" class="mb-4">
          <UInput v-model="username" placeholder="Username" />
        </UFormField>

        <UFormField label="Password" name="password" class="mb-4">
          <UInput v-model="password" type="password" placeholder="Password" />
        </UFormField>

        <UAlert v-if="error" color="error" :title="error" class="mb-4" />

        <UButton type="submit" block :loading="loading">
          Sign in
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
`

const LOGIN_PAGE_PLAIN = `<script setup lang="ts">
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    await navigateTo('/')
  }
  catch (e: any) {
    error.value = e.data?.message || 'Login failed'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <form class="w-full max-w-md rounded-lg bg-white p-8 shadow" @submit.prevent="onSubmit">
      <h1 class="mb-6 text-xl font-bold">Login</h1>

      <div class="mb-4">
        <label class="mb-1 block text-sm font-medium" for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Username"
          class="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <div class="mb-4">
        <label class="mb-1 block text-sm font-medium" for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>
`

export async function addAuth(options: AddAuthOptions): Promise<void> {
  const { cwd } = options
  const configPath = resolve(cwd, 'nuxt.config.ts')

  if (!existsSync(configPath)) {
    throw new Error('nuxt.config.ts not found. Are you in a Nuxt project?')
  }

  // Update nuxt.config.ts
  const mod = await loadFile(configPath)
  const config = mod.exports.default.$args[0]

  if (!config.modules) config.modules = []
  if (!config.modules.includes('@wpnuxt/auth')) {
    config.modules.push('@wpnuxt/auth')
  }

  if (!config.wpNuxtAuth) config.wpNuxtAuth = {}
  config.wpNuxtAuth.providers = {
    password: true,
    headlessLogin: true,
  }

  await writeFile(mod, configPath)

  // Update package.json
  const pkgPath = resolve(cwd, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  pkg.dependencies ||= {}
  if (!pkg.dependencies['@wpnuxt/auth']) {
    pkg.dependencies['@wpnuxt/auth'] = 'latest'
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  // Scaffold login page
  const hasNuxtUI = !!(pkg.dependencies?.['@nuxt/ui'] || pkg.devDependencies?.['@nuxt/ui'])
  const loginTemplate = hasNuxtUI ? LOGIN_PAGE_NUXT_UI : LOGIN_PAGE_PLAIN

  // Detect app/ directory structure
  const appPagesDir = resolve(cwd, 'app', 'pages')
  const rootPagesDir = resolve(cwd, 'pages')
  const pagesDir = existsSync(resolve(cwd, 'app')) ? appPagesDir : rootPagesDir
  const loginPath = resolve(pagesDir, 'login.vue')

  if (!existsSync(loginPath) || options.force) {
    mkdirSync(pagesDir, { recursive: true })
    writeFileSync(loginPath, loginTemplate)
  }
}
