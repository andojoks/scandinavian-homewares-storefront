import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { RECORD_MODE } from './lib/record'
import { router } from './router'

declare global {
  interface Window {
    KVIST?: { start: () => void }
  }
}

const root = createRoot(document.getElementById('root')!)
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

if (RECORD_MODE) {
  window.KVIST = { start: () => root.render(app) }
} else {
  root.render(app)
}
