import type { ReactNode } from 'react'

/**
 * Mark's headline device: one word of the sentence set apart in italic
 * accent. The word must be a substring of the text; first occurrence wins,
 * and a miss renders the plain sentence rather than throwing. The caller
 * supplies the em's class because CSS Modules hash per file.
 */
export function Accented({
  text,
  accent,
  emClassName,
}: {
  text: string
  accent?: string
  emClassName?: string
}): ReactNode {
  const at = accent ? text.indexOf(accent) : -1
  if (!accent || at === -1) return <>{text}</>

  return (
    <>
      {text.slice(0, at)}
      <em className={emClassName}>{accent}</em>
      {text.slice(at + accent.length)}
    </>
  )
}
