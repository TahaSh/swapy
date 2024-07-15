<script>
  import './style.css'
  import A from './A.svelte'
  import C from './C.svelte'
  import D from './D.svelte'
  import { createSwapy } from '../../src/index'
  import { onMount } from 'svelte'

  const DEFAULT = {
    '1': 'a',
    '3': 'c',
    '4': 'd',
    '2': null
  }
  const slotItems = localStorage.getItem('slotItem')
    ? JSON.parse(localStorage.getItem('slotItem'))
    : DEFAULT

  let container

  onMount(() => {
    if (container) {
      const swapy = createSwapy(container)
      swapy.onSwap(({ data }) => {
        localStorage.setItem('slotItem', JSON.stringify(data.object))
      })
    }
  })

  function getItemById(itemId) {
    switch (itemId) {
      case 'a':
        return A
      case 'c':
        return C
      case 'd':
        return D
    }
  }
</script>

<div class="container" bind:this={container}>
  <div class="slot a" data-swapy-slot="1">
    <svelte:component this={getItemById(slotItems['1'])} />
  </div>
  <div class="second-row">
    <div class="slot b" data-swapy-slot="2">
      <svelte:component this={getItemById(slotItems['2'])} />
    </div>
    <div class="slot c" data-swapy-slot="3">
      <svelte:component this={getItemById(slotItems['3'])} />
    </div>
  </div>
  <div class="slot d" data-swapy-slot="4">
    <svelte:component this={getItemById(slotItems['4'])} />
  </div>
</div>
