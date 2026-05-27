import { useState, useCallback } from 'react'
import { StatsProvider, useStats } from './statsContext'
import FleeingButton from './components/FleeingButton'
import EasterEgg     from './components/EasterEgg'
import VoidScroll    from './components/VoidScroll'
import Achievements  from './components/Achievements'

function fmt(n: number) {
  return n.toLocaleString('de-DE')
}

function Hero({ onEasterEgg, eggActive }: { onEasterEgg: () => void; eggActive: boolean }) {
  const { attempts, clicks, visitors, sessionAttempts } = useStats()

  return (
    <section className="hero">
      <p className="site-id">idontgivaf.uk</p>

      <div className="live-badge">
        <span className={`live-dot${visitors > 0 ? ' active' : ''}`} />
        <span>{fmt(visitors)} {visitors === 1 ? 'seele' : 'seelen'} verlieren gerade ihre zeit</span>
      </div>

      <p className="counter-label">gegebene f*cks</p>

      {/* Counter + Status werden von EasterEgg gesteuert */}
      <EasterEgg active={eggActive} onDone={onEasterEgg} />

      <div className="global-stats">
        <span>
          <span className="stat-value">{fmt(attempts)}</span> globale versuche
        </span>
        <span>·</span>
        <span>
          <span className="stat-value">{fmt(clicks)}</span> beschämende erfolge
        </span>
        <span>·</span>
        <span>
          <span className="stat-value">{fmt(sessionAttempts)}</span> deine versuche
        </span>
      </div>

      <p className="scroll-hint">↓ &nbsp; hier unten ist auch nichts &nbsp; ↓</p>
    </section>
  )
}

function Inner() {
  const [eggActive, setEggActive] = useState(false)

  const startEgg = useCallback(() => {
    if (!eggActive) setEggActive(true)
  }, [eggActive])

  // EasterEgg ruft onDone wenn fertig — hier togglen wir zurück
  // Trick: wir übergeben startEgg als onDone weil EasterEgg nach fertig sein
  // onDone() aufruft — wir brauchen aber ein "done" Signal.
  // Deshalb: separater Callback.
  const endEgg = useCallback(() => {
    setEggActive(false)
  }, [])

  return (
    <>
      <Hero onEasterEgg={endEgg} eggActive={eggActive} />
      <VoidScroll />
      <FleeingButton onEasterEgg={startEgg} disabled={eggActive} />
      <Achievements />
    </>
  )
}

export default function App() {
  return (
    <StatsProvider>
      <Inner />
    </StatsProvider>
  )
}
