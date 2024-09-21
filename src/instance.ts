import { getUniqueId, mapsAreEqual } from './utils'
import { installPlugin } from './veloxi-plugin'
import {
  InitEvent,
  SwapData,
  SwapEndEvent,
  SwapEvent,
  SwapEventArray,
  SwapEventData,
  SwapStartEvent,
  SwapyPlugin,
  SwapyPluginApi
} from './veloxi-plugin/SwapyPlugin'

type SwapCallback = (event: SwapEventData) => void
type SwapEndCallback = (event: SwapEventData) => void
type SwapStartCallback = () => void

export interface Swapy {
  onSwap(callback: SwapCallback): void
  onSwapEnd(callback: SwapEndCallback): void
  onSwapStart(callback: SwapStartCallback): void
  enable(enabled: boolean): void
  destroy(): void
  setData(swapData: SwapData): void
}

export type SlotItemMap = SwapEventArray

export type AnimationType = 'dynamic' | 'spring' | 'none'
export type SwapMode = 'hover' | 'stop' | 'drop'

export type Config = {
  animation: AnimationType
  continuousMode: boolean
  manualSwap: boolean
  swapMode: SwapMode
}

const DEFAULT_CONFIG: Config = {
  animation: 'dynamic',
  continuousMode: true,
  manualSwap: false,
  swapMode: 'hover'
}

function validate(root: HTMLElement): boolean {
  let isValid = true
  const slotElements = root.querySelectorAll('[data-swapy-slot]')
  if (slotElements.length === 0) {
    console.error('There are no slots defined in your root element:', root)
    isValid = false
  }
  slotElements.forEach((slot) => {
    const slotEl = slot as HTMLElement
    const slotId = slotEl.dataset.swapySlot
    if (!slotId || slotId.length === 0) {
      console.error(slot, 'does not contain a slotId using data-swapy-slot')
      isValid = false
    }
    const slotChildren = slotEl.children
    if (slotChildren.length > 1) {
      console.error(
        'slot:',
        `"${slotId}"`,
        'cannot contain more than one element'
      )
      isValid = false
    }
    const slotChild = slotChildren[0] as HTMLElement
    if (
      slotChild &&
      (!slotChild.dataset.swapyItem || slotChild.dataset.swapyItem.length === 0)
    ) {
      console.error(
        'slot:',
        `"${slotId}"`,
        'does not contain an element with item id using data-swapy-item'
      )
      isValid = false
    }
  })
  return isValid
}

function addVeloxiDataAttributes(
  root: HTMLElement,
  config = {} as Config
): string {
  const pluginKey = getUniqueId()
  root.dataset.velPluginKey = pluginKey
  root.dataset.velPlugin = 'Swapy'
  root.dataset.velView = 'root'
  root.dataset.velDataConfigAnimation = config.animation
  root.dataset.velDataConfigSwapMode = config.swapMode
  if (config.continuousMode) {
    root.dataset.velDataConfigContinuousMode = 'true'
  }
  if (config.manualSwap) {
    root.dataset.velDataConfigManualSwap = 'true'
  }
  const slots = Array.from(
    root.querySelectorAll('[data-swapy-slot]')
  ) as HTMLElement[]
  slots.forEach((slot) => {
    slot.dataset.velView = 'slot'
  })

  const items = Array.from(
    root.querySelectorAll('[data-swapy-item]')
  ) as HTMLElement[]
  items.forEach((item) => {
    item.dataset.velView = 'item'
    item.dataset.velLayoutId = item.dataset.swapyItem
    const handle = item.querySelector('[data-swapy-handle]') as HTMLElement
    if (handle) {
      handle.dataset.velView = 'handle'
    }
  })

  const textElements = Array.from(
    root.querySelectorAll('[data-swapy-text]')
  ) as HTMLElement[]
  textElements.forEach((el) => {
    el.dataset.velLayoutPosition = ''
  })

  const excludedElements = Array.from(
    root.querySelectorAll('[data-swapy-exclude]')
  ) as HTMLElement[]
  excludedElements.forEach((el) => {
    el.dataset.velIgnore = ''
  })

  return pluginKey
}

function resyncItems(root: HTMLElement): boolean {
  const slots = Array.from(
    root.querySelectorAll('[data-swapy-slot]:not([data-vel-view])')
  ) as HTMLElement[]
  slots.forEach((slot) => {
    slot.dataset.velView = 'slot'
  })
  const items = Array.from(
    root.querySelectorAll('[data-swapy-item]:not([data-vel-view]')
  ) as HTMLElement[]
  items.forEach((item) => {
    item.dataset.velView = 'item'
    item.dataset.velLayoutId = item.dataset.swapyItem
    const handle = item.querySelector('[data-swapy-handle]') as HTMLElement
    if (handle) {
      handle.dataset.velView = 'handle'
    }

    const textElements = Array.from(
      item.querySelectorAll('[data-swapy-text]')
    ) as HTMLElement[]
    textElements.forEach((el) => {
      el.dataset.velLayoutPosition = ''
    })

    const excludedElements = Array.from(
      item.querySelectorAll('[data-swapy-exclude]')
    ) as HTMLElement[]
    excludedElements.forEach((el) => {
      el.dataset.velIgnore = ''
    })
  })
  return items.length > 0 || slots.length > 0
}

