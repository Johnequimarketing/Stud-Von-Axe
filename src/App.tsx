import { Header } from './components/header'
import { Footer } from './components/Footer'
import { Hero } from './sections/hero'
import { Intro } from './sections/intro'
import { OfferIndex } from './sections/offer'
import { AvailableNow } from './sections/available'
import { Bloodlines } from './sections/bloodlines'
import { SemenBand } from './sections/semen'
import { Proof } from './sections/proof'
import { Bases } from './sections/bases'
import { News } from './sections/news'
import { Contact } from './sections/contact'

export function App() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Intro />
        <OfferIndex />
        <AvailableNow />
        <Bloodlines />
        <SemenBand />
        <Proof />
        <Bases />
        <News />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
