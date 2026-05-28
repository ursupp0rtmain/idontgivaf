import { useEffect, useRef, useState } from 'react'
import { playSigh } from '../audio'
import { recordClick } from '../api'

const SIGHS = [
  '*sigh* ...',
  'please. no.',
  'oh no. oh no no no.',
  'that was a mistake. correcting.',
  'brief lapse in judgment. sorry.',
  'f*ck.dll: unexpected value 1',
  'that should not have happened.',
]

const REVERTS = [
  '-- ugh, too much effort.',
  '-- bug fixed. thanks for nothing.',
  '-- f*ck withdrawn. as usual.',
  '-- never mind. like everything here.',
  '-- counter corrected. please leave now.',
  '-- output canceled. refund: 0 f*cks.',
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
      {/* The counter lives here so EasterEgg can control it. */}
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
