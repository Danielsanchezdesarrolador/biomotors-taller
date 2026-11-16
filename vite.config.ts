import { defineConfig, normalizePath, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
const root = normalizePath(fileURLToPath(new URL('.', import.meta.url)))
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env }
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith('VITE_') || !value) continue
    if (/SECRET|SERVICE_ROLE|PASSWORD/i.test(name) || value.startsWith('sb_secret_'))
      throw new Error('Unsafe public environment configuration; no build was generated.')
  }
  if (env.VITE_BT_CP03_PRIVATE_ENABLED === 'true' && env.VITE_BT_AUTH_R1_ENABLED !== 'true')
    throw new Error('CP03 private access requires R1 authentication; refusing build.')
  if (
    env.VITE_BT_CP04_PRIVATE_ENABLED === 'true' &&
    (env.VITE_BT_AUTH_R1_ENABLED !== 'true' || env.VITE_BT_CP03_PRIVATE_ENABLED !== 'true')
  )
    throw new Error('CP04 needs verified Auth R1 + CP03 directory before private build.')
  if (env.VITE_BT_CP05_PRIVATE_ENABLED === 'true' && env.VITE_BT_CP04_PRIVATE_ENABLED !== 'true')
    throw new Error('CP05 requires CP04 private rollout.')
  if(env.VITE_BT_CP06_PRIVATE_ENABLED==='true'&&env.VITE_BT_CP04_PRIVATE_ENABLED!=='true')throw new Error('CP06 requires verified CP03/CP04 private rollout.')
  if(env.VITE_BT_CP05_DOCUMENTS_ENABLED==='true'&&env.VITE_BT_CP05_PRIVATE_ENABLED!=='true')throw new Error('CP05 documents require private CP05.')
  if(env.VITE_BT_CP05_EMAIL_ENABLED==='true'&&env.VITE_BT_CP05_DOCUMENTS_ENABLED!=='true')throw new Error('CP05 email requires approved private documents.')
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (key && !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))
    throw new Error('Only a Supabase publishable key may be included in the frontend.')
  if (env.VITE_SUPABASE_ANON_KEY)
    throw new Error('Remove the legacy public key; configure VITE_SUPABASE_PUBLISHABLE_KEY.')
  return {
    plugins: [
      react(),
      {
        name: 'official-public-boundary',
        generateBundle() {
          const files = [...this.getModuleIds()].map((id) => normalizePath(id))
          const application = files.filter(
            (id) =>
              id.startsWith(root + 'src/') ||
              id.startsWith(root + 'tests/') ||
              id.startsWith(root + 'server/')
          )
          const forbidden = application.filter(
            (id) =>
              /\.test\./.test(id) ||
              (!id.endsWith('.css') &&
                !(env.VITE_BT_CP06_PRIVATE_ENABLED==='true' && /\/src\/historial\//.test(id)) &&
                !(
                  env.VITE_BT_CP05_PRIVATE_ENABLED === 'true' &&
                  /\/src\/(?:cp05\/|informes\/trabajos\/(?:WorkItemsEditor|workItemCore)\.|ordenes\/orderMoney\.)/.test(
                    id
                  )
                ) &&
                !(
                  env.VITE_BT_CP04_PRIVATE_ENABLED === 'true' &&
                  /\/src\/ordenes\/(?:Cp04(?:PrivatePanel|OrdersView|MultipuntoChecklist)|cp04(?:Contracts|Repository|Draft|Multipunto|Autosave))\.(?:ts|tsx|js)/.test(
                    id
                  )
                ) &&
                !(
                  env.VITE_BT_CP04_PRIVATE_ENABLED === 'true' &&
                  /\/src\/informes\/multipunto\/(?:MultipuntoTable|multipuntoTemplate)\.(?:ts|tsx|js)/.test(
                    id
                  )
                ) &&
                !(
                  env.VITE_BT_CP03_PRIVATE_ENABLED === 'true' &&
                  /\/src\/clientes\/(?:Cp06HistoryLoader|Cp03PrivatePanel|cp03Pilot(?:DirectoryView|Repository|Contracts|AccessBinding))\.(?:ts|tsx|js)/.test(
                    id
                  )
                ) &&
                !/\/src\/(?:main\.tsx|App\.tsx|layout\/|official\/|access\/|brand\/|auth\/)/.test(
                  id
                ))
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
  }
})
