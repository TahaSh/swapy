import { animate, AnimateConfig, CancelFunction } from './animators'
import { borderRadiusToString, isBorderRadiusNone } from './borderRadius'
import {
  DragEvent,
  DraggableConfig,
  DraggablePlugin,
  makeDraggable,
  OnDragListener,
  OnDropListener,
  OnHoldListener,
  OnReleaseListener
} from './draggable'
import { easeOutBack, easeOutCubic } from './easings'
import { Flip, flipView } from './flip'
import { clamp, lerp, lerpBorderRadius, remap } from './math'
import {
  createRectFromBoundingRect,
  pointIntersectsWithRect,
  Rect
} from './rect'
import { Vec2, vec2 } from './vector'
import { createView, View } from './view'

export * as utils from './utils'

export interface Swapy {
  enable(enabled: boolean): void
  onSwapStart(handler: SwapStartEventHandler): void
  onSwap(handler: SwapEventHandler): void
  onSwapEnd(handler: SwapEndEventHandler): void
  onBeforeSwap(handler: BeforeSwapHandler): void
  slotItemMap(): SlotItemMap
  update(): void
  destroy(): void
}

export type SwapStartEvent = {
  slotItemMap: SlotItemMap
  draggingItem: string
  fromSlot: string
}
export type SwapStartEventHandler = (event: SwapStartEvent) => void

export type SwapEvent = {
  oldSlotItemMap: SlotItemMap
  newSlotItemMap: SlotItemMap
  fromSlot: string
  toSlot: string
  draggingItem: string
  swappedWithItem: string
}
export type SwapEventHandler = (event: SwapEvent) => void

export type SwapEndEvent = {
  slotItemMap: SlotItemMap
  hasChanged: boolean
}
export type SwapEndEventHandler = (event: SwapEndEvent) => void

export type BeforeSwapEvent = {
  fromSlot: string
  toSlot: string
  draggingItem: string
  swapWithItem: string
}
export type BeforeSwapHandler = (event: BeforeSwapEvent) => boolean

interface Slot {
  id(): string
  item(): Item | undefined
  view(): View
  itemId(): string | null
  rect(): Rect
  highlight(): void
  unhighlightAllSlots(): void
  isHighlighted(): boolean
  destroy(): void
}

interface Item {
  id(): string
  slot(): Slot
  view(): View
  slotId(): string
  store(): Store
  onDrag(handler: OnDragListener): void
  onDrop(handler: OnDropListener): void
  onHold(handler: OnHoldListener): void
  onRelease(handler: OnReleaseListener): void
  isDragging(): boolean
  destroy(): void
  cancelAnimation(): ItemCancelAnimation
  dragEvent(): DragEvent | null
  continuousDrag(): boolean
  setContinuousDrag(value: boolean): void
}

type ItemCancelAnimation = Record<
  'drop' | 'moveToSlot',
  CancelFunction | undefined
>

type ScrollHandler = (e: Event) => void

interface Store {
  items(): Array<Item>
  slots(): Array<Slot>
  setItems(items: Array<Item>): void
  setSlots(slots: Array<Slot>): void
  itemById(id: string): Item | undefined
  slotById(id: string): Slot | undefined
  config(): Config
  zIndex(inc?: boolean): number
  resetZIndex(): void
  eventHandlers(): {
    onSwapStart: SwapStartEventHandler
    onSwap: SwapEventHandler
    onSwapEnd: SwapEndEventHandler
    onBeforeSwap: BeforeSwapHandler
  }
  syncSlotItemMap(): void
  slotItemMap(): SlotItemMap
  onScroll(handler: ScrollHandler | null): void
  swapItems(item: Item, toSlot: Slot): void
  destroy(): void
}

export type AnimationType = 'dynamic' | 'spring' | 'none'

export type SlotItemMapObject = Record<string, string>
export type SlotItemMapMap = Map<string, string>
export type SlotItemMapArray = Array<{ slot: string; item: string }>

export type SlotItemMap = {
  asObject: SlotItemMapObject
  asMap: SlotItemMapMap
  asArray: SlotItemMapArray
}

type DragAxis = 'x' | 'y' | 'both'

export type Config = {
  animation: AnimationType
  enabled: boolean
  swapMode: 'hover' | 'drop'
  dragOnHold: boolean
  autoScrollOnDrag: boolean
  dragAxis: DragAxis
  manualSwap: boolean
}

const DEFAULT_CONFIG: Config = {
  animation: 'dynamic',
  enabled: true,
  swapMode: 'hover',
  dragOnHold: false,
  autoScrollOnDrag: false,
  dragAxis: 'both',
  manualSwap: false
}

function getAnimateConfig(animationType: AnimationType): AnimateConfig {
  switch (animationType) {
    case 'dynamic':
      return { easing: easeOutCubic, duration: 300 }
    case 'spring':
      return { easing: easeOutBack, duration: 350 }
    case 'none':
      return { easing: (t: number) => t, duration: 1 }
  }
}

