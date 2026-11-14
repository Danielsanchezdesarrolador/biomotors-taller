import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
const root = normalizePath(fileURLToPath(new URL('.', import.meta.url)))
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'official-public-boundary',
      generateBundle() {
        const files = [...this.getModuleIds()].map((id) => normalizePath(id))
        const application = files.filter(
          (id) => id.startsWith(root + 'src/') || id.startsWith(root + 'tests/')
        )
        const forbidden = application.filter(
          (id) =>
            /\.test\./.test(id) ||
            (!id.endsWith('.css') &&
              !/\/src\/(?:main\.tsx|App\.tsx|layout\/|official\/|access\/|brand\/)/.test(id))
        )
        if (forbidden.length)
          this.error('Public build imported non-public modules: ' + forbidden.join(', '))
        this.emitFile({
          type: 'asset',
          fileName: '.vite/public-modules.json',
          source: JSON.stringify(
            application.map((id) => id.slice(id.indexOf('/src/') + 1)),
            null,
            2
          )
        })
      }
    }
  ],
  resolve: {
    alias: {
      '#test-records': fileURLToPath(new URL('./src/data/emptyTestRecords.ts', import.meta.url))
    }
  },
  server: {
    fs: { deny: ['**/tests/**', '**/docs/**', '**/scripts/**', '**/.git/**', '**/.env*'] }
  },
  build: { target: 'es2022', manifest: true }
})
