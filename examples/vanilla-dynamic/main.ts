import { createSwapy } from '../../src'

const container = document.querySelector('.container') as HTMLElement

const swapy = createSwapy(container, {
  animation: 'spring'
  // swapMode: 'drop',
  // autoScrollOnDrag: true,
  // enabled: true,
  // dragAxis: 'x',
  // dragOnHold: true
})

swapy.onSwapStart((event) => {
  console.log('start', event)
})

swapy.onSwap((event) => {
  console.log('swap', event)
})

swapy.onSwapEnd((event) => {
  console.log('swap end:', event)
})

let id = 5

const items = document.querySelector('.items')!

const addButton = document.querySelector('.item--add')!
addButton.addEventListener('click', () => {
  const newSlot = document.createElement('div')
  newSlot.classList.add('slot')
  newSlot.dataset.swapySlot = `${id}`

  const newItem = document.createElement('div')
  newItem.classList.add('item')
  newItem.dataset.swapyItem = `${id}`
  const span = document.createElement('span')
  span.textContent = `${id}`
  newItem.appendChild(span)
  const deleteItem = document.createElement('span')
  deleteItem.classList.add('delete')
  deleteItem.dataset.swapyNoDrag = ''
  newItem.appendChild(deleteItem)

  newSlot.appendChild(newItem)
  items.appendChild(newSlot)
  id++

  swapy.update()
})

document.body.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('delete')) {
    const slot = target.closest('.slot') as HTMLElement
    slot.remove()
  }
})
