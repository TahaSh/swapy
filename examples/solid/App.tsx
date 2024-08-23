/** @jsxImportSource solid-js (This line overrides `jsx` and `jsxImportSource` in tsconfig.json: https://docs.astro.build/en/guides/typescript/) */

import { onMount } from 'solid-js'
import './style.css'
import { createSwapy } from '../../src/index'

const DEFAULT = {
  '1': 'a',
  '3': 'c',
  '4': 'd',
  '2': null
}


function A() {
  return (
    <>
      <div class="item a" data-swapy-item="a">
        <div class="handle" data-swapy-handle></div>
        <div>A</div>
      </div>
    </>
  )
}

function C() {
  return (
    <>
      <div class="item c" data-swapy-item="c">
        <div>C</div>
      </div>
    </>
  )
}

function D() {
  return (
    <>
      <div class="item d" data-swapy-item="d">
        <div>D</div>
      </div>
    </>
  )
}

function getItemById(itemId: 'a' | 'c' | 'd' | null) {
  switch (itemId) {
    case 'a':
      return <A />
    case 'c':
      return <C />
    case 'd':
      return <D />
  }
}


function App() {
  const slotItems: Record<string, 'a' | 'c' | 'd' | null> = localStorage.getItem('slotItem') ? JSON.parse(localStorage.getItem('slotItem')!) : DEFAULT
  onMount(() => {
    const container = document.querySelector('.container')!
    const swapy = createSwapy(container)
    swapy.onSwap(({ data }) => {
      localStorage.setItem('slotItem', JSON.stringify(data.object))
    })
  })
  return (
    <>
      <div class="container">
        <div class="slot a" data-swapy-slot="1">
          {getItemById(slotItems['1'])}
        </div>
        <div class="second-row">
          <div class="slot b" data-swapy-slot="2">
            {getItemById(slotItems['2'])}
          </div>
          <div class="slot c" data-swapy-slot="3">
            {getItemById(slotItems['3'])}
          </div>
        </div>
        <div class="slot d" data-swapy-slot="4">
          {getItemById(slotItems['4'])}
        </div>
      </div>
    </>
  )
}

export default App
