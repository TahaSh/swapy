import { Vec2 } from './vector'

export type Position = { x: number; y: number }
export type Size = { width: number; height: number }

export type Rect = Position & Size

export function createRectFromBoundingRect(rect: DOMRect): Rect {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  }
}

/**
 * For returning the boundingRect without any
 * transform translates set on any of its parents.
 * For example, if any of its parents has translate(0, 100px),
 * the return y value will be y - 100.
 */
export function getCorrectedBoundingRect(element: HTMLElement): Rect {
  const boundingRect = element.getBoundingClientRect()

  let offsetX = 0
  let offsetY = 0

  let currentElement: HTMLElement | null = element.parentElement

  while (currentElement) {
    const style = getComputedStyle(currentElement)
    const transform = style.transform

    if (transform && transform !== 'none') {
      const matrixMatch = transform.match(/matrix.*\((.+)\)/)
      if (matrixMatch) {
        const values = matrixMatch[1].split(', ').map(Number)
        offsetX += values[4] || 0
        offsetY += values[5] || 0
      }
    }

    currentElement = currentElement.parentElement
  }

  return {
    y: boundingRect.top - offsetY,
    x: boundingRect.left - offsetX,
    width: boundingRect.width,
    height: boundingRect.height
  }
}

export function getLayoutRect(el: HTMLElement): Rect {
  let current = el
  let top = 0
  let left = 0

  while (current) {
    top += current.offsetTop
    left += current.offsetLeft
    current = current.offsetParent as HTMLElement
  }

  return {
    x: left,
    y: top,
    width: el.offsetWidth,
    height: el.offsetHeight
  }
}

export function pointIntersectsWithRect(point: Position, rect: Rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

export function getScrollOffset(el: HTMLElement): Vec2 {
  let current: HTMLElement | null = el
  let y = 0
  let x = 0

  while (current) {
    // Check if the current element is scrollable
    const isScrollable = (node: HTMLElement) => {
      const style = getComputedStyle(node)
      return /(auto|scroll)/.test(
        style.overflow + style.overflowY + style.overflowX
      )
    }

    // If scrollable, add its scroll offsets
    if (current === document.body) {
      // Use window scroll for the <body> element
      x += window.scrollX
      y += window.scrollY
      break
    }

    if (isScrollable(current)) {
      x += current.scrollLeft
      y += current.scrollTop
    }

    current = current.parentElement
  }

  return { x, y }
}
