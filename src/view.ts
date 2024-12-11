import { BorderRadius, parseBorderRadius } from './borderRadius'
import { createRectFromBoundingRect, getLayoutRect, Rect } from './rect'

export interface View {
  el(): HTMLElement
  setTransform(transform: Partial<Transform>): void
  clearTransform(): void
  currentTransform: () => Transform
  borderRadius: () => BorderRadius
  layoutRect(): Rect
  boundingRect(): Rect
  usePlugin<P extends ViewPlugin, C>(
    pluginFactory: (v: View, config: C) => P,
    config: C
  ): P
  updateElement(el: HTMLElement): void
  destroy(): void
}

export interface ViewPlugin {
  onElementUpdate(): void
  destroy(): void
}

export type Transform = {
  dragX: number
  dragY: number
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
}

export function createView(el: HTMLElement): View {
  const plugins: Array<ViewPlugin> = []
  let element = el
  let currentTransform: Transform = {
    dragX: 0,
    dragY: 0,
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1
  }
  const borderRadius = parseBorderRadius(
    window.getComputedStyle(element).borderRadius
  )
  const thisView = {
    el: () => element,
    setTransform,
    clearTransform,
    currentTransform: () => currentTransform,
    borderRadius: () => borderRadius,
    layoutRect: () => getLayoutRect(element),
    boundingRect: () =>
      createRectFromBoundingRect(element.getBoundingClientRect()),
    usePlugin,
    destroy,
    updateElement
  }

  function setTransform(newTransform: Partial<Transform>) {
    currentTransform = { ...currentTransform, ...newTransform }
    renderTransform()
  }

  function clearTransform() {
    currentTransform = {
      dragX: 0,
      dragY: 0,
      translateX: 0,
      translateY: 0,
      scaleX: 1,
      scaleY: 1
    }
    renderTransform()
  }

  function renderTransform() {
    const { dragX, dragY, translateX, translateY, scaleX, scaleY } =
      currentTransform
    if (
      dragX === 0 &&
      dragY === 0 &&
      translateX === 0 &&
      translateY === 0 &&
      scaleX === 1 &&
      scaleY === 1
    ) {
      element.style.transform = ''
    } else {
      element.style.transform = `translate(${dragX + translateX}px, ${
        dragY + translateY
      }px) scale(${scaleX}, ${scaleY})`
    }
  }

  function usePlugin<P extends ViewPlugin, C>(
    pluginFactory: (v: View, config: C) => P,
    config: C
  ) {
    const plugin = pluginFactory(thisView, config)
    plugins.push(plugin)
    return plugin
  }

  function destroy() {
    plugins.forEach((plugin) => plugin.destroy())
  }

  function updateElement(el: HTMLElement) {
    if (!el) return
    const previousStyles = element.style.cssText
    element = el
    element.style.cssText = previousStyles
    plugins.forEach((plugin) => plugin.onElementUpdate())
  }

  return thisView
}
