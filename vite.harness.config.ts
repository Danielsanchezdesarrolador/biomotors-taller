// Loopback-only test runner. Not selected by npm dev/build or by the Render build.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('.', import.meta.url))
export default defineConfig({
  root: root + 'tests/harness',
  publicDir: root + 'public',
  plugins: [react()],
  resolve: { alias: { '#test-records': root + 'tests/fixtures/records.ts' } },
  server: { host: '127.0.0.1', fs: { allow: [root] } }
})