export function createSwapy(
  container: HTMLElement,
  config?: Partial<Config>
): Swapy {
  const userConfig = { ...DEFAULT_CONFIG, ...config }
  const store = createStore({ slots: [], items: [], config: userConfig })
  let slots: Array<Slot> = []
  let items: Array<Item> = []

  init()

  function init() {
    if (!isContainerValid(container)) {
      throw new Error(
        'Cannot create a Swapy instance because your HTML structure is invalid. Fix all above errors and then try!'
      )
    }

    slots = Array.from(container.querySelectorAll('[data-swapy-slot]')).map(
      (slotEl) => createSlot(slotEl as HTMLElement, store)
    )
    store.setSlots(slots)
    items = Array.from(container.querySelectorAll('[data-swapy-item]')).map(
      (itemEl) => createItem(itemEl as HTMLElement, store)
    )
    store.setItems(items)

    store.syncSlotItemMap()

    items.forEach((item) => {
      item.onDrag(({ pointerX, pointerY }) => {
        disableDefaultSelectAndDrag()

        let intersected = false
        slots.forEach((slot) => {
          const rect = slot.rect()
          if (pointIntersectsWithRect({ x: pointerX, y: pointerY }, rect)) {
            intersected = true
            if (!slot.isHighlighted()) {
              slot.highlight()
            }
          }
        })
        if (!intersected && store.config().swapMode === 'drop') {
          item.slot().highlight()
        }

        if (userConfig.swapMode === 'hover') {
          swapWithPointer(item, { pointerX, pointerY })
        }
      })
      item.onDrop(({ pointerX, pointerY }) => {
        enableDefaultSelectAndDrag()
        if (userConfig.swapMode === 'drop') {
          swapWithPointer(item, { pointerX, pointerY })
        }
      })
      item.onHold(() => {
        disableDefaultSelectAndDrag()
      })
      item.onRelease(() => {
        enableDefaultSelectAndDrag()
      })
    })
  }

  function swapWithPointer(
    item: Item,
    { pointerX, pointerY }: Pick<DragEvent, 'pointerX' | 'pointerY'>
  ) {
    slots.forEach((slot) => {
      const rect = slot.rect()
      if (pointIntersectsWithRect({ x: pointerX, y: pointerY }, rect)) {
        if (item.id() === slot.itemId()) return
        if (store.config().swapMode === 'hover') {
          item.setContinuousDrag(true)
        }
        const fromSlot = item.slot()
        const slotItem = slot.item()

        if (
          !store.eventHandlers().onBeforeSwap({
            fromSlot: fromSlot.id(),
            toSlot: slot.id(),
            draggingItem: item.id(),
            swapWithItem: slotItem?.id() || ''
          })
        ) {
          return
        }

        if (store.config().manualSwap) {
          const oldSlotItemMap = structuredClone(store.slotItemMap())
          store.swapItems(item, slot)
          const newSlotItemMap = store.slotItemMap()
          const draggingFlip = flipView(item.view())
          draggingFlip.readInitial()
          const swappedFlip: Flip | null = slotItem
            ? flipView(slotItem.view())
            : null
          swappedFlip?.readInitial()

          // ------------------------------------------------------------
          // Store current scroll position (before swap)
          // ------------------------------------------------------------
          let scrollYBeforeSwap = 0
          let scrollXBeforeSwap = 0
          const scrollContainer = getClosestScrollableContainer(
            item.view().el()
          )
          if (scrollContainer instanceof Window) {
            scrollYBeforeSwap = scrollContainer.scrollY
            scrollXBeforeSwap = scrollContainer.scrollX
          } else {
            scrollYBeforeSwap = scrollContainer.scrollTop
            scrollXBeforeSwap = scrollContainer.scrollLeft
          }

          // ------------------------------------------------------------
          // Framework should swap elements in onSwap event
          // ------------------------------------------------------------
          store.eventHandlers().onSwap({
            oldSlotItemMap,
            newSlotItemMap,
            fromSlot: fromSlot.id(),
            toSlot: slot.id(),
            draggingItem: item.id(),
            swappedWithItem: slotItem?.id() || ''
          })
          requestAnimationFrame(() => {
            const itemEls = container.querySelectorAll('[data-swapy-item]')
            store.items().forEach((item) => {
              const itemEl = Array.from(itemEls).find(
                (el) => (el as HTMLElement).dataset.swapyItem === item.id()
              ) as HTMLElement
              item.view().updateElement(itemEl)
            })

            store.syncSlotItemMap()

            draggingFlip.readFinalAndReverse()
            swappedFlip?.readFinalAndReverse()

            animateFlippedItem(item, draggingFlip)
            if (slotItem && swappedFlip) {
              animateFlippedItem(slotItem, swappedFlip)
            }

            // Restore scroll position before swap
            scrollContainer.scrollTo({
              left: scrollXBeforeSwap,
              top: scrollYBeforeSwap
            })
          })
        } else {
          let scrollYBeforeSwap = 0
          let scrollXBeforeSwap = 0
          const scrollContainer = getClosestScrollableContainer(
            item.view().el()
          )
          if (scrollContainer instanceof Window) {
            scrollYBeforeSwap = scrollContainer.scrollY
            scrollXBeforeSwap = scrollContainer.scrollX
          } else {
            scrollYBeforeSwap = scrollContainer.scrollTop
            scrollXBeforeSwap = scrollContainer.scrollLeft
          }
          moveItemToSlot(item, slot, true)
          if (slotItem) {
            moveItemToSlot(slotItem, fromSlot)
          }
          scrollContainer.scrollTo({
            left: scrollXBeforeSwap,
            top: scrollYBeforeSwap
          })
          const oldSlotItemMap = store.slotItemMap()
          store.syncSlotItemMap()
          const newSlotItemMap = store.slotItemMap()
          store.eventHandlers().onSwap({
            oldSlotItemMap,
            newSlotItemMap,
            fromSlot: fromSlot.id(),
            toSlot: slot.id(),
            draggingItem: item.id(),
            swappedWithItem: slotItem?.id() || ''
          })
        }
      }
    })
  }

  function disableDefaultSelectAndDrag() {
    container.querySelectorAll('img').forEach((img) => {
      img.style.pointerEvents = 'none'
    })
    container.style.userSelect = 'none'
    container.style.webkitUserSelect = 'none'
  }

  function enableDefaultSelectAndDrag() {
    container.querySelectorAll('img').forEach((img) => {
      img.style.pointerEvents = ''
    })
    container.style.userSelect = ''
    container.style.webkitUserSelect = ''
  }

  function enable(enabled: boolean) {
    store.config().enabled = enabled
  }

  function onSwapStart(handler: SwapStartEventHandler) {
    store.eventHandlers().onSwapStart = handler
  }

  function onSwap(handler: SwapEventHandler) {
    store.eventHandlers().onSwap = handler
  }

  function onSwapEnd(handler: SwapEndEventHandler) {
    store.eventHandlers().onSwapEnd = handler
  }

  function onBeforeSwap(handler: BeforeSwapHandler) {
    store.eventHandlers().onBeforeSwap = handler
  }

  function update(): void {
    destroy()
    requestAnimationFrame(() => {
      init()
    })
  }

  function destroy(): void {
    items.forEach((item) => item.destroy())
    slots.forEach((slot) => slot.destroy())
    store.destroy()
    items = []
    slots = []
  }

  return {
    enable,
    slotItemMap: () => store.slotItemMap(),
    onSwapStart,
    onSwap,
    onSwapEnd,
    onBeforeSwap,
    update,
    destroy
  }
}

