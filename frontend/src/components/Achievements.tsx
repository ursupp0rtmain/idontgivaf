import { useEffect, useRef, useState } from 'react'
import { useStats } from '../statsContext'

interface Achievement {
  id: string
  label: string
  desc: string
}

const MILESTONES: { attempts: number; ach: Achievement }[] = [
  { attempts: 1,  ach: { id: 'curious',    label: 'Neugierig',    desc: 'Du hast es versucht.' } },
  { attempts: 5,  ach: { id: 'persistent', label: 'Hartnäckig',   desc: '5 Versuche. Respekt. Wirklich.' } },
  { attempts: 20, ach: { id: 'hopeless',   label: 'Hoffnungslos', desc: '20 Versuche. Bitte hol dir Hilfe.' } },
  { attempts: 50, ach: { id: 'legend',     label: 'Legende',      desc: '50 Versuche. Du bist das Nichts.' } },
]

const CLICK_ACH: Achievement = {
  id: 'winner', label: 'Gewinner', desc: 'Du hast den Knopf geklickt. Wofür.',
}

export default function Achievements() {
  const { sessionAttempts, clicks } = useStats()
  const [visible, setVisible] = useState<(Achievement & { key: number })[]>([])
  const unlockedRef = useRef(new Set<string>())
  const keyRef      = useRef(0)

  function push(ach: Achievement) {
    if (unlockedRef.current.has(ach.id)) return
    unlockedRef.current.add(ach.id)
    const key = keyRef.current++
    setVisible(v => [...v, { ...ach, key }])
    setTimeout(() => {
      setVisible(v => v.filter(a => a.key !== key))
    }, 5000)
  }

  useEffect(() => {
    for (const { attempts, ach } of MILESTONES) {
      if (sessionAttempts >= attempts) push(ach)
    }
  }, [sessionAttempts])

  const prevClicksRef = useRef(0)
  useEffect(() => {
    if (clicks > prevClicksRef.current) push(CLICK_ACH)
    prevClicksRef.current = clicks
  }, [clicks])

  if (visible.length === 0) return null

  return (
    <div className="achievement-stack" aria-live="polite">
      {visible.map(a => (
        <div key={a.key} className="achievement">
          <p className="achievement-title">✦ {a.label}</p>
          <p>{a.desc}</p>
        </div>
      ))}
    </div>
  )
}
