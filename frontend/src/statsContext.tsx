import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
  type ReactNode,
} from 'react'
import * as signalR from '@microsoft/signalr'
import { fetchStats, type Stats } from './api'

interface StatsCtx extends Stats {
  sessionAttempts: number
  onSessionAttempt: () => void
}

const Ctx = createContext<StatsCtx>({
  attempts: 0, clicks: 0, visitors: 0,
  sessionAttempts: 0,
  onSessionAttempt: () => {},
})

export const useStats = () => useContext(Ctx)

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats>({ attempts: 0, clicks: 0, visitors: 0 })
  const [sessionAttempts, setSessionAttempts] = useState(0)
  const hubRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    // Sofortiger Fallback via REST falls SignalR nicht klappt
    fetchStats().then(setStats).catch(() => {})

    const hub = new signalR.HubConnectionBuilder()
      .withUrl('/hub/nothing')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    hub.on('StatsUpdated', (data: Stats) => setStats(data))

    hub.start().catch(() => {
      // SignalR nicht verfügbar — REST-Polling als Fallback
      const id = setInterval(() => fetchStats().then(setStats).catch(() => {}), 15_000)
      return () => clearInterval(id)
    })

    hubRef.current = hub
    return () => { hub.stop() }
  }, [])

  const onSessionAttempt = useCallback(() => {
    setSessionAttempts(s => s + 1)
  }, [])

  return (
    <Ctx.Provider value={{ ...stats, sessionAttempts, onSessionAttempt }}>
      {children}
    </Ctx.Provider>
  )
}
