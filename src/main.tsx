import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
import '@fontsource-variable/archivo'

import './styles/tokens.css'
import './styles/global.css'

import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
