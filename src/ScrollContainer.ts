export interface ScrollContainer {
  container: Element | Window
  width: number
  height: number

  startScrollTracking: () => void
  endScrollTracking: () => void
  getScrollOffset: () => { x: number; y: number }
  onScroll: (cb: () => void) => void
}

export function getScrollContainer(el: Element): ScrollContainer {
  let scrollParent = getScrollParent(el) || window
  if (scrollParent === document.body) {
    scrollParent = window
  }
  let scrollStartY = 0
  let scrollStartX = 0
  let startedTracking = false
  let scrollCallback: () => void = () => {}

  scrollParent.addEventListener('scroll', () => {
    if (startedTracking) {
      scrollCallback()
    }
  })

  return {
    container: scrollParent,
    onScroll(cb) {
      scrollCallback = cb
    },
    startScrollTracking() {
      if (startedTracking) {
        return
      }
      scrollStartY =
        scrollParent instanceof Element
          ? scrollParent.scrollTop
          : scrollParent.scrollY
      scrollStartX =
        scrollParent instanceof Element
          ? scrollParent.scrollLeft
          : scrollParent.scrollX
      startedTracking = true
    },
    getScrollOffset(): { x: number; y: number } {
      const scrollCurrentY =
        scrollParent instanceof Element
          ? scrollParent.scrollTop
          : scrollParent.scrollY
      const scrollCurrentX =
        scrollParent instanceof Element
          ? scrollParent.scrollLeft
          : scrollParent.scrollX
      return {
        x: scrollCurrentX - scrollStartX,
        y: scrollCurrentY - scrollStartY
      }
    },
    endScrollTracking() {
      scrollStartY = 0
      scrollStartX = 0
      startedTracking = false
    },
    width:
      scrollParent instanceof Element
        ? scrollParent.clientWidth
        : scrollParent.innerWidth,
    height:
      scrollParent instanceof Element
        ? scrollParent.clientHeight
        : scrollParent.innerHeight
  }
}

function getScrollParent(node: Element): Element | null {
  const isElement = node instanceof HTMLElement
  const overflowY = isElement && window.getComputedStyle(node).overflowY
  const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden'

  if (!node) {
    return null
  } else if (isScrollable && node.scrollHeight >= node.clientHeight) {
    return node
  }

  return getScrollParent(node.parentNode as Element) || document.body
}
