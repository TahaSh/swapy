import { getUniqueId, mapsAreEqual } from './utils'
import { installPlugin } from './veloxi-plugin'
import {
  InitEvent,
  SwapEvent,
  SwapEventData,
  SwapyPlugin,
  SwapyPluginApi
} from './veloxi-plugin/SwapyPlugin'

interface SwapyApi {
  onSwap(callback: SwapCallback): void
  enable(enabled: boolean): void
}

export type AnimationType = 'dynamic' | 'spring' | 'none'
export type Config = {
  animation: AnimationType
}

const DEFAULT_CONFIG: Config = {
  animation: 'dynamic'
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

  return pluginKey
}

function createSwapy(
  root: Element,
  userConfig: Config = {} as Config
): SwapyApi {
  const config = { ...DEFAULT_CONFIG, ...userConfig }
  const rootEl = root as HTMLElement
  if (!validate(rootEl)) {
    throw new Error(
      'Cannot create swapy instance because your HTML structure is invalid. Fix all above errors and then try!'
    )
  }
  const pluginKey = addVeloxiDataAttributes(rootEl, config)

  const swapy = new Swapy(rootEl, pluginKey)
  return {
    onSwap(callback: SwapCallback) {
      swapy.setSwapCallback(callback)
    },
    enable(enabled: boolean) {
      swapy.setEnabled(enabled)
    }
  }
}

class Swapy {
  private _rootEl: HTMLElement
  private _veloxiApp
  private _slotElMap: Map<string, HTMLElement>
  private _itemElMap: Map<string, HTMLElement>
  private _swapCallback?: SwapCallback
  private _previousMap?: Map<string, string | null>
  constructor(rootEl: HTMLElement, pluginKey: string) {
    this._rootEl = rootEl
    this._veloxiApp = installPlugin()
    this._slotElMap = this._createSlotElMap()
    this._itemElMap = this._createItemElMap()
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
        this._applyOrder(event.data.map)
        this._swapCallback?.(event)
        this._previousMap = event.data.map
      },
      pluginKey
    )
  }

  setEnabled(enabledValue: boolean) {
    const plugin = this._veloxiApp.getPlugin<SwapyPluginApi>('Swapy')
    plugin.setEnabled(enabledValue)
  }

  setSwapCallback(callback: SwapCallback) {
    this._swapCallback = callback
  }

  private _applyOrder(map: Map<string, string | null>) {
    Array.from(map.keys()).forEach((slotName) => {
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

type SwapCallback = (event: SwapEventData) => void

export { createSwapy }
