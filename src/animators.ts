import { BorderRadius, isBorderRadius } from './borderRadius'
import { clamp, lerp, lerpBorderRadius, lerpVectors } from './math'
import { isVec2, Vec2 } from './vector'

export type AnimateConfig = {
  duration: number
  easing: (t: number) => number
}

export type CancelFunction = () => void

const DEFAULT_CONFIG: AnimateConfig = {
  duration: 350,
  easing: (t) => t
}

type AnimateProps<T = number | Vec2 | BorderRadius> = Record<string, T>

export function animate<P extends AnimateProps>(
  from: P,
  to: { [K in keyof P]: P[K] },
  cb: (value: P, done: boolean, progress: number) => void,
  config?: Partial<AnimateConfig>
): CancelFunction {
  let canceled = false
  const cancel = () => {
    canceled = true
  }
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  let start: number
  function update(ts: number) {
    if (start === undefined) {
      start = ts
    }
    const elapsed = ts - start
    const t = clamp(elapsed / mergedConfig.duration, 0, 1)
    const names = Object.keys(from) as Array<keyof P>
    const toKeys = Object.keys(to) as Array<keyof P>
    if (!names.every((name) => toKeys.includes(name))) {
      console.error('animate Error: `from` keys are different than `to`')
      return
    }

    const result = {} as P

    names.forEach((name) => {
      if (typeof from[name] === 'number' && typeof to[name] === 'number') {
        result[name] = lerp(
          from[name],
          to[name],
          mergedConfig.easing(t)
        ) as P[keyof P]
      } else if (isBorderRadius(from[name]) && isBorderRadius(to[name])) {
        result[name] = lerpBorderRadius(
          from[name],
          to[name],
          mergedConfig.easing(t)
        ) as P[keyof P]
      } else if (isVec2(from[name]) && isVec2(to[name])) {
        result[name] = lerpVectors(
          from[name],
          to[name],
          mergedConfig.easing(t)
        ) as P[keyof P]
      }
    })
    cb(result, t >= 1, t)
    if (t < 1 && !canceled) {
      requestAnimationFrame(update)
    }
  }
  requestAnimationFrame(update)
  return cancel
}