function createStore({
  slots,
  items,
  config
}: {
  slots: Array<Slot>
  items: Array<Item>
  config: Config
}): Store {
  const initialStore = {
    slots,
    items,
    config,
    slotItemMap: { asObject: {}, asMap: new Map(), asArray: [] } as SlotItemMap,
    zIndexCount: 1,
    eventHandlers: {
      onSwapStart: () => {},
      onSwap: () => {},
      onSwapEnd: () => {},
      onBeforeSwap: () => true
    },
    scrollOffsetWhileDragging: { x: 0, y: 0 } as Vec2,
    scrollHandler: null as ScrollHandler | null
  }
  let store = {
    ...initialStore
  }

  const scrollHandler = (e: Event) => {
    store.scrollHandler?.(e)
  }

  window.addEventListener('scroll', scrollHandler)

  function slotById(id: string): Slot | undefined {
    return store.slots.find((slot) => slot.id() === id)
  }

  function itemById(id: string): Item | undefined {
    return store.items.find((item) => item.id() === id)
  }

  function syncSlotItemMap() {
    const asObject: SlotItemMapObject = {}
    const asMap: SlotItemMapMap = new Map()
    const asArray: SlotItemMapArray = []

    store.slots.forEach((slot) => {
      const slotId = slot.id()
      const itemId = slot.item()?.id() || ''
      asObject[slotId] = itemId
      asMap.set(slotId, itemId)
      asArray.push({ slot: slotId, item: itemId })
    })

    store.slotItemMap = { asObject, asMap, asArray }
  }

  /**
   * Only used for manualSwap
   */
  function swapItems(item: Item, toSlot: Slot) {
    const currentSlotItemMap = store.slotItemMap
    const sourceItemId = item.id()
    const targetItemId = toSlot.item()?.id() || ''
    const toSlotId = toSlot.id()
    const fromSlotId = item.slot().id()

    currentSlotItemMap.asObject[toSlotId] = sourceItemId
    currentSlotItemMap.asObject[fromSlotId] = targetItemId
    currentSlotItemMap.asMap.set(toSlotId, sourceItemId)
    currentSlotItemMap.asMap.set(fromSlotId, targetItemId)
    const toSlotIndex = currentSlotItemMap.asArray.findIndex(
      (slotItem) => slotItem.slot === toSlotId
    )
    const fromSlotIndex = currentSlotItemMap.asArray.findIndex(
      (slotItem) => slotItem.slot === fromSlotId
    )
    currentSlotItemMap.asArray[toSlotIndex].item = sourceItemId
    currentSlotItemMap.asArray[fromSlotIndex].item = targetItemId
  }

  function destroy() {
    window.removeEventListener('scroll', scrollHandler)
    store = { ...initialStore }
  }

  return {
    slots: () => store.slots,
    items: () => store.items,
    config: () => config,
    setItems: (items) => (store.items = items),
    setSlots: (slots) => (store.slots = slots),
    slotById,
    itemById,
    zIndex: (inc = false) => {
      if (inc) {
        return ++store.zIndexCount
      }
      return store.zIndexCount
    },
    resetZIndex: () => {
      store.zIndexCount = 1
    },
    eventHandlers: () => store.eventHandlers,
    syncSlotItemMap,
    slotItemMap: () => store.slotItemMap,
    onScroll: (handler: ScrollHandler | null) => {
      store.scrollHandler = handler
    },
    swapItems,
    destroy
  }
}

