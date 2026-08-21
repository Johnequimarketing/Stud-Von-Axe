import { Header } from './components/header'
import { Footer } from './components/Footer'
import { ArrivalCielo } from './sections/cielo/ArrivalCielo'
import { EstateCielo } from './sections/cielo/EstateCielo'
import { HorsesCielo } from './sections/cielo/HorsesCielo'
import { ReachPlate } from './sections/cielo/ReachPlate'
import { ProgrammeCielo } from './sections/cielo/ProgrammeCielo'
import { GalleryMosaic } from './sections/cielo/GalleryMosaic'
import { InvitationSky } from './sections/cielo/InvitationSky'
import { Statement, ProofStrip } from './sections/tenuta'

/* Direction D: Cielo, built step by step. Step 1 is the fold: the airy
   pastel arrival and the glass header. The sections below the fold are
   still Direction C's while D grows; they get their own treatment once
   the fold is approved. */
export function App() {
  return (
    <>
      <Header />
      <main id="main">
        <ArrivalCielo />
        <Statement />
        <EstateCielo />
        <HorsesCielo />
        <ReachPlate />
        <ProgrammeCielo />
        <ProofStrip />
        <GalleryMosaic />
        <InvitationSky />
      </main>
      <Footer />
    </>
  )
}
