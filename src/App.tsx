import { Header } from './components/header'
import { Footer } from './components/Footer'
import { ArrivalRefined } from './sections/cielo/ArrivalRefined'
import { FactsStrip } from './sections/cielo/FactsStrip'
import { EstateCielo } from './sections/cielo/EstateCielo'
import { HorsesCielo } from './sections/cielo/HorsesCielo'
import { ReachPlate } from './sections/cielo/ReachPlate'
import { ProgrammeCielo } from './sections/cielo/ProgrammeCielo'
import { GalleryMosaic } from './sections/cielo/GalleryMosaic'
import { InvitationSky } from './sections/cielo/InvitationSky'
import { Statement, ProofStrip } from './sections/tenuta'

/* Direction D: Cielo. The fold is the contained hero under the
   transparent-to-glass header. Statement and ProofStrip are still
   Direction C's. */
export function App() {
  return (
    <>
      <Header />
      <main id="main">
        <ArrivalRefined />
        <FactsStrip />
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
