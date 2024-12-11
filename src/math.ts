import { BorderRadius } from './borderRadius'
import { Vec2, vec2Add, vec2Scale, vec2Sub } from './vector'

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpVectors(v1: Vec2, v2: Vec2, t: number): Vec2 {
  return vec2Add(v1, vec2Scale(vec2Sub(v2, v1), t))
}

export function lerpBorderRadius(
  b1: BorderRadius,
  b2: BorderRadius,
  t: number
): BorderRadius {
  return {
    x: {
      topLeft: lerp(b1.x.topLeft, b2.x.topLeft, t),
      topRight: lerp(b1.x.topRight, b2.x.topRight, t),
      bottomRight: lerp(b1.x.bottomRight, b2.x.bottomRight, t),
      bottomLeft: lerp(b1.x.bottomLeft, b2.x.bottomLeft, t)
    },
    y: {
      topLeft: lerp(b1.y.topLeft, b2.y.topLeft, t),
      topRight: lerp(b1.y.topRight, b2.y.topRight, t),
      bottomRight: lerp(b1.y.bottomRight, b2.y.bottomRight, t),
      bottomLeft: lerp(b1.y.bottomLeft, b2.y.bottomLeft, t)
    },
    unit: b1.unit
  }
}

export function inverseLerp(min: number, max: number, value: number) {
  return clamp((value - min) / (max - min), 0, 1)
}

export function remap(
  a: number,
  b: number,
  c: number,
  d: number,
  value: number
) {
  return lerp(c, d, inverseLerp(a, b, value))
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
