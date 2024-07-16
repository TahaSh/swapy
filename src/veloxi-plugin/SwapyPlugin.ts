import { DragEvent, DragEventPlugin, PluginFactory, View } from 'veloxi'
import { AnimationType, Config } from '../instance'

type SwapEventArray = Array<{ slot: string; item: string | null }>
type SwapEventMap = Map<string, string | null>
type SwapEventObject = Record<string, string | null>

interface SwapEventDataData {
  map: SwapEventMap
  array: SwapEventArray
  object: SwapEventObject
}
export interface SwapEventData {
  data: SwapEventDataData
}

export interface SwapyConfig {
  animation: 'dynamic' | 'spring' | 'none'
}

export interface SwapyPluginApi {
  setEnabled(isEnabled: boolean): void
}

export class SwapEvent {
  data: SwapEventDataData
  constructor(props: SwapEventData) {
    this.data = props.data
  }
}

export class InitEvent {
  data: SwapEventDataData
  constructor(props: SwapEventData) {
    this.data = props.data
  }
}

function createEventData(eventMap: SwapEventMap): SwapEventDataData {
  const map = new Map(eventMap)
  return {
    map,
    array: Array.from(eventMap).map(([slot, item]) => ({ slot, item })),
    object: Array.from(eventMap).reduce<SwapEventObject>(
      (result, [slot, item]) => {
        result[slot] = item
        return result
      },
      {}
    )
  }
}

export const SwapyPlugin: PluginFactory<SwapyConfig, SwapyPluginApi> = (
  context
) => {
  const dragEventPlugin = context.useEventPlugin(DragEventPlugin)
  dragEventPlugin.on(DragEvent, onDrag)

  let root: View
  let slots: View[]
  let items: View[]
  let draggingItem: View
  let slotItemMap: SwapEventMap = new Map()
  let offsetX: number | null
  let offsetY: number | null
  let initialWidth: number | null
  let initialHeight: number | null
  let startedDragging = false
  let enabled = true
  let draggingEvent: DragEvent | null

  context.api({
    setEnabled(isEnabled) {
      enabled = isEnabled
    }
  })

  function getConfig(): Config {
    return {
      animation: root.data.configAnimation as AnimationType
    }
  }

  function getAnimation(): {
    animator: 'dynamic' | 'spring' | 'instant'
    config: any
  } {
    const animationConfig = getConfig().animation
    if (animationConfig === 'dynamic') {
      return {
        animator: 'dynamic',
        config: {}
      }
    } else if (animationConfig === 'spring') {
      return {
        animator: 'spring',
        config: {
          damping: 0.7,
          stiffness: 0.62
        }
      }
    } else if (animationConfig === 'none') {
      return {
        animator: 'instant',
        config: {}
      }
    }
    return {
      animator: 'instant',
      config: {}
    }
  }

  context.setup(() => {
    root = context.getView('root')!
    slots = context.getViews('slot')
    items = context.getViews('item')

    const animation = getAnimation()
    items.forEach((item) => {
      item.styles.position = 'relative'
      item.styles.touchAction = 'none'
      item.position.setAnimator(animation.animator, animation.config)
      item.scale.setAnimator(animation.animator, animation.config)
      item.layoutTransition(true)
      dragEventPlugin.addView(item)

      const slot = item.getParent('slot')!.element
      slotItemMap.set(slot.dataset.swapySlot!, item.element.dataset.swapyItem!)

      const handle = item.getChild('handle')
      if (handle) {
        handle.position.setAnimator('instant')
        handle.scale.setAnimator('instant')
      }
    })

    context.emit(InitEvent, { data: createEventData(slotItemMap) })
  })

  function updateDraggingPosition() {
    if (!draggingEvent) return
    if (!offsetX || !offsetY) {
      const draggingItemScrollOffset = draggingItem.getScroll()
      offsetX =
        draggingEvent.pointerX -
        draggingItem.position.x +
        draggingItemScrollOffset.x
      offsetY =
        draggingEvent.pointerY -
        draggingItem.position.y +
        draggingItemScrollOffset.y
    }
    if (!initialWidth || !initialHeight) {
      initialWidth = draggingItem.size.width
      initialHeight = draggingItem.size.height
    }
    const scaleX = draggingItem.size.width / initialWidth
    const scaleY = draggingItem.size.height / initialHeight
    const newOffsetX = offsetX * (scaleX - 1)
    const newOffsetY = offsetY * (scaleY - 1)
    draggingItem.position.set(
      {
        x: draggingEvent.x - newOffsetX,
        y: draggingEvent.y - newOffsetY
      },
      draggingItem.scale.x !== 1 || draggingItem.scale.y !== 1
    )
  }

  function onDrag(event: DragEvent) {
    if (!enabled) return
    draggingItem = event.view
    const handle = draggingItem.getChild('handle')
    if (handle) {
      const animation = getAnimation()
      handle.position.setAnimator(animation.animator, animation.config)
      handle.scale.setAnimator(animation.animator, animation.config)
    }
    if (
      !startedDragging &&
      handle &&
      !handle.intersects(event.pointerX, event.pointerY)
    ) {
      return
    }
    startedDragging = true
    if (event.isDragging) {
      draggingEvent = event
      updateDraggingPosition()

      slots.forEach((slot) => {
        const draggingSlot = draggingItem.getParent('slot')!
        if (!slot.intersects(event.pointerX, event.pointerY)) {
          if (slot !== draggingSlot) {
            slot.element.removeAttribute('data-swapy-highlighted')
          }
          return
        }
        const targetSlotName = slot.element.dataset.swapySlot
        const targetItemName = slot.getChild('item')?.element.dataset.swapyItem
        const draggingSlotName = draggingSlot.element.dataset.swapySlot
        const draggingItemName = draggingItem.element.dataset.swapyItem
        if (!targetSlotName || !draggingSlotName || !draggingItemName) {
          return
        }
        slot.element.dataset.swapyHighlighted = ''
        slotItemMap.set(targetSlotName, draggingItemName)
        if (targetItemName) {
          slotItemMap.set(draggingSlotName, targetItemName)
        } else {
          slotItemMap.set(draggingSlotName, null)
        }
        context.emit(SwapEvent, { data: createEventData(slotItemMap) })
      })

      items.forEach((item) => {
        item.styles.zIndex = item === draggingItem ? '2' : ''
      })
    } else {
      slots.forEach((slot) => {
        slot.element.removeAttribute('data-swapy-highlighted')
      })
      draggingItem.position.reset()
      offsetX = null
      offsetY = null
      initialWidth = null
      initialHeight = null
      startedDragging = false
      draggingEvent = null
    }
    requestAnimationFrame(() => {
      updateDraggingPosition()
    })
  }
}

SwapyPlugin.pluginName = 'Swapy'
SwapyPlugin.scope = 'root'
