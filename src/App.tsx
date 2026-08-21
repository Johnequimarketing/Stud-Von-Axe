import { Header } from './components/header'
import { Footer } from './components/Footer'
import {
  Arrival,
  Statement,
  Estate,
  Horses,
  Terra,
  Programme,
  ProofStrip,
  Gallery,
  Invitation,
} from './sections/tenuta'

/* Direction C: La Tenuta. The page is the emotional journey the brief
   names: arrival, discovery, connection, trust, desire, action. The old
   section folders stay on disk for the other directions but nothing here
   imports them, so they tree-shake out of this build. */
export function App() {
  return (
    <>
      <Header />
      <main id="main">
        <Arrival />
        <Statement />
        <Estate />
        <Horses />
        <Terra />
        <Programme />
        <ProofStrip />
        <Gallery />
        <Invitation />
      </main>
      <Footer />
    </>
  )
}
