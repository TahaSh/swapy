import { useEffect } from 'react'
import './style.css'
import { createSwapy, SlotItemMap, Swapy } from '../../src/index'
import { useState } from 'react'
import { useMemo } from 'react'
import { useRef } from 'react'

function App() {
  const swapyRef = useRef<Swapy | null>(null)

  // Your items.
  const [items, setItems] = useState([
    { id: '1', title: 'A' },
    { id: '2', title: 'B' },
    { id: '3', title: 'C' },
  ])

  // Define a state for maintain the mapping between slots and items.
  const [slotItemsMap, setSlotItemsMap] = useState<SlotItemMap>([...items.map(item => ({
    slotId: item.id,
    itemId: item.id
  })),
  // Defining an empty slot by setting itemId to null.
  { slotId: `${Math.round(Math.random() * 99999)}`, itemId: null }
  ])

  // This is what you'll use to display your items.
  const slottedItems = useMemo(() => slotItemsMap.map(({ slotId, itemId }) => ({
    slotId,
    itemId,
    item: items.find(item => item.id === itemId)
  })), [items, slotItemsMap])

  useEffect(() => {
    // Get the newly added items and convert them to slotItem objects
    const newItems = items.filter(item => !slotItemsMap.some(slotItem => slotItem.itemId === item.id)).map(item => ({
      slotId: item.id,
      itemId: item.id
    }))

    // Remove items from slotItemsMap if they no longer exist in items
    const withoutRemovedItems = slotItemsMap.filter(slotItem =>
      items.some(item => item.id === slotItem.itemId) || !slotItem.itemId
    )

    /******* Below is how you would remove items and keep their slots empty ******/
    // const withoutRemovedItems = slotItemsMap.map(slotItem => {
    //   if (!items.some(item => item.id === slotItem.itemId)) {
    //     return { slotId: slotItem.slotId, itemId: null }
    //   }
    //   return slotItem
    // })

    const updatedSlotItemsMap = [...withoutRemovedItems, ...newItems]

    setSlotItemsMap(updatedSlotItemsMap)
    swapyRef.current?.setData({ array: updatedSlotItemsMap })
  }, [items])

  useEffect(() => {
    const container = document.querySelector('.container')!
    swapyRef.current = createSwapy(container, {
      manualSwap: true,
      swapMode: 'hover',
      autoScrollOnDrag: true
    })

    swapyRef.current.onSwap(({ data }) => {
      // You need to call setData because it's a manualSwap instance
      swapyRef.current?.setData({ array: data.array })
      setSlotItemsMap(data.array)
    })

    return () => {
      swapyRef.current?.destroy()
    }
  }, [])

  return (
    <div className='app'>

      {/* ADD BUTTON */}
      <button className='add' onClick={() => {
        const id = `${Math.round(Math.random() * 99999)}`
        const updatedItems = [...items, { id, title: id }]
        setItems(updatedItems)
      }}>Add</button>

      <div className="container">
        {slottedItems.map(({ itemId, slotId, item }) => (
          <div className="slot" data-swapy-slot={slotId} key={slotId}>

            {/* ITEM */}
            {item ?
              <div className="item" data-swapy-item={itemId} key={itemId}>
                <div className="handle" data-swapy-handle></div>
                <div>{item.title}</div>

                {/* DELETE ITEM BUTTON */}
                <button className='delete'
                  onClick={() => {
                    const updatedItems = items.filter(i => i.id !== item.id)
                    setItems(updatedItems)
                  }}>x</button>

              </div>
              : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