function createSlot(slotEl: HTMLElement, store: Store): Slot {
  const view = createView(slotEl)

  function id(): string {
    return view.el().dataset.swapySlot!
  }

  function itemId(): string | null {
    const itemEl = view.el().children[0] as HTMLElement | null
    return itemEl?.dataset.swapyItem || null
  }

  function rect(): Rect {
    return createRectFromBoundingRect(view.el().getBoundingClientRect())
  }

  function item(): Item | undefined {
    const itemEl = view.el().children[0] as HTMLElement
    if (itemEl) {
      return store.itemById(itemEl.dataset.swapyItem!)
    }
  }

  function unhighlightAllSlots() {
    store.slots().forEach((slot) => {
      slot.view().el().removeAttribute('data-swapy-highlighted')
    })
  }

  function highlight() {
    unhighlightAllSlots()
    view.el().setAttribute('data-swapy-highlighted', '')
  }

  function destroy() {}

  return {
    id,
    view: () => view,
    itemId,
    rect,
    item,
    highlight,
    unhighlightAllSlots,
    isHighlighted: () => view.el().hasAttribute('data-swapy-highlighted'),
    destroy
  }
}

function createItem(itemEl: HTMLElement, store: Store): Item {
  const view = createView(itemEl)
  const cancelAnimation: ItemCancelAnimation = {} as ItemCancelAnimation
  let autoScroller: AutoScroller | null = null
  let slotItemMapSessionStart: SlotItemMap | null = null

  // ------------------------------------------------------------
  // Variables for dragging
  // ------------------------------------------------------------
  let dragging = false
  let continuousDrag = true
  let currentDragEvent: DragEvent | null
  const dragSyncUpdate = createSyncUpdate()
  let dragListener: OnDragListener | null = () => {}
  let dropListener: OnDropListener | null = () => {}
  let holdListener: OnHoldListener | null = () => {}
  let releaseListener: OnReleaseListener | null = () => {}
  const { onDrag, onDrop, onHold, onRelease } = view.usePlugin<
    DraggablePlugin,
    DraggableConfig
  >(makeDraggable, {
    startDelay: store.config().dragOnHold ? 400 : 0,
    targetEl: handle()
  })

  // ------------------------------------------------------------
  // Variables for handling scrolling while dragging
  // ------------------------------------------------------------
  const lastScroll = vec2(0, 0)
  const containerLastScroll = vec2(0, 0)
  const scrollOffset = vec2(0, 0)
  const containerScrollOffset = vec2(0, 0)
  let scrollContainer: HTMLElement | Window | null = null
  let scrollContainerHandler: ScrollHandler | null = null

  // ------------------------------------------------------------
  // Run only when dragOnHold is enabled.
  // Executed the moment the user clicks on the element and holds
  // without moving the pointer.
  // ------------------------------------------------------------
  onHold((e) => {
    if (!store.config().enabled) {
      return
    }
    if (hasHandle() && !isHandleEl(e.el)) {
      return
    }
    if (hasNoDrag() && isNoDrag(e.el)) {
      return
    }
    holdListener?.(e)
  })

  // ------------------------------------------------------------
  // Run only when dragOnHold is enabled.
  // Executed when the user releases the pointer (pointerUp)
  // before the startDelay passes.
  //
  // Use case: the user has to click and hold for a few hundered
  // milliseconds before the drag is activated, but the user
  // releases the pointer before that, cancelling the drag.
  // ------------------------------------------------------------
  onRelease((e) => {
    if (!store.config().enabled) {
      return
    }
    if (hasHandle() && !isHandleEl(e.el)) {
      return
    }
    if (hasNoDrag() && isNoDrag(e.el)) {
      return
    }
    releaseListener?.(e)
  })

  function onDragStart(dragEvent: DragEvent) {
    markAsDragging()
    slot().highlight()
    cancelAnimation.drop?.()

    const slotRects = store.slots().map((slot) => slot.view().boundingRect())
    store.slots().forEach((slot, i) => {
      const rect = slotRects[i]
      slot.view().el().style.width = `${rect.width}px`
      slot.view().el().style.maxWidth = `${rect.width}px`
      slot.view().el().style.flexShrink = '0'
      slot.view().el().style.height = `${rect.height}px`
    })

    const slotItemMap = store.slotItemMap()
    store.eventHandlers().onSwapStart({
      draggingItem: id(),
      fromSlot: slotId(),
      slotItemMap
    })
    slotItemMapSessionStart = slotItemMap
    view.el().style.position = 'relative'
    view.el().style.zIndex = `${store.zIndex(true)}`

    scrollContainer = getClosestScrollableContainer(dragEvent.el)

    if (store.config().autoScrollOnDrag) {
      autoScroller = createAutoScroller(
        scrollContainer,
        store.config().dragAxis
      )
      autoScroller.updatePointer({
        x: dragEvent.pointerX,
        y: dragEvent.pointerY
      })
    }

    // ------------------------------------------------------------
    // Handling scrolling while dragging
    // ------------------------------------------------------------
    lastScroll.x = window.scrollX
    lastScroll.y = window.scrollY
    scrollOffset.x = 0
    scrollOffset.y = 0

    // When the scrollContainer is not the window
    if (scrollContainer instanceof HTMLElement) {
      containerLastScroll.x = scrollContainer.scrollLeft
      containerLastScroll.y = scrollContainer.scrollTop
      // Handler for scrolling the closest scroll container
      scrollContainerHandler = () => {
        containerScrollOffset.x =
          (scrollContainer as HTMLElement).scrollLeft - containerLastScroll.x
        containerScrollOffset.y =
          (scrollContainer as HTMLElement).scrollTop - containerLastScroll.y
        view.setTransform({
          dragX:
            (currentDragEvent?.width || 0) +
            scrollOffset.x +
            containerScrollOffset.x,
          dragY:
            (currentDragEvent?.height || 0) +
            scrollOffset.y +
            containerScrollOffset.y
        })
      }
      scrollContainer.addEventListener('scroll', scrollContainerHandler)
    }

    // When scrolling the window
    store.onScroll(() => {
      scrollOffset.x = window.scrollX - lastScroll.x
      scrollOffset.y = window.scrollY - lastScroll.y
      const containerOffsetX = containerScrollOffset.x || 0
      const containerOffsetY = containerScrollOffset.y || 0
      view.setTransform({
        dragX:
          (currentDragEvent?.width || 0) + scrollOffset.x + containerOffsetX,
        dragY:
          (currentDragEvent?.height || 0) + scrollOffset.y + containerOffsetY
      })
    })
  }

  onDrag((dragEvent) => {
    if (!store.config().enabled) {
      return
    }
    // On drag start
    if (!dragging) {
      if (hasHandle() && !isHandleEl(dragEvent.el)) {
        return
      }
      if (hasNoDrag() && isNoDrag(dragEvent.el)) {
        return
      }
      onDragStart(dragEvent)
    }
    dragging = true
    if (autoScroller) {
      autoScroller.updatePointer({
        x: dragEvent.pointerX,
        y: dragEvent.pointerY
      })
    }
    currentDragEvent = dragEvent
    cancelAnimation.drop?.()
    dragSyncUpdate(() => {
      view.el().style.position = 'relative'
      const dragX = dragEvent.width + scrollOffset.x + containerScrollOffset.x
      const dragY = dragEvent.height + scrollOffset.y + containerScrollOffset.y
      if (store.config().dragAxis === 'y') {
        view.setTransform({
          dragY
        })
      } else if (store.config().dragAxis === 'x') {
        view.setTransform({
          dragX
        })
      } else {
        view.setTransform({
          dragX,
          dragY
        })
      }
      dragListener?.(dragEvent)
    })
  })

  onDrop((dragEvent) => {
    if (!dragging) return
    unmarkAsDragging()
    dragging = false
    continuousDrag = false
    currentDragEvent = null
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', scrollContainerHandler!)
      scrollContainerHandler = null
    }
    scrollContainer = null
    containerScrollOffset.x = 0
    containerScrollOffset.y = 0
    scrollOffset.x = 0
    scrollOffset.y = 0
    if (autoScroller) {
      autoScroller.destroy()
      autoScroller = null
    }
    slot().unhighlightAllSlots()
    dropListener?.(dragEvent)
    store.eventHandlers().onSwapEnd({
      slotItemMap: store.slotItemMap(),
      hasChanged: slotItemMapSessionStart?.asMap
        ? !areMapsEqual(
            slotItemMapSessionStart?.asMap,
            store.slotItemMap().asMap
          )
        : false
    })
    slotItemMapSessionStart = null
    store.onScroll(null)
    store.slots().forEach((slot) => {
      slot.view().el().style.width = ''
      slot.view().el().style.maxWidth = ''
      slot.view().el().style.flexShrink = ''
      slot.view().el().style.height = ''
    })
    if (store.config().manualSwap && store.config().swapMode === 'drop') {
      requestAnimationFrame(animateDrop)
    } else {
      animateDrop()
    }
    function animateDrop() {
      const current = view.currentTransform()
      const currentX = current.dragX + current.translateX
      const currentY = current.dragY + current.translateY
      cancelAnimation.drop = animate(
        { translate: vec2(currentX, currentY) },
        { translate: vec2(0, 0) },
        ({ translate }, done) => {
          if (done) {
            if (!dragging) {
              view.clearTransform()
              view.el().style.transformOrigin = ''
            }
          } else {
            view.setTransform({
              dragX: 0,
              dragY: 0,
              translateX: translate.x,
              translateY: translate.y
            })
          }
          if (done) {
            store.items().forEach((item) => {
              if (!item.isDragging()) {
                item.view().el().style.zIndex = ''
              }
            })
            store.resetZIndex()
            view.el().style.position = ''
            continuousDrag = true
          }
        },
        getAnimateConfig(store.config().animation)
      )
    }
  })

  function onItemDrag(listener: OnDragListener) {
    dragListener = listener
  }

  function onItemDrop(listener: OnDropListener) {
    dropListener = listener
  }

  function onItemHold(listener: OnHoldListener) {
    holdListener = listener
  }

  function onItemRelease(listener: OnReleaseListener) {
    releaseListener = listener
  }

  function handle(): HTMLElement | null {
    return view.el().querySelector('[data-swapy-handle]')
  }

  function isHandleEl(el: HTMLElement): boolean {
    const handleEl = handle()
    if (!handleEl) {
      return false
    }
    return handleEl === el || handleEl.contains(el)
  }

  function hasHandle(): boolean {
    return handle() !== null
  }

  function noDragEls(): Array<HTMLElement> {
    return Array.from(view.el().querySelectorAll('[data-swapy-no-drag]'))
  }

  function isNoDrag(el: HTMLElement): boolean {
    const noDragElements = noDragEls()
    if (!noDragElements || noDragElements.length === 0) {
      return false
    }
    return (
      noDragElements.includes(el) ||
      noDragElements.some((noDragEl) => noDragEl.contains(el))
    )
  }

  function hasNoDrag(): boolean {
    return noDragEls().length > 0
  }

  function markAsDragging() {
    view.el().setAttribute('data-swapy-dragging', '')
  }

  function unmarkAsDragging() {
    view.el().removeAttribute('data-swapy-dragging')
  }

  function destroy() {
    dragListener = null
    dropListener = null
    holdListener = null
    releaseListener = null
    currentDragEvent = null
    slotItemMapSessionStart = null
    if (autoScroller) {
      autoScroller.destroy()
      autoScroller = null
    }
    if (scrollContainer && scrollContainerHandler) {
      scrollContainer.removeEventListener('scroll', scrollContainerHandler)
    }
    view.destroy()
  }

  function id(): string {
    return view.el().dataset.swapyItem!
  }

  function slot(): Slot {
    return store.slotById(view.el().parentElement!.dataset.swapySlot!)!
  }

  function slotId(): string {
    return view.el().parentElement!.dataset.swapySlot!
  }

  return {
    id,
    view: () => view,
    slot,
    slotId,
    onDrag: onItemDrag,
    onDrop: onItemDrop,
    onHold: onItemHold,
    onRelease: onItemRelease,
    destroy,
    isDragging: () => dragging,
    cancelAnimation: () => cancelAnimation,
    dragEvent: () => currentDragEvent,
    store: () => store,
    continuousDrag: () => continuousDrag,
    setContinuousDrag: (value: boolean) => (continuousDrag = value)
  }
}

