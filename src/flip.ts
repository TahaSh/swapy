import {
  BorderRadius,
  borderRadiusToString,
  calculateBorderRadiusInverse,
  parseBorderRadius
} from './borderRadius'
import {
  createRectFromBoundingRect,
  getCorrectedBoundingRect,
  getLayoutRect,
  getScrollOffset,
  Rect
} from './rect'
import { vec2, Vec2 } from './vector'
import { Transform, View } from './view'

type TransitionValue = {
  width: number
  height: number
  translate: Vec2
  scale: Vec2
  borderRadius: BorderRadius
}

type FlipTransitionValues = { from: TransitionValue; to: TransitionValue }

type FlipChildTransitionData = {
  el: HTMLElement
  fromTranslate: Vec2
  fromScale: Vec2
  fromBorderRadius: BorderRadius
  toBorderRadius: BorderRadius
  parentScale: Vec2
}

type ElementFlipRect = { el: HTMLElement; initialRect: Rect; finalRect?: Rect }

type ParentChildrenTreeData = Array<{
  parent: ElementFlipRect
  children: Array<ElementFlipRect & { borderRadius: BorderRadius }>
}>

type ChildElement = HTMLElement & { originalBorderRadius: string }

export interface Flip {
  readInitial(): void
  readFinalAndReverse(): void
  transitionValues(): FlipTransitionValues
  childrenTransitionData(): Array<FlipChildTransitionData>
}

export function flipView(view: View): Flip {
  let state: 'unread' | 'readInitial' | 'readFinal' = 'unread'

  let current: Transform
  let parentInitialRect: Rect
  let scrollOffset: Vec2

  let parentDx: number
  let parentDy: number
  let parentDw: number
  let parentDh: number
  let parentInverseBorderRadius: BorderRadius
  let parentFinalRect: Rect

  let childrenData: Array<FlipChildTransitionData>

  let parentChildrenTreeData: ParentChildrenTreeData

  function readInitial() {
    current = view.currentTransform()
    parentInitialRect = getCorrectedBoundingRect(view.el())
    scrollOffset = getScrollOffset(view.el())

    const tree = getParentChildTree(view.el())
    parentChildrenTreeData = tree.map(({ parent, children }) => ({
      parent: {
        el: parent,
        initialRect: createRectFromBoundingRect(parent.getBoundingClientRect())
      },
      children: children
        .filter((child) => child instanceof HTMLElement)
        .map((child) => {
          const childEl = child as ChildElement
          if (!childEl.originalBorderRadius) {
            childEl.originalBorderRadius = getComputedStyle(child).borderRadius
          }
          return {
            el: child,
            borderRadius: parseBorderRadius(childEl.originalBorderRadius),
            initialRect: createRectFromBoundingRect(
              child.getBoundingClientRect()
            )
          }
        })
    }))

    state = 'readInitial'
  }

  function readFinalAndReverse() {
    if (state !== 'readInitial') {
      throw new Error(
        'FlipView: Cannot read final values before reading initial values'
      )
    }
    parentFinalRect = view.layoutRect()
    parentDw = parentInitialRect.width / parentFinalRect.width
    parentDh = parentInitialRect.height / parentFinalRect.height
    parentDx =
      parentInitialRect.x - parentFinalRect.x - current.dragX + scrollOffset.x
    parentDy =
      parentInitialRect.y - parentFinalRect.y - current.dragY + scrollOffset.y

    parentInverseBorderRadius = calculateBorderRadiusInverse(
      view.borderRadius(),
      parentDw,
      parentDh
    )

    const tree = getParentChildTree(view.el())

    parentChildrenTreeData = parentChildrenTreeData.map(
      ({ parent, children }, i) => {
        const parentEl = tree[i].parent
        return {
          parent: {
            ...parent,
            el: parentEl,
            finalRect: getLayoutRect(parentEl)
          },
          children: children.map((child, j) => {
            const childEl = tree[i].children[j]
            let finalRect = getLayoutRect(childEl)
            if (childEl.hasAttribute('data-swapy-text')) {
              finalRect = {
                ...finalRect,
                width: child.initialRect.width,
                height: child.initialRect.height
              }
            }
            return {
              ...child,
              el: childEl,
              finalRect
            }
          })
        }
      }
    )

    const targetTransform: Omit<Transform, 'dragX' | 'dragY'> = {
      translateX: parentDx,
      translateY: parentDy,
      scaleX: parentDw,
      scaleY: parentDh
    }

    view.el().style.transformOrigin = '0 0'
    view.el().style.borderRadius = borderRadiusToString(
      parentInverseBorderRadius
    )
    view.setTransform(targetTransform)

    childrenData = []
    parentChildrenTreeData.forEach(({ parent, children }) => {
      const childData = children.map(
        ({ el, initialRect, finalRect, borderRadius }) =>
          calculateChildData(
            el,
            initialRect,
            finalRect!,
            borderRadius,
            parent.initialRect,
            parent.finalRect!
          )
      )
      childrenData.push(...childData)
    })

    state = 'readFinal'
  }

  function transitionValues(): FlipTransitionValues {
    if (state !== 'readFinal') {
      throw new Error('FlipView: Cannot get transition values before reading')
    }
    return {
      from: {
        width: parentInitialRect.width,
        height: parentInitialRect.height,
        translate: vec2(parentDx, parentDy),
        scale: vec2(parentDw, parentDh),
        borderRadius: parentInverseBorderRadius
      },
      to: {
        width: parentFinalRect.width,
        height: parentFinalRect.height,
        translate: vec2(0, 0),
        scale: vec2(1, 1),
        borderRadius: view.borderRadius()
      }
    }
  }

  function childrenTransitionData(): Array<FlipChildTransitionData> {
    if (state !== 'readFinal') {
      throw new Error(
        'FlipView: Cannot get children transition values before reading'
      )
    }
    return childrenData
  }

  return {
    readInitial,
    readFinalAndReverse,
    transitionValues,
    childrenTransitionData
  }
}

