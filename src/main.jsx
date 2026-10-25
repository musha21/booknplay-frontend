import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { toast } from 'sonner'
import './index.css'
import App from './App.jsx'
import { ThemeModeProvider } from './theme/ThemeModeContext.jsx'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    toast('A new version of Booknplay is ready.', {
      duration: Infinity,
      id: 'pwa-update',
      action: {
        label: 'Refresh',
        onClick: () => updateSW(true),
      },
    })
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  </StrictMode>,
)