function moveItemToSlot(item: Item, slot: Slot, from = false) {
  if (from) {
    const targetItem = slot.item()
    if (targetItem) {
      slot.view().el().style.position = 'relative'
      targetItem.view().el().style.position = 'absolute'
    }
  } else {
    const slotOfItem = item.slot()
    slotOfItem.view().el().style.position = ''
    item.view().el().style.position = ''
  }
  if (!item) {
    return
  }

  const flip = flipView(item.view())
  flip.readInitial()
  slot.view().el().appendChild(item.view().el())
  flip.readFinalAndReverse()
  animateFlippedItem(item, flip)
}

function createSyncUpdate() {
  let isUpdating = false
  return (cb: () => void) => {
    if (isUpdating) return
    isUpdating = true
    requestAnimationFrame(() => {
      cb()
      isUpdating = false
    })
  }
}

function animateFlippedItem(item: Item, flip: Flip) {
  item.cancelAnimation().moveToSlot?.()
  item.cancelAnimation().drop?.()
  const animateConfig = getAnimateConfig(item.store().config().animation)

  const transitionValues = flip.transitionValues()

  let current = item.view().currentTransform()
  let lastProgress = 0
  let draggedAfterDrop = false
  item.cancelAnimation().moveToSlot = animate(
    {
      translate: transitionValues.from.translate,
      scale: transitionValues.from.scale,
      borderRadius: transitionValues.from.borderRadius
    },
    {
      translate: transitionValues.to.translate,
      scale: transitionValues.to.scale,
      borderRadius: transitionValues.to.borderRadius
    },
    ({ translate, scale, borderRadius }, done, progress) => {
      if (item.isDragging()) {
        if (lastProgress !== 0) {
          draggedAfterDrop = true
        }
        const relativeX = item.dragEvent()!.relativeX
        const relativeY = item.dragEvent()!.relativeY
        /**
         * ContinuousDrag means the user didn't drop the item
         * and dragged it again quickly before it reaches final position on drop.
         * This might not be possible if the animation is very quick.
         * We need this to avoid updating translateX and translateY for non-continuousDrag.
         * We update them to adjust the item position based on cursor position when scaling,
         * for example scaling from left if holding the item from the right edge
         * (similar to transform-origin).
         * If we update translateX and translateY for non-continuousDrag, we'll see some
         * animation issues, like the item sliding while dragging again. Subtle, but important.
         */
        if (item.continuousDrag()) {
          item.view().setTransform({
            translateX: lerp(
              current.translateX,
              current.translateX +
                (transitionValues.from.width - transitionValues.to.width) *
                  relativeX,
              animateConfig.easing(progress - lastProgress)
            ),
            translateY: lerp(
              current.translateY,
              current.translateY +
                (transitionValues.from.height - transitionValues.to.height) *
                  relativeY,
              animateConfig.easing(progress - lastProgress)
            ),
            scaleX: scale.x,
            scaleY: scale.y
          })
        } else {
          item.view().setTransform({ scaleX: scale.x, scaleY: scale.y })
        }
      } else {
        current = item.view().currentTransform()
        lastProgress = progress
        // If the user dragged the item while it was moving to new slot,
        // we just need to animate the scale, because the translate animation
        // will now be handled by the dropping animation when the user drop it.
        if (draggedAfterDrop) {
          item.view().setTransform({
            scaleX: scale.x,
            scaleY: scale.y
          })
        } else {
          item.view().setTransform({
            dragX: 0,
            dragY: 0,
            translateX: translate.x,
            translateY: translate.y,
            scaleX: scale.x,
            scaleY: scale.y
          })
        }
      }
      const children = flip.childrenTransitionData()
      children.forEach(
        ({
          el,
          fromTranslate,
          fromScale,
          fromBorderRadius,
          toBorderRadius,
          parentScale
        }) => {
          const parentScaleX = lerp(
            parentScale.x,
            1,
            animateConfig.easing(progress)
          )
          const parentScaleY = lerp(
            parentScale.y,
            1,
            animateConfig.easing(progress)
          )
          el.style.transform = `translate(${
            fromTranslate.x +
            (0 - fromTranslate.x / parentScaleX) *
              animateConfig.easing(progress)
          }px, ${
            fromTranslate.y +
            (0 - fromTranslate.y / parentScaleY) *
              animateConfig.easing(progress)
          }px) scale(${lerp(
            fromScale.x / parentScaleX,
            1 / parentScaleX,
            animateConfig.easing(progress)
          )}, ${lerp(
            fromScale.y / parentScaleY,
            1 / parentScaleY,
            animateConfig.easing(progress)
          )})`

          if (!isBorderRadiusNone(fromBorderRadius)) {
            el.style.borderRadius = borderRadiusToString(
              lerpBorderRadius(
                fromBorderRadius,
                toBorderRadius,
                animateConfig.easing(progress)
              )
            )
          }
        }
      )
      if (!isBorderRadiusNone(borderRadius)) {
        item.view().el().style.borderRadius = borderRadiusToString(borderRadius)
      }
      if (done) {
        if (!item.isDragging()) {
          item.view().el().style.transformOrigin = ''
          item.view().clearTransform()
        }
        item.view().el().style.borderRadius = ''

        children.forEach(({ el }) => {
          el.style.transform = ''
          el.style.transformOrigin = ''
          el.style.borderRadius = ''
        })
      }
    },
    animateConfig
  )
}

