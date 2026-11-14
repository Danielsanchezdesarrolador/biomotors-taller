import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '#test-records': fileURLToPath(new URL('./tests/fixtures/records.ts', import.meta.url))
    }
  },
  test: { include: ['src/**/*.test.{ts,tsx}'] }
})
