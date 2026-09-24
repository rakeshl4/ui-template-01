import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import '@fontsource/lato/300.css'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
import './styles/globals.css'

import { Providers } from '@/app/providers'
import { router } from '@/app/router'

async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS !== 'true') return
  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  )
})