function createSwapy(
  root: Element | null,
  userConfig: Partial<Config> = {} as Partial<Config>
): Swapy {
  if (!root) {
    throw new Error(
      'Cannot create a Swapy instance because the element you provided does not exist on the page!'
    )
  }
  const config = { ...DEFAULT_CONFIG, ...userConfig }
  const rootEl = root as HTMLElement
  if (!validate(rootEl)) {
    throw new Error(
      'Cannot create a Swapy instance because your HTML structure is invalid. Fix all above errors and then try!'
    )
  }
  const pluginKey = addVeloxiDataAttributes(rootEl, config)

  const swapy = new SwapyInstance(rootEl, pluginKey, config)
  return {
    onSwap(callback) {
      swapy.setSwapCallback(callback)
    },
    onSwapEnd(callback) {
      swapy.setSwapEndCallback(callback)
    },
    onSwapStart(callback) {
      swapy.setSwapStartCallback(callback)
    },
    enable(enabled) {
      swapy.setEnabled(enabled)
    },
    destroy() {
      swapy.destroy()
    },
    setData(swapData) {
      swapy.setData(swapData)
    }
  }
}

class SwapyInstance {
  private _rootEl: HTMLElement
  private _veloxiApp
  private _slotElMap: Map<string, HTMLElement>
  private _itemElMap: Map<string, HTMLElement>
  private _swapCallback?: SwapCallback
  private _swapEndCallback?: SwapEndCallback
  private _swapStartCallback?: SwapStartCallback
  private _previousMap?: Map<string, string | null>
  private _pluginKey: string
  constructor(rootEl: HTMLElement, pluginKey: string, config: Partial<Config>) {
    this._rootEl = rootEl
    this._veloxiApp = installPlugin()
    this._slotElMap = this._createSlotElMap()
    this._itemElMap = this._createItemElMap()
    this._pluginKey = pluginKey
    this._veloxiApp.onPluginEvent(
      SwapyPlugin,
      InitEvent,
      ({ data }) => {
        this._previousMap = data.map
      },
      pluginKey
    )

    this._veloxiApp.onPluginEvent(
      SwapyPlugin,
      SwapEvent,
      (event) => {
        if (
          this._previousMap &&
          mapsAreEqual(this._previousMap, event.data.map)
        ) {
          return
        }
        if (!config.manualSwap) {
          this._applyOrder(event.data.map)
        }
        this._previousMap = event.data.map
        this._swapCallback?.(event)
      },
      pluginKey
    )

    this._veloxiApp.onPluginEvent(
      SwapyPlugin,
      SwapEndEvent,
      (event) => {
        this._swapEndCallback?.(event)
      },
      pluginKey
    )

    this._veloxiApp.onPluginEvent(
      SwapyPlugin,
      SwapStartEvent,
      () => {
        this._swapStartCallback?.()
      },
      pluginKey
    )

    this.setupMutationObserver()
  }

  private setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.type === 'childList')) {
        if (resyncItems(this._rootEl)) {
          this._slotElMap = this._createSlotElMap()
          this._itemElMap = this._createItemElMap()
        }
      }
    })
    observer.observe(this._rootEl, {
      childList: true,
      subtree: true
    })
  }

  setData(swapData: SwapData) {
    try {
      const plugin = this._veloxiApp.getPlugin<SwapyPluginApi>(
        'Swapy',
        this._pluginKey
      )
      plugin.setData(swapData)
    } catch (e) {}
  }

  destroy() {
    this._veloxiApp.destroy('Swapy')
  }

  setEnabled(enabledValue: boolean) {
    try {
      const plugin = this._veloxiApp.getPlugin<SwapyPluginApi>(
        'Swapy',
        this._pluginKey
      )
      plugin.setEnabled(enabledValue)
    } catch (e) {}
  }

  setSwapCallback(callback: SwapCallback) {
    this._swapCallback = callback
  }

  setSwapEndCallback(callback: SwapEndCallback) {
    this._swapEndCallback = callback
  }

  setSwapStartCallback(callback: SwapStartCallback) {
    this._swapStartCallback = callback
  }

  private _applyOrder(map: Map<string, string | null>) {
    Array.from(map.keys()).forEach((slotName) => {
      if (map.get(slotName) === this._previousMap?.get(slotName)) {
        return
      }
      const itemName = map.get(slotName)
      if (!itemName) return
      const slot = this._slotElMap.get(slotName)
      const item = this._itemElMap.get(itemName)
      if (!slot || !item) return
      slot.innerHTML = ''
      slot.appendChild(item)
    })
  }

  private _createSlotElMap() {
    return (
      Array.from(
        this._rootEl.querySelectorAll('[data-swapy-slot]')
      ) as HTMLElement[]
    ).reduce((map, el) => {
      map.set(el.dataset.swapySlot, el)
      return map
    }, new Map())
  }

  private _createItemElMap() {
    return (
      Array.from(
        this._rootEl.querySelectorAll('[data-swapy-item]')
      ) as HTMLElement[]
    ).reduce((map, el) => {
      map.set(el.dataset.swapyItem, el)
      return map
    }, new Map())
  }
}

export { createSwapy }
