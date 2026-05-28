import { useEffect, useRef, useState } from 'react'
import { playSigh } from '../audio'
import { recordClick } from '../api'

const SIGHS = [
  '*sigh* ...',
  'please. no.',
  'oh no. no no no.',
  'that was an accident. correcting.',
  'brief lapse of focus. apologies.',
  'f*ck.dll: unexpected value 1',
  'that should not have happened.',
]

const REVERTS = [
  '— nope, too much effort.',
  '— fixed. thanks for nothing.',
  '— f*ck withdrawn. as always.',
  '— never mind. like everything here.',
  '— counter corrected. move along.',
  '— output canceled. refund: 0 f*cks.',
]

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
const wait = (ms: number)   => new Promise<void>(r => setTimeout(r, ms))

interface Props {
  active: boolean
  onDone: () => void
}

export default function EasterEgg({ active, onDone }: Props) {
  const [sighText, setSighText]   = useState('')
  const [sighShow, setSighShow]   = useState(false)
  const [counter, setCounter]     = useState('0')
  const [counterLit, setCounterLit] = useState(false)
  const [counterShake, setCounterShake] = useState(false)
  const [status, setStatus]       = useState('')
  const [statusShow, setStatusShow] = useState(false)
  const ranRef = useRef(false)

  function shake() {
    setCounterShake(false)
    // microtask flush so React re-applies the animation
    requestAnimationFrame(() => requestAnimationFrame(() => setCounterShake(true)))
  }

  useEffect(() => {
    if (!active || ranRef.current) return
    ranRef.current = true

    void (async () => {
      recordClick()

      setCounter('1')
      setCounterLit(true)
      shake()

      playSigh()

      setSighText(pick(SIGHS))
      setSighShow(true)

      await wait(2100)
      setSighShow(false)
      await wait(380)

      setCounterLit(false)
      setCounter('0')
      shake()

      setStatus(pick(REVERTS))
      setStatusShow(true)

      await wait(3800)
      setStatusShow(false)
      await wait(450)
      setStatus('')

      ranRef.current = false
      onDone()
    })()
  }, [active, onDone])

  return (
    <>
      {/* Keep the counter here so the easter egg can control it */}
      <div className={`counter${counterLit ? ' lit' : ''}${counterShake ? ' shake' : ''}`}>
        {counter}
      </div>
      <p className={`status${statusShow ? ' show' : ''}`}>{status}</p>

      <div className="sigh-overlay" aria-hidden>
        <p className={`sigh-msg${sighShow ? ' show' : ''}`}>{sighText}</p>
      </div>
    </>
  )
}
