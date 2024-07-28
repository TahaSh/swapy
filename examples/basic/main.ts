import './style.css'
import { createSwapy } from '../../src'

const container = document.querySelector('.container-1')!
const container2 = document.querySelector('.container-2')!
const enableInput = document.querySelector('#enable')! as HTMLInputElement

const swapy = createSwapy(container, {
  animation: 'dynamic',
  continuousMode: false
})

const swapy2 = createSwapy(container2, {
  animation: 'spring',
  continuousMode: true
})

swapy2.onSwap((event) => {
  console.log('swapy2 event', event.data)
})

swapy.enable(false)
swapy.onSwap((event) => {
  console.log('event.map', event.data.map)
  console.log('event.object', event.data.object)
  console.log('event.array', event.data.array)
})

enableInput.addEventListener('input', () => {
  swapy.enable(enableInput.checked)
})
