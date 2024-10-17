/// <reference types="vite/client" />

interface Window {
  electron: import('../electron/preload/index.js').ElectronHandler
}
