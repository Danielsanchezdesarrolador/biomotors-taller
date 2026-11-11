// BT-CP01: service worker básico sin caché de datos privados ni API.
// El almacenamiento offline, las estrategias de actualización y los iconos PNG
// se abordarán con pruebas reales de dispositivo antes del piloto.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
