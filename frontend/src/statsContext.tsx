import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
  type ReactNode,
} from 'react'
import * as signalR from '@microsoft/signalr'
import { fetchStats, type Stats } from './api'

export interface FeedMessage {
  id:   number
  msg:  string
  tag:  'attempt' | 'api'
  time: string
}

interface StatsCtx extends Stats {
  sessionAttempts:  number
  onSessionAttempt: () => void
  feedMessages:     FeedMessage[]
}

const Ctx = createContext<StatsCtx>({
  attempts: 0, clicks: 0, visitors: 0, apiCalls: 0,
  sessionAttempts: 0,
  onSessionAttempt: () => {},
  feedMessages: [],
})

export const useStats = () => useContext(Ctx)

let feedSeq = 0
const MAX_FEED = 60

function nowHMS() {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':')
}

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats>({ attempts: 0, clicks: 0, visitors: 0, apiCalls: 0 })
  const [sessionAttempts, setSessionAttempts] = useState(0)
  const [feedMessages, setFeedMessages]       = useState<FeedMessage[]>([])
  const hubRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {})

    const hub = new signalR.HubConnectionBuilder()
      .withUrl('/hub/nothing')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    hub.on('StatsUpdated', (data: Stats) => setStats(data))

    hub.on('RejectionFeed', (data: { msg: string; tag: 'attempt' | 'api' }) => {
      const entry: FeedMessage = { id: ++feedSeq, msg: data.msg, tag: data.tag, time: nowHMS() }
      setFeedMessages(prev => [entry, ...prev].slice(0, MAX_FEED))
    })

    hub.start().catch(() => {
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
    <Ctx.Provider value={{ ...stats, sessionAttempts, onSessionAttempt, feedMessages }}>
      {children}
    </Ctx.Provider>
  )
}
