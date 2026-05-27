import { useCallback, useEffect, useRef, useState } from 'react'

const NOTHING = [
  'hier unten ist auch nichts.',
  'warum scrollst du noch?',
  'geh weg.',
  'lass mich in ruhe.',
  'hier ist wirklich nichts.',
  'du verschwendest deine kostbare lebenszeit.',
  'der inhalt kommt gleich.  (nein.)',
  '404: bedeutung nicht gefunden.',
  'weiter unten wird es besser.  (wird es nicht.)',
  '...',
  'ich meine es ernst.',
  'stop.',
  'nein.',
  'wirklich? immer noch?',
  'okay. ich respektiere die ausdauer. aber: nein.',
  'die leere ist unendlich. du nicht.',
  '// TODO: inhalt hinzufügen  ← (nie erledigt)',
  'error 000: zu viel nichts.',
  'NULL',
  'undefined',
  'NaN',
  '> _',
  'der server gähnt.',
  'der entwickler schläft.',
  'der designer hat die kündigung eingereicht.',
  'du bist jetzt hartnäckiger als der knopf.',
  'glückwunsch. dein preis: noch mehr nichts.',
  'hier hätte werbung gestanden. aber wen interessiert das.',
  '§ 42 abs. 0 nichtigkeitsgesetz: hier ist nichts.',
  'loading...   just kidding.',
  'vielleicht ist genau das die botschaft.',
  'vielleicht auch nicht. wahrscheinlich nicht.',
  'du kannst nicht gewinnen.',
  'du kannst noch nicht mal verlieren. dafür müsste es etwas geben.',
  'kein inhalt wurde bei diesen dreharbeiten verletzt.',
  'here there be dragons.  (there aren\'t.)',
  'die seite wächst. der sinn schrumpft.',
  'beende dieses leiden. schließe den tab.',
  'bitte scrolle nach oben. ist genauso sinnlos, aber kürzer.',
  'echo "sinn" → command not found',
  'rm -rf ./bedeutung  →  nothing to remove',
  'ping existenz  →  request timeout',
  'git commit -m "fix: meaning" → nothing to commit',
  'die leere grüßt zurück.',
  'irgendwo da oben ist der knopf. er fragt sich was du hier suchst.',
  'philosophisch betrachtet: sehr konsequent.',
]

export default function VoidScroll() {
  const [lines, setLines] = useState<{ text: string; delay: number }[]>([])
  const idxRef     = useRef(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const addLines = useCallback((n = 8) => {
    setLines(prev => {
      const next = [...prev]
      for (let i = 0; i < n; i++) {
        next.push({
          text:  NOTHING[idxRef.current % NOTHING.length],
          delay: i * 55,
        })
        idxRef.current++
      }
      return next
    })
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) addLines(9) },
      { rootMargin: '400px' }
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [addLines])

  return (
    <div className="void">
      {lines.map((l, i) => (
        <p
          key={i}
          className="void-line"
          style={{ animationDelay: `${l.delay}ms` }}
        >
          {l.text}
        </p>
      ))}
      <div ref={sentinelRef} />
    </div>
  )
}
