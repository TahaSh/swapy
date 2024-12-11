import { SlotItemMapArray, Swapy } from '.'

export type SlottedItems<Item> = Array<{
  slotId: string
  itemId: string
  item: Item | null
}>

export function toSlottedItems<Item>(
  items: Array<Item>,
  idField: keyof Item,
  slotItemMap: SlotItemMapArray
): SlottedItems<Item> {
  return slotItemMap.map((slotItem) => ({
    slotId: slotItem.slot,
    itemId: slotItem.item,
    item:
      slotItem.item === ''
        ? null
        : items.find((item) => slotItem.item === item[idField])!
  }))
}

export function initSlotItemMap<Item>(
  items: Array<Item>,
  idField: keyof Item
): SlotItemMapArray {
  return items.map((item) => ({
    item: item[idField] as string,
    slot: item[idField] as string
  }))
}

export function dynamicSwapy<Item>(
  swapy: Swapy | null,
  items: Array<Item>,
  idField: keyof Item,
  slotItemMap: SlotItemMapArray,
  setSlotItemMap: (slotItemMap: SlotItemMapArray) => void,
  removeItemOnly = false
) {
  // Get the newly added items and convert them to slotItem objects
  const newItems: SlotItemMapArray = items
    .filter(
      (item) => !slotItemMap.some((slotItem) => slotItem.item === item[idField])
    )
    .map((item) => ({
      slot: item[idField] as string,
      item: item[idField] as string
    }))

  let withoutRemovedItems: SlotItemMapArray

  // Remove slot and item
  if (!removeItemOnly) {
    withoutRemovedItems = slotItemMap.filter(
      (slotItem) =>
        items.some((item) => item[idField] === slotItem.item) || !slotItem.item
    )
  } else {
    withoutRemovedItems = slotItemMap.map((slotItem) => {
      if (!items.some((item) => item[idField] === slotItem.item)) {
        return { slot: slotItem.slot as string, item: '' }
      }
      return slotItem
    })
  }

  const updatedSlotItemsMap: SlotItemMapArray = [
    ...withoutRemovedItems,
    ...newItems
  ]

  setSlotItemMap(updatedSlotItemsMap)

  if (
    newItems.length > 0 ||
    withoutRemovedItems.length !== slotItemMap.length
  ) {
    requestAnimationFrame(() => {
      swapy?.update()
    })
  }
}
