import { View, ViewPlugin } from './view'

interface Draggable {
  onDrag(handler: OnDragListener): void
  onDrop(handler: OnDropListener): void
  onHold(handler: OnHoldListener): void
  onRelease(handler: OnReleaseListener): void
  destroy(): void
  readjust(): void
}

export type DraggablePlugin = Draggable & ViewPlugin

export type DragEvent = {
  x: number
  y: number
  width: number
  height: number
  pointerX: number
  pointerY: number
  relativeX: number
  relativeY: number
  el: HTMLElement
}

export type OnDragListener = (dragEvent: DragEvent) => void
export type OnDropListener = (dragEvent: DragEvent) => void
export type OnHoldListener = ({ el }: { el: HTMLElement }) => void
export type OnReleaseListener = ({ el }: { el: HTMLElement }) => void

export type DraggableConfig = {
  startDelay: number
  targetEl?: HTMLElement | null
}

const DEFAULT_CONFIG: DraggableConfig = {
  startDelay: 0,
  targetEl: null
}

export function makeDraggable(
  view: View,
  userConfig?: Partial<DraggableConfig>
): DraggablePlugin {
  const config: DraggableConfig = { ...DEFAULT_CONFIG, ...userConfig }

  let el = view.el()
  let isPointerDown = false
  let dragListener: OnDragListener | null = null
  let dropListener: OnDropListener | null = null
  let holdListener: OnHoldListener | null = null
  let releaseListener: OnReleaseListener | null = null
  let initialX = 0
  let initialY = 0
  let lastX = 0
  let lastY = 0
  let layoutLeft = 0
  let layoutTop = 0
  let initialClientX = 0
  let initialClientY = 0
  let relativeX = 0
  let relativeY = 0
  let draggingEl: HTMLElement | null = null
  let timer: NodeJS.Timeout | null

  el.addEventListener('pointerdown', onPointerDown)
  document.body.addEventListener('pointerup', onPointerUp)
  document.body.addEventListener('pointermove', onPointerMove)
  document.body.addEventListener('touchmove', onTouchMove, { passive: false })

  function onPointerDown(e: PointerEvent) {
    if (config.targetEl && e.target !== config.targetEl) return
    if (isPointerDown) return
    if (!e.isPrimary) return
    if (config.startDelay > 0) {
      holdListener?.({ el: e.target as HTMLElement })
      timer = setTimeout(() => {
        start()
      }, config.startDelay)
    } else {
      start()
    }

    function start() {
      draggingEl = e.target as HTMLElement
      const rect = view.boundingRect()
      const layout = view.layoutRect()
      layoutLeft = layout.x
      layoutTop = layout.y
      lastX = rect.x - layoutLeft
      lastY = rect.y - layoutTop
      initialX = e.clientX - lastX
      initialY = e.clientY - lastY
      initialClientX = e.clientX
      initialClientY = e.clientY
      relativeX = (e.clientX - rect.x) / rect.width
      relativeY = (e.clientY - rect.y) / rect.height
      isPointerDown = true
      onPointerMove(e)
    }
  }

  function readjust() {
    const layout = view.layoutRect()
    initialX -= layoutLeft - layout.x
    initialY -= layoutTop - layout.y
    layoutLeft = layout.x
    layoutTop = layout.y
  }

  function onPointerUp(e: PointerEvent) {
    if (!isPointerDown) {
      if (timer) {
        clearTimeout(timer)
        timer = null
        releaseListener?.({ el: e.target as HTMLElement })
      }
      return
    }
    if (!e.isPrimary) return
    isPointerDown = false
    const width = e.clientX - initialClientX
    const height = e.clientY - initialClientY
    dropListener?.({
      x: lastX,
      y: lastY,
      pointerX: e.clientX,
      pointerY: e.clientY,
      width,
      height,
      relativeX,
      relativeY,
      el: draggingEl!
    })
    draggingEl = null
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPointerDown) {
      if (timer) {
        clearTimeout(timer)
        timer = null
        releaseListener?.({ el: e.target as HTMLElement })
      }
      return
    }
    if (!e.isPrimary) return

    const width = e.clientX - initialClientX
    const height = e.clientY - initialClientY
    const dx = (lastX = e.clientX - initialX)
    const dy = (lastY = e.clientY - initialY)
    dragListener?.({
      width,
      height,
      x: dx,
      y: dy,
      pointerX: e.clientX,
      pointerY: e.clientY,
      relativeX,
      relativeY,
      el: draggingEl!
    })
  }

  function onTouchMove(e: TouchEvent) {
    if (!isPointerDown) return true
    e.preventDefault()
  }

  function onDrag(listener: OnDragListener) {
    dragListener = listener
  }

  function onDrop(listener: OnDropListener) {
    dropListener = listener
  }

  function onHold(listener: OnHoldListener) {
    holdListener = listener
  }

  function onRelease(listener: OnReleaseListener) {
    releaseListener = listener
  }

  function onElementUpdate() {
    el.removeEventListener('pointerdown', onPointerDown)
    el = view.el()
    el.addEventListener('pointerdown', onPointerDown)
  }

  function destroy() {
    view.el().removeEventListener('pointerdown', onPointerDown)
    document.body.removeEventListener('pointerup', onPointerUp)
    document.body.removeEventListener('pointermove', onPointerMove)
    document.body.removeEventListener('touchmove', onTouchMove)
    dragListener = null
    dropListener = null
    holdListener = null
    releaseListener = null
  }

  return {
    onDrag,
    onDrop,
    onHold,
    onRelease,
    onElementUpdate,
    destroy,
    readjust
  }
}
