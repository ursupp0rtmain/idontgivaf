import { useState, useCallback } from 'react'
import { StatsProvider, useStats } from './statsContext'
import FleeingButton from './components/FleeingButton'
import EasterEgg     from './components/EasterEgg'
import VoidScroll    from './components/VoidScroll'
import Achievements  from './components/Achievements'
import LiveFeed      from './components/LiveFeed'
import DevPortal     from './components/DevPortal'

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

function Hero({ onEasterEgg, eggActive }: { onEasterEgg: () => void; eggActive: boolean }) {
  const { attempts, clicks, visitors, sessionAttempts, apiCalls } = useStats()

  return (
    <section className="hero">
      <p className="site-id">idontgivaf.uk</p>

      <div className="live-badge">
        <span className={`live-dot${visitors > 0 ? ' active' : ''}`} />
        <span>{fmt(visitors)} {visitors === 1 ? 'person' : 'people'} currently wasting time</span>
      </div>

      <p className="counter-label">f*cks given</p>

      <EasterEgg active={eggActive} onDone={onEasterEgg} />

      <div className="global-stats">
        <span>
          <span className="stat-value">{fmt(attempts)}</span> global attempts
        </span>
        <span>·</span>
        <span>
          <span className="stat-value">{fmt(clicks)}</span> embarrassing wins
        </span>
        <span>·</span>
        <span>
          <span className="stat-value">{fmt(sessionAttempts)}</span> your attempts
        </span>
        <span>·</span>
        <span>
          <span className="stat-value">{fmt(apiCalls)}</span> API rejections
        </span>
      </div>

      <p className="scroll-hint">↓ &nbsp; nothing down here either &nbsp; ↓</p>
    </section>
  )
}

function Main({ onOpenPortal }: { onOpenPortal: () => void }) {
  const [eggActive, setEggActive] = useState(false)

  const startEgg = useCallback(() => {
    if (!eggActive) setEggActive(true)
  }, [eggActive])

  const endEgg = useCallback(() => {
    setEggActive(false)
  }, [])

  return (
    <>
      <Hero onEasterEgg={endEgg} eggActive={eggActive} />
      <VoidScroll />
      <FleeingButton onEasterEgg={startEgg} disabled={eggActive} />
      <Achievements />
      <LiveFeed />
      <button className="api-docs-link" onClick={onOpenPortal} aria-label="Open API documentation">
        API docs →
      </button>
    </>
  )
}

export default function App() {
  const [page, setPage] = useState<'main' | 'portal'>('main')

  return (
    <StatsProvider>
      {page === 'portal'
        ? <DevPortal onBack={() => setPage('main')} />
        : <Main onOpenPortal={() => setPage('portal')} />
      }
    </StatsProvider>
  )
}