function logError(...args: unknown[]) {
  console.error('Swapy Error:', ...args)
}

function isContainerValid(container: Element) {
  const containerEl = container as HTMLElement
  let isValid = true
  const slotEls = containerEl.querySelectorAll('[data-swapy-slot]')

  if (!containerEl) {
    logError('container passed to createSwapy() is undefined or null')
    isValid = false
  }

  slotEls.forEach((_slotEl) => {
    const slotEl = _slotEl as HTMLElement
    const slotId = slotEl.dataset.swapySlot
    const slotChildren = slotEl.children
    const slotFirstChild = slotChildren[0] as HTMLElement

    if (!slotId || slotId.length === 0) {
      logError(slotEl, 'does not contain a slotId using data-swapy-slot')
      isValid = false
    }

    if (slotChildren.length > 1) {
      logError('slot:', `"${slotId}"`, 'cannot contain more than one element')
      isValid = false
    }

    if (
      slotFirstChild &&
      (!slotFirstChild.dataset.swapyItem ||
        slotFirstChild.dataset.swapyItem.length === 0)
    ) {
      logError(
        'slot',
        `"${slotId}"`,
        'does not contain an element with an item id using data-swapy-item'
      )
      isValid = false
    }
  })

  const slotIds = Array.from(slotEls).map(
    (slotEl) => (slotEl as HTMLElement).dataset.swapySlot
  )

  const itemEls = containerEl.querySelectorAll('[data-swapy-item]')

  const itemIds = Array.from(itemEls).map(
    (itemEl) => (itemEl as HTMLElement).dataset.swapyItem
  )

  if (hasDuplicates(slotIds)) {
    const duplicates = findDuplicates(slotIds)
    logError(
      'your container has duplicate slot ids',
      `(${duplicates.join(', ')})`
    )
    isValid = false
  }

  if (hasDuplicates(itemIds)) {
    const duplicates = findDuplicates(itemIds)
    logError(
      'your container has duplicate item ids',
      `(${duplicates.join(', ')})`
    )
    isValid = false
  }

  return isValid
}

