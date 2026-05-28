import { useCallback, useEffect, useRef, useState } from 'react'

const NOTHING = [
  'there\'s nothing down here either.',
  'why are you still scrolling?',
  'go away.',
  'leave me alone.',
  'there is truly nothing here.',
  'you\'re wasting your precious time on earth.',
  'content is loading.  (no it isn\'t.)',
  '404: meaning not found.',
  'it gets better further down.  (it doesn\'t.)',
  '...',
  'i mean it.',
  'stop.',
  'no.',
  'seriously? still going?',
  'okay. i respect the dedication. but: no.',
  'the void is infinite. you are not.',
  '// TODO: add content  ← (never done)',
  'error 000: too much nothing.',
  'NULL',
  'undefined',
  'NaN',
  '> _',
  'the server is yawning.',
  'the developer is asleep.',
  'the designer has quit.',
  'you are now more persistent than the button.',
  'congratulations. your reward: more nothing.',
  'there would have been an ad here. but who cares.',
  '§ 42 section 0 law of nothingness: there is nothing here.',
  'loading...   just kidding.',
  'maybe that\'s the whole point.',
  'maybe not. probably not.',
  'you can\'t win.',
  'you can\'t even lose. there\'d have to be something for that.',
  'no content was harmed in the making of this page.',
  'here there be dragons.  (there aren\'t.)',
  'the page grows. the meaning shrinks.',
  'end this suffering. close the tab.',
  'please scroll back up. equally pointless, but shorter.',
  'echo "meaning" → command not found',
  'rm -rf ./purpose  →  nothing to remove',
  'ping existence  →  request timeout',
  'git commit -m "fix: meaning" → nothing to commit',
  'the void waves back.',
  'somewhere up there is the button. it wonders what you\'re looking for down here.',
  'philosophically speaking: very consistent.',
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
