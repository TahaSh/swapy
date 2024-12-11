export type Vec2 = { x: number; y: number }

export function isVec2(v: any): v is Vec2 {
  return typeof v === 'object' && 'x' in v && 'y' in v
}

export function vec2(x: number, y: number): Vec2 {
  return { x, y }
}

export function vec2Add(v1: Vec2, v2: Vec2): Vec2 {
  return vec2(v1.x + v2.x, v1.y + v2.y)
}

export function vec2Sub(v1: Vec2, v2: Vec2): Vec2 {
  return vec2(v1.x - v2.x, v1.y - v2.y)
}

export function vec2Scale(v: Vec2, a: number): Vec2 {
  return vec2(v.x * a, v.y * a)
}
