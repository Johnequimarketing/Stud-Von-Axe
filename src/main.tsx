import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* Direction C type: Fraunces carries the display voice, loaded on its
   optical size axis so headline and body cuts come from one file pair.
   Instrument Sans carries body and labels. */
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/instrument-sans'

import './styles/tokens.css'
import './styles/global.css'

import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
