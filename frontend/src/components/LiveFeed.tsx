import { useStats } from '../statsContext'

export default function LiveFeed() {
  const { feedMessages } = useStats()

  return (
    <aside className="live-feed" aria-label="Global rejection feed">
      <p className="feed-header">// live rejection feed</p>
      <ul className="feed-list">
        {feedMessages.length === 0
          ? <li className="feed-empty">waiting for global failure...</li>
          : feedMessages.map(m => (
              <li key={m.id} className={`feed-item feed-item--${m.tag}`}>
                <span className="feed-time">{m.time}</span>
                <span className="feed-msg">{m.msg}</span>
              </li>
            ))
        }
      </ul>
    </aside>
  )
}
