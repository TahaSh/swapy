export type BorderRadius = {
  x: {
    topLeft: number
    topRight: number
    bottomRight: number
    bottomLeft: number
  }
  y: {
    topLeft: number
    topRight: number
    bottomRight: number
    bottomLeft: number
  }
  unit: string
}

export function isBorderRadius(
  borderRadius: any
): borderRadius is BorderRadius {
  return (
    typeof borderRadius === 'object' &&
    borderRadius !== null &&
    'x' in borderRadius &&
    'y' in borderRadius &&
    'unit' in borderRadius &&
    typeof borderRadius.unit === 'string' &&
    typeof borderRadius.x === 'object' &&
    typeof borderRadius.y === 'object' &&
    'topLeft' in borderRadius.x &&
    'topRight' in borderRadius.x &&
    'bottomRight' in borderRadius.x &&
    'bottomLeft' in borderRadius.x &&
    'topLeft' in borderRadius.y &&
    'topRight' in borderRadius.y &&
    'bottomRight' in borderRadius.y &&
    'bottomLeft' in borderRadius.y
  )
}

export function parseBorderRadius(borderRadius: string): BorderRadius {
  // Regular expression to match numbers with units (e.g., 6px, 10%)
  const match = borderRadius.match(/(\d+(?:\.\d+)?)(px|%)/g)

  if (!match) {
    return {
      x: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      y: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      unit: 'px'
    }
  }

  // Parse each matched value with its unit
  const values = match.map((value) => {
    const [_, num, unit] = value.match(/(\d+(?:\.\d+)?)(px|%)/) ?? []
    return { value: parseFloat(num), unit }
  })

  // Ensure all units are consistent
  const unit = values[0]?.unit || 'px'
  if (values.some((v) => v.unit !== unit)) {
    throw new Error('Inconsistent units in border-radius string.')
  }

  // Handle 1 to 4 values
  const [v1, v2, v3, v4] = values.map((v) => v.value)
  const result = {
    topLeft: v1 ?? 0,
    topRight: v2 ?? v1 ?? 0,
    bottomRight: v3 ?? v1 ?? 0,
    bottomLeft: v4 ?? v2 ?? v1 ?? 0
  }
  return {
    x: { ...result },
    y: { ...result },
    unit
  }
}

export function calculateBorderRadiusInverse(
  { x, y, unit }: BorderRadius,
  scaleX: number,
  scaleY: number
): BorderRadius {
  if (unit === 'px') {
    const RadiusXInverse = {
      topLeft: x.topLeft / scaleX,
      topRight: x.topRight / scaleX,
      bottomLeft: x.bottomLeft / scaleX,
      bottomRight: x.bottomRight / scaleX
    }
    const RadiusYInverse = {
      topLeft: y.topLeft / scaleY,
      topRight: y.topRight / scaleY,
      bottomLeft: y.bottomLeft / scaleY,
      bottomRight: y.bottomRight / scaleY
    }
    return { x: RadiusXInverse, y: RadiusYInverse, unit: 'px' }
  } else if (unit === '%') {
    return { x, y, unit: '%' }
  }
  return { x, y, unit }
}

export function borderRadiusToString(borderRadius: BorderRadius): string {
  return `
    ${borderRadius.x.topLeft}${borderRadius.unit} ${borderRadius.x.topRight}${borderRadius.unit} ${borderRadius.x.bottomRight}${borderRadius.unit} ${borderRadius.x.bottomLeft}${borderRadius.unit}
    /
    ${borderRadius.y.topLeft}${borderRadius.unit} ${borderRadius.y.topRight}${borderRadius.unit} ${borderRadius.y.bottomRight}${borderRadius.unit} ${borderRadius.y.bottomLeft}${borderRadius.unit}
  `
}

export function isBorderRadiusNone(borderRadius: BorderRadius) {
  return (
    borderRadius.x.topLeft === 0 &&
    borderRadius.x.topRight === 0 &&
    borderRadius.x.bottomRight === 0 &&
    borderRadius.x.bottomLeft === 0 &&
    borderRadius.y.topLeft === 0 &&
    borderRadius.y.topRight === 0 &&
    borderRadius.y.bottomRight === 0 &&
    borderRadius.y.bottomLeft === 0
  )
}