function hasDuplicates<T>(array: Array<T>): boolean {
  return new Set(array).size !== array.length
}

function findDuplicates<T>(array: T[]): T[] {
  const seen = new Set<T>()
  const duplicates = new Set<T>()

  for (const item of array) {
    if (seen.has(item)) {
      duplicates.add(item)
    } else {
      seen.add(item)
    }
  }

  return Array.from(duplicates)
}

function areMapsEqual(
  map1: Map<string, string>,
  map2: Map<string, string>
): boolean {
  if (map1.size !== map2.size) return false
  for (const [key, value] of map1) {
    if (map2.get(key) !== value) return false
  }
  return true
}

export function getClosestScrollableContainer(
  element: HTMLElement
): HTMLElement | Window {
  let current: HTMLElement | null = element

  while (current) {
    const computedStyle = window.getComputedStyle(current)
    const overflowY = computedStyle.overflowY
    const overflowX = computedStyle.overflowX

    if (
      ((overflowY === 'auto' || overflowY === 'scroll') &&
        current.scrollHeight > current.clientHeight) ||
      ((overflowX === 'auto' || overflowX === 'scroll') &&
        current.scrollWidth > current.clientWidth)
    ) {
      return current
    }

    current = current.parentElement
  }

  return window
}

interface AutoScroller {
  updatePointer(pointer: Vec2): void
  destroy(): void
}

