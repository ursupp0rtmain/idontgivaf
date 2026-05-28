import { useCallback, useEffect, useRef, useState } from 'react'

const NOTHING = [
  'there is nothing down here either.',
  'why are you still scrolling?',
  'go away.',
  'leave me alone.',
  'there is really nothing here.',
  'you are wasting your precious lifetime.',
  'content is loading.  (it is not.)',
  '404: meaning not found.',
  'it gets better further down.  (it does not.)',
  '...',
  'i mean it.',
  'stop.',
  'no.',
  'really? still?',
  'okay. i respect the persistence. but: no.',
  'the void is infinite. you are not.',
  '// TODO: add content  <- (never done)',
  'error 000: too much nothing.',
  'NULL',
  'undefined',
  'NaN',
  '> _',
  'the server is yawning.',
  'the developer is asleep.',
  'the designer already resigned.',
  'you are now more stubborn than the button.',
  'congrats. your prize: more nothing.',
  'this could have been an ad. who cares.',
  'Section 42(0) of the Nullity Act: there is nothing here.',
  'loading...   just kidding.',
  'maybe that is the message.',
  'maybe not. probably not.',
  'you cannot win.',
  'you cannot even lose. there would need to be something.',
  'no content was harmed in this production.',
  'here there be dragons.  (there aren\'t.)',
  'the page grows. the meaning shrinks.',
  'end this suffering. close the tab.',
  'please scroll up. same pointlessness, shorter distance.',
  'echo "meaning" -> command not found',
  'rm -rf ./meaning  ->  nothing to remove',
  'ping existence  ->  request timeout',
  'git commit -m "fix: meaning" → nothing to commit',
  'the void says hi back.',
  'the button is up there somewhere. it wonders what you are looking for.',
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