function calculateChildData(
  childEl: HTMLElement,
  childInitialRect: Rect,
  childFinalRect: Rect,
  childBorderRadius: BorderRadius,
  parentInitialRect: Rect,
  parentFinalRect: Rect
): FlipChildTransitionData {
  childEl.style.transformOrigin = '0 0'
  const parentDw = parentInitialRect.width / parentFinalRect.width
  const parentDh = parentInitialRect.height / parentFinalRect.height
  const dw = childInitialRect.width / childFinalRect.width
  const dh = childInitialRect.height / childFinalRect.height
  const fromBorderRadius = calculateBorderRadiusInverse(
    childBorderRadius,
    dw,
    dh
  )
  const initialX = childInitialRect.x - parentInitialRect.x
  const finalX = childFinalRect.x - parentFinalRect.x
  const initialY = childInitialRect.y - parentInitialRect.y
  const finalY = childFinalRect.y - parentFinalRect.y
  const fromTranslateX = (initialX - finalX * parentDw) / parentDw
  const fromTranslateY = (initialY - finalY * parentDh) / parentDh
  childEl.style.transform = `translate(${fromTranslateX}px, ${fromTranslateY}px) scale(${
    dw / parentDw
  }, ${dh / parentDh})`
  childEl.style.borderRadius = borderRadiusToString(fromBorderRadius)

  return {
    el: childEl,
    fromTranslate: vec2(fromTranslateX, fromTranslateY),
    fromScale: vec2(dw, dh),
    fromBorderRadius,
    toBorderRadius: childBorderRadius,
    parentScale: { x: parentDw, y: parentDh }
  }
}

function getParentChildTree(
  element: HTMLElement
): { parent: HTMLElement; children: HTMLElement[] }[] {
  const result: { parent: HTMLElement; children: HTMLElement[] }[] = []

  function traverse(parent: HTMLElement) {
    const children = Array.from(parent.children).filter(
      (el) => el instanceof HTMLElement
    ) as HTMLElement[]
    if (children.length > 0) {
      result.push({
        parent: parent,
        children: children
      })
      children.forEach((child) => traverse(child))
    }
  }

  traverse(element)
  return result
}
