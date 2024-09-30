import {
  DragEvent,
  DragEventPlugin,
  EventBus,
  Events,
  PluginFactory,
  View
} from 'veloxi'
import { AnimationType, Config, SwapMode } from '../instance'
import { mapsAreEqual } from '../utils'
import { getScrollContainer, ScrollContainer } from '../ScrollContainer'

export type SwapEventArray = Array<{ slotId: string; itemId: string | null }>
export type SwapEventMap = Map<string, string | null>
export type SwapEventObject = Record<string, string | null>

interface SwapEventDataData {
  map: SwapEventMap
  array: SwapEventArray
  object: SwapEventObject
}

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Keys extends keyof T
  ? { [K in Keys]: T[K] } & Partial<Record<Exclude<keyof T, Keys>, never>>
  : never

export type SwapData = RequireOnlyOne<
  SwapEventDataData,
  'map' | 'array' | 'object'
>
export interface SwapEventData {
  data: SwapEventDataData
}

export type SwapEndEventData = SwapEventData & { hasChanged: boolean }

export interface SwapyConfig {
  animation: 'dynamic' | 'spring' | 'none'
}

export interface SwapyPluginApi {
  setEnabled(isEnabled: boolean): void
  setData(data: SwapData): void
  setAutoScrollOnDrag(autoScrollOnDrag: boolean): void
}

export class SwapEvent {
  data: SwapEventDataData
  constructor(props: SwapEventData) {
    this.data = props.data
  }
}

export class SwapEndEvent {
  data: SwapEventDataData
  hasChanged: boolean
  constructor(props: SwapEndEventData) {
    this.data = props.data
    this.hasChanged = props.hasChanged
  }
}

export class SwapStartEvent {}

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
    array: Array.from(eventMap).map(([slotId, itemId]) => ({ slotId, itemId })),
    object: Array.from(eventMap).reduce<SwapEventObject>(
      (result, [slot, item]) => {
        result[slot] = item
        return result
      },
      {}
    )
  }
}

function createEventDataFromAny(data: SwapData): SwapEventDataData {
  if (data.map) {
    const map = new Map(data.map)
    return {
      map,
      array: Array.from(data.map).map(([slotId, itemId]) => ({
        slotId,
        itemId
      })),
      object: Array.from(data.map).reduce<SwapEventObject>(
        (result, [slot, item]) => {
          result[slot] = item
          return result
        },
        {}
      )
    }
  } else if (data.object) {
    const object = { ...data.object }
    return {
      map: new Map(Object.entries(object)),
      array: Object.entries(object).map(([slotId, itemId]) => ({
        slotId,
        itemId
      })),
      object
    }
  } else {
    const array = [...data.array]
    return {
      map: new Map(array.map(({ slotId, itemId }) => [slotId, itemId])),
      array,
      object: array.reduce<SwapEventObject>((result, { slotId, itemId }) => {
        result[slotId] = itemId
        return result
      }, {})
    }
  }
}

