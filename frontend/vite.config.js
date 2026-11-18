import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const rootEnvDir = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  envDir: rootEnvDir,
  plugins: [react(), tailwindcss()],
})
