import { useEffect, useRef, useState } from 'react'
import { createActionBag, POSES } from './mascotActions'

const REST = { pose: 'sit', motion: '', label: '기다리는 중' }
const ENTERING = { pose: 'look', motion: '', label: '집에서 나오는 중' }
const EXITING = { pose: 'tilt', motion: '', label: '집으로 돌아가는 중' }

export default function OfficeMascot({ paused, enabled, previewRequest, appearance = 'visible' }) {
  const [frame, setFrame] = useState(REST)
  const [arrivalFrame, setArrivalFrame] = useState(null)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const bagRef = useRef([])
  const previousRef = useRef('')
  const previousPreviewRef = useRef(previewRequest)
  const previousAppearanceRef = useRef(appearance)

  useEffect(() => {
    const previous = previousAppearanceRef.current
    previousAppearanceRef.current = appearance
    const timers = []

    if (previous === 'entering' && appearance === 'visible') {
      timers.push(window.setTimeout(() => {
        setArrivalFrame({ pose: 'look', motion: 'arrival', label: '기지개 켜는 중' })
      }, 0))
      timers.push(window.setTimeout(() => {
        setArrivalFrame({ pose: 'sit', motion: 'settling', label: '자리를 잡는 중' })
      }, 620))
      timers.push(window.setTimeout(() => setArrivalFrame(null), 1120))
    } else if (appearance !== 'visible') {
      timers.push(window.setTimeout(() => setArrivalFrame(null), 0))
    }

    return () => timers.forEach(window.clearTimeout)
  }, [appearance])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => setReducedMotion(media.matches)
    const onVisibilityChange = () => setPageVisible(!document.hidden)
    media.addEventListener('change', onMotionChange)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      media.removeEventListener('change', onMotionChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const preview = previewRequest !== previousPreviewRef.current
    previousPreviewRef.current = previewRequest
    let timer
    let cancelled = false
    const schedule = (callback, delay) => {
      timer = window.setTimeout(() => { if (!cancelled) callback() }, delay)
    }
    const idle = () => {
      setFrame(REST)
      if (enabled) schedule(playAction, 1500 + Math.random() * 1500)
    }
    const playAction = () => {
      if (!bagRef.current.length) bagRef.current = createActionBag(previousRef.current)
      const action = bagRef.current.shift()
      previousRef.current = action.id
      let index = 0
      const nextFrame = () => {
        const next = action.frames[index++]
        if (!next) return idle()
        setFrame({ ...next, label: action.label })
        schedule(nextFrame, next.duration)
      }
      nextFrame()
    }

    // Reset immediately on the next tick; cleanup also handles React StrictMode.
    schedule(() => {
      setFrame(REST)
      if (paused || !pageVisible || reducedMotion) return
      if (preview) playAction()
      else if (enabled) schedule(playAction, 700 + Math.random() * 800)
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [paused, enabled, previewRequest, pageVisible, reducedMotion])

  const transitioning = appearance === 'entering' || appearance === 'exiting'
  const transitionFrame = appearance === 'entering' ? ENTERING : EXITING
  const shown = transitioning
    ? transitionFrame
    : arrivalFrame || (paused || !pageVisible || reducedMotion ? REST : frame)
  const pose = POSES[shown.pose]
  const label = appearance === 'entering' ? '집에서 나오는 중' : appearance === 'exiting' ? '집으로 돌아가는 중' : shown.label
  return <span className={`office-mascot-stage is-${appearance}`} data-action={shown.pose} title={label}>
    <span className={`office-mascot-pose ${shown.motion ? `office-motion-${shown.motion}` : ''}`} style={{
      '--pose-width': `${pose.width}px`, '--pose-height': `${pose.height}px`,
      '--pose-x': `${-pose.x}px`, '--pose-y': `${-pose.y}px`,
      clipPath: pose.clip,
    }} aria-hidden="true" />
    {transitioning && <span className="office-doghouse" aria-hidden="true">
      <span className="doghouse-bone doghouse-bone-one" />
      <span className="doghouse-bone doghouse-bone-two" />
    </span>}
    {shown.motion === 'sleeping' && <span className="office-sleep-marks" aria-hidden="true">z<span>z</span><span>Z</span></span>}
  </span>
}
