import { createSwapy } from '../../src'

const container = document.querySelector('.container') as HTMLElement

const swapy = createSwapy(container, {
  animation: 'dynamic'
  // swapMode: 'drop',
  // autoScrollOnDrag: true,
  // enabled: true,
  // dragAxis: 'x',
  // dragOnHold: true
})

// swapy.enable(false)
// swapy.destroy()
// console.log(swapy.slotItemMap())

swapy.onBeforeSwap((event) => {
  console.log('beforeSwap', event)
  // This is for dynamically enabling and disabling swapping.
  // Return true to allow swapping, and return false to prevent swapping.
  return true
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