export const SwapyPlugin: PluginFactory<SwapyConfig, SwapyPluginApi> = (
  context
) => {
  const dragEventPlugin = context.useEventPlugin(DragEventPlugin)
  dragEventPlugin.on(DragEvent, onDrag)

  const MAX_SCROLL_SPEED = 20
  const MAX_SCROLL_THRESHOLD = 100

  let root: View
  let scrollContainer: ScrollContainer
  let slots: View[]
  let items: View[]
  let draggingItem: View
  let slotItemMapOnDragStart: SwapEventMap | null = null
  let slotItemMap: SwapEventMap = new Map()
  let previousSlotItemMap: SwapEventMap = new Map()
  let offsetX: number | null
  let offsetY: number | null
  let handleOffsetX: number | null = null
  let handleOffsetY: number | null = null
  let initialWidth: number | null
  let initialHeight: number | null
  let enabled = true
  let draggingEvent: DragEvent | null
  let isContinuousMode: boolean
  let isManualSwap: boolean
  let draggingSlot: View | null
  let startedDragging: boolean = false
  let hasSwapped: boolean = false
  let triggerSwap = () => {}
  let shouldAutoScrollOnDrag = false
  let scrollDY = 0
  let scrollDX = 0

  context.api({
    setEnabled(isEnabled) {
      enabled = isEnabled
    },
    setData(data: SwapData) {
      const eventData = createEventDataFromAny(data)
      slotItemMap = new Map(eventData.map)
      previousSlotItemMap = new Map(slotItemMap)
    },
    setAutoScrollOnDrag(autoScrollOnDrag) {
      shouldAutoScrollOnDrag = autoScrollOnDrag
    }
  })

  function getConfig(): Config {
    return {
      animation: root.data.configAnimation as AnimationType,
      continuousMode: typeof root.data.configContinuousMode !== 'undefined',
      manualSwap: typeof root.data.configManualSwap !== 'undefined',
      swapMode: root.data.configSwapMode as SwapMode,
      autoScrollOnDrag: shouldAutoScrollOnDrag
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

  function prepareSwap(newSlotItemMap: SwapEventMap) {
    return () => {
      slotItemMap = newSlotItemMap
      previousSlotItemMap = new Map(slotItemMap)
    }
  }

  context.setup(() => {
    root = context.getView('root')!
    slots = context.getViews('slot')
    items = context.getViews('item')
    scrollContainer = getScrollContainer(items[0].element)
    scrollContainer.onScroll(() => {
      updateDraggingPosition()
    })
    isContinuousMode = getConfig().continuousMode
    isManualSwap = getConfig().manualSwap

    slots.forEach((slot) => {
      setupSlot(slot)
    })

    setupRemainingChildren()

    previousSlotItemMap = new Map(slotItemMap)
    requestAnimationFrame(() => {
      context.emit(InitEvent, { data: createEventData(slotItemMap) })
    })
  })

  function setupSlot(slot: View) {
    const item = slot.getChild('item')
    if (item) {
      setupItem(item)
    }
    slotItemMap.set(
      slot.element.dataset.swapySlot!,
      item ? item.element.dataset.swapyItem! : null
    )
  }

  function setupItem(item: View) {
    const animation = getAnimation()
    item.styles.position = 'relative'
    item.styles.userSelect = 'none'
    item.styles.webkitUserSelect = 'none'
    item.position.setAnimator(animation.animator, animation.config)
    item.scale.setAnimator(animation.animator, animation.config)
    item.layoutTransition(true)

    requestAnimationFrame(() => {
      const handle = item.getChild('handle')
      if (handle) {
        dragEventPlugin.addView(handle)
        handle.styles.touchAction = 'none'
      } else {
        dragEventPlugin.addView(item)
        item.styles.touchAction = 'none'
      }
    })
  }

  context.onViewAdded((view) => {
    if (context.initialized) {
      if (view.name === 'item') {
        items = context.getViews('item')
        const slot = view.getParent('slot')!
        setupSlot(slot)
        setupRemainingChildren()
        previousSlotItemMap = new Map(slotItemMap)
        context.emit(SwapEvent, { data: createEventData(slotItemMap) })
      } else if (view.name === 'slot') {
        slots = context.getViews('slot')
      }
    }
  })

  function setupRemainingChildren() {
    const animation = getAnimation()
    const remainingChildren = context.getViews('root-child')
    remainingChildren.forEach((child) => {
      child.position.setAnimator(animation.animator, animation.config)
      child.scale.setAnimator(animation.animator, animation.config)
      child.layoutTransition(true)
    })
  }

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
    const { x: scrollOffsetX, y: scrollOffsetY } =
      scrollContainer.getScrollOffset()
    draggingItem.position.set(
      {
        x: draggingEvent.x - newOffsetX - (handleOffsetX || 0) + scrollOffsetX,
        y: draggingEvent.y - newOffsetY - (handleOffsetY || 0) + scrollOffsetY
      },
      draggingItem.scale.x !== 1 || draggingItem.scale.y !== 1
    )
  }

  context.subscribeToEvents((eventBus: EventBus) => {
    eventBus.subscribeToEvent(Events.PointerMoveEvent, ({ x, y }) => {
      if (!scrollContainer) {
        return
      }
      if (scrollContainer.height - y <= MAX_SCROLL_THRESHOLD) {
        scrollDY = Math.max(
          0,
          MAX_SCROLL_SPEED *
            (1 -
              Math.min(scrollContainer.height - y, MAX_SCROLL_THRESHOLD) /
                MAX_SCROLL_THRESHOLD)
        )
      } else if (y <= MAX_SCROLL_THRESHOLD) {
        scrollDY =
          -1 *
          Math.max(
            0,
            MAX_SCROLL_SPEED *
              (1 - Math.min(y, MAX_SCROLL_THRESHOLD) / MAX_SCROLL_THRESHOLD)
          )
      } else {
        scrollDY = 0
      }

      if (scrollContainer.width - x <= MAX_SCROLL_THRESHOLD) {
        scrollDX = Math.max(
          0,
          MAX_SCROLL_SPEED *
            (1 -
              Math.min(scrollContainer.width - x, MAX_SCROLL_THRESHOLD) /
                MAX_SCROLL_THRESHOLD)
        )
      } else if (x <= MAX_SCROLL_THRESHOLD) {
        scrollDX =
          -1 *
          Math.max(
            0,
            MAX_SCROLL_SPEED *
              (1 - Math.min(x, MAX_SCROLL_THRESHOLD) / MAX_SCROLL_THRESHOLD)
          )
      } else {
        scrollDX = 0
      }
    })
  })

  context.update(() => {
    if (draggingEvent?.isDragging && shouldAutoScrollOnDrag) {
      scrollContainer.container.scrollBy({ top: scrollDY, left: scrollDX })
    }
  })

  function onDrag(event: DragEvent) {
    if (!enabled || !event.hasMoved) return
    const swapMode = getConfig().swapMode
    const withHandle = event.view.name === 'handle'
    draggingItem = withHandle ? event.view.getParent('item')! : event.view
    if (!draggingSlot) {
      draggingSlot = draggingItem.getParent('slot')!
    }
    if (handleOffsetX === null && handleOffsetY === null) {
      const resetHandleX = withHandle
        ? event.view.position.initialX - event.view.position.x
        : 0
      const resetHandleY = withHandle
        ? event.view.position.initialY - event.view.position.y
        : 0
      handleOffsetX =
        event.view.position.x - draggingItem.position.x - resetHandleX
      handleOffsetY =
        event.view.position.y - draggingItem.position.y - resetHandleY
    }
    const hoveringOverASlot = slots.some((slot) =>
      slot.intersects(event.pointerX, event.pointerY)
    )
    if (event.isDragging) {
      scrollContainer.startScrollTracking()
      if (!startedDragging) {
        startedDragging = true
        context.emit(SwapStartEvent, {})
      }
      if (slotItemMapOnDragStart === null) {
        slotItemMapOnDragStart = new Map(slotItemMap)
      }
      draggingEvent = event
      updateDraggingPosition()
      slots.forEach((slot) => {
        if (!slot.intersects(event.pointerX, event.pointerY)) {
          if (slot !== draggingSlot) {
            slot.element.removeAttribute('data-swapy-highlighted')
          }
          return
        }

        if (typeof slot.element.dataset.swapyHighlighted === 'undefined') {
          slot.element.dataset.swapyHighlighted = ''
        }

        if (!draggingSlot) {
          return
        }

        if (
          (swapMode === 'stop' || (swapMode !== 'drop' && !isContinuousMode)) &&
          !event.stopped
        ) {
          return
        }
        const targetSlotName = slot.element.dataset.swapySlot
        const targetItemName = slot.getChild('item')?.element.dataset.swapyItem
        const draggingSlotName = draggingSlot!.element.dataset.swapySlot
        const draggingItemName = draggingItem.element.dataset.swapyItem

        if (!targetSlotName || !draggingSlotName || !draggingItemName) {
          return
        }
        const newSlotItemMap = new Map(slotItemMap)
        newSlotItemMap.set(targetSlotName, draggingItemName)
        if (targetItemName) {
          newSlotItemMap.set(draggingSlotName, targetItemName)
        } else {
          newSlotItemMap.set(draggingSlotName, null)
        }
        triggerSwap = prepareSwap(new Map(newSlotItemMap))
        if (!mapsAreEqual(newSlotItemMap, previousSlotItemMap)) {
          if (!isManualSwap && swapMode !== 'drop') {
            triggerSwap()
          }
          draggingSlot = null
          if (swapMode !== 'drop') {
            context.emit(SwapEvent, { data: createEventData(newSlotItemMap) })
          }
        }
      })

      items.forEach((item) => {
        item.styles.zIndex = item === draggingItem ? '2' : ''
      })
    } else {
      slots.forEach((slot) => {
        slot.element.removeAttribute('data-swapy-highlighted')
      })
      draggingItem.position.reset()
      draggingSlot = null
      offsetX = null
      offsetY = null
      initialWidth = null
      initialHeight = null
      draggingEvent = null
      handleOffsetX = null
      handleOffsetY = null
      startedDragging = false

      if (swapMode === 'drop') {
        if (!hoveringOverASlot) {
          triggerSwap = prepareSwap(new Map(slotItemMap))
        }
        triggerSwap()
        context.emit(SwapEvent, { data: createEventData(slotItemMap) })
      }
      triggerSwap = () => {}

      hasSwapped = !mapsAreEqual(slotItemMap, slotItemMapOnDragStart!)

      context.emit(SwapEndEvent, {
        data: createEventData(slotItemMap),
        hasChanged: hasSwapped
      })

      hasSwapped = false
      slotItemMapOnDragStart = null
      scrollContainer.endScrollTracking()
    }
    requestAnimationFrame(() => {
      updateDraggingPosition()
    })
  }
}

SwapyPlugin.pluginName = 'Swapy'
SwapyPlugin.scope = 'root'
