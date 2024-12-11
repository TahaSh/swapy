<script lang="ts">
  import { createSwapy, type Swapy } from '../../src'
  import { onDestroy, onMount } from 'svelte'
  import './style.css'
  let container: HTMLElement
  let swapy: Swapy | null = null

  onMount(() => {
    if (container) {
      swapy = createSwapy(container, {
        // animation: 'dynamic'
        // autoScrollOnDrag: true,
        // swapMode: 'drop',
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
        console.log('end', event)
      })
    }
  })

  onDestroy(() => {
    swapy?.destroy()
  })
</script>

<div class="container" bind:this={container}>
  <div class="slot top" data-swapy-slot="a">
    <div class="item item-a" data-swapy-item="a">
      <div data-swapy-no-drag>A</div>
    </div>
  </div>
  <div class="middle">
    <div class="slot middle-left" data-swapy-slot="b">
      <div class="item item-b" data-swapy-item="b">
        <div class="handle" data-swapy-handle></div>
        <div>B</div>
      </div>
    </div>
    <div class="slot middle-right" data-swapy-slot="c"></div>
  </div>
  <div class="slot bottom" data-swapy-slot="d">
    <div class="item item-d" data-swapy-item="d">
      <div>D</div>
    </div>
  </div>
</div>
