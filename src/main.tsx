import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './premium.css'

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el contenedor principal')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // El modo web sigue funcionando si el navegador impide el registro.
    })
  })
}