function createAutoScroller(
  container: HTMLElement | Window,
  dragAxis: DragAxis
): AutoScroller {
  const MAX_DISTANCE = 100
  const MAX_SPEED = 5
  let scrolling = false
  let rect: Rect
  let maxScrollY = 0
  let maxScrollX = 0
  let currentScrollY = 0
  let currentScrollX = 0
  let scrollTopBy = 0
  let scrollLeftBy = 0
  let raf: number | null = null

  if (container instanceof HTMLElement) {
    rect = createRectFromBoundingRect(container.getBoundingClientRect())
    maxScrollY = container.scrollHeight - rect.height
    maxScrollX = container.scrollWidth - rect.width
  } else {
    rect = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    }
    maxScrollY = document.documentElement.scrollHeight - window.innerHeight
    maxScrollX = document.documentElement.scrollWidth - window.innerWidth
  }

  function updateCurrentScroll() {
    if (container instanceof HTMLElement) {
      currentScrollY = container.scrollTop
      currentScrollX = container.scrollLeft
    } else {
      currentScrollY = window.scrollY
      currentScrollX = window.scrollX
    }
  }

  function updatePointer(pointer: Vec2) {
    scrolling = false
    const rectTop = rect.y
    const rectBottom = rect.y + rect.height
    const rectLeft = rect.x
    const rectRight = rect.x + rect.width

    const closerToTop =
      Math.abs(rectTop - pointer.y) < Math.abs(rectBottom - pointer.y)
    const closerToLeft =
      Math.abs(rectLeft - pointer.x) < Math.abs(rectRight - pointer.x)

    updateCurrentScroll()

    if (dragAxis !== 'x') {
      if (closerToTop) {
        const distanceToTop = rectTop - pointer.y
        if (distanceToTop >= -MAX_DISTANCE) {
          const v = clamp(distanceToTop, -MAX_DISTANCE, 0)
          const scrollAmount = remap(-MAX_DISTANCE, 0, 0, MAX_SPEED, v)
          scrollTopBy = -scrollAmount
          scrolling = true
        }
      } else {
        const distanceToBottom = rectBottom - pointer.y
        if (distanceToBottom <= MAX_DISTANCE) {
          const v = clamp(distanceToBottom, 0, MAX_DISTANCE)
          const scrollAmount = remap(MAX_DISTANCE, 0, 0, MAX_SPEED, v)
          scrollTopBy = scrollAmount
          scrolling = true
        }
      }
    }

    if (dragAxis !== 'y') {
      if (closerToLeft) {
        const distanceToLeft = rectLeft - pointer.x
        if (distanceToLeft >= -MAX_DISTANCE) {
          const v = clamp(distanceToLeft, -MAX_DISTANCE, 0)
          const scrollAmount = remap(-MAX_DISTANCE, 0, 0, MAX_SPEED, v)
          scrollLeftBy = -scrollAmount
          scrolling = true
        }
      } else {
        const distanceToRight = rectRight - pointer.x
        if (distanceToRight <= MAX_DISTANCE) {
          const v = clamp(distanceToRight, 0, MAX_DISTANCE)
          const scrollAmount = remap(MAX_DISTANCE, 0, 0, MAX_SPEED, v)
          scrollLeftBy = scrollAmount
          scrolling = true
        }
      }
    }

    if (scrolling) {
      if (raf) {
        cancelAnimationFrame(raf)
      }
      scroll()
    }
  }

  function scroll() {
    updateCurrentScroll()
    if (dragAxis !== 'x') {
      scrollTopBy = currentScrollY + scrollTopBy >= maxScrollY ? 0 : scrollTopBy
    }
    if (dragAxis !== 'y') {
      scrollLeftBy =
        currentScrollX + scrollLeftBy >= maxScrollX ? 0 : scrollLeftBy
    }

    container.scrollBy({ top: scrollTopBy, left: scrollLeftBy })
    if (scrolling) {
      raf = requestAnimationFrame(scroll)
    }
  }

  function destroy() {
    scrolling = false
  }

  return {
    updatePointer,
    destroy
  }
}
