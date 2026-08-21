import { useState } from 'react'
import { ReachPlate } from './ReachPlate'
import { ReachDepartures } from './ReachDepartures'
import { ReachArc } from './ReachArc'
import { ReachGlass } from './ReachGlass'
import styles from './ReachPicker.module.css'

/* TEMPORARY review scaffolding, exactly like the earlier concept rounds:
   three concepts for the reach section behind one switch. The winner folds
   back into a plain component and this file plus the losers get deleted. */

const CONCEPTS = [
  { id: 'd', label: 'D. Navy plate', note: 'Contained navy plate, copy left and photograph right, with the counted destinations under the body.' },
  { id: 'a', label: 'A. Departures', note: 'No photograph. The register of horses that have left, with where each went.' },
  { id: 'b', label: 'B. The Arc', note: 'The journey drawn, not photographed: one gold arc with the destinations along it.' },
  { id: 'c', label: 'C. Cinematic glass', note: 'The full bleed field stays, with a frosted plate carrying the evidence.' },
] as const

export function ReachPicker() {
  const [pick, setPick] = useState<'a' | 'b' | 'c' | 'd'>('d')
  const current = CONCEPTS.find((c) => c.id === pick)

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <p className={styles.title}>Reach section, 4 concepts</p>
        <div className={styles.buttons}>
          {CONCEPTS.map((concept) => (
            <button
              key={concept.id}
              type="button"
              className={styles.button}
              aria-pressed={pick === concept.id}
              onClick={() => setPick(concept.id)}
            >
              {concept.label}
            </button>
          ))}
        </div>
        <p className={styles.note}>{current?.note}</p>
      </div>

      {pick === 'd' ? <ReachPlate /> : null}
      {pick === 'a' ? <ReachDepartures /> : null}
      {pick === 'b' ? <ReachArc /> : null}
      {pick === 'c' ? <ReachGlass /> : null}
    </div>
  )
}
