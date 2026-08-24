import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* Direction D type. Jost carries the display and the UI: a geometric sans
   whose semibold holds a statement without shouting. Libre Caslon carries
   the accent word and horse names.
   TWO Caslon packages on purpose: Display has the tighter, more elegant
   upright cut but ships 400 NORMAL ONLY, so an italic from it is a faux
   oblique, and a mechanical shear is very visible on a display serif at
   85px. Text ships a real italic, so the accent word takes that. Same
   family voice, no synthesised slant. */
import '@fontsource-variable/jost'
import '@fontsource/libre-caslon-display/400.css'
import '@fontsource/libre-caslon-text/400-italic.css'

/* Still loaded: Fraunces and Instrument Sans dress the sections below the
   fold that have not been rebuilt in Direction D's voice yet. */
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
