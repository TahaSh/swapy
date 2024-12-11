<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import './style.css'
import { createSwapy, Swapy } from '../../src';

const swapy = ref<Swapy | null>(null)
const container = ref<HTMLElement | null>()

onMounted(() => {
  if (container.value) {
    swapy.value = createSwapy(container.value, {
      // animation: 'dynamic'
      // autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    })

    // swapy.value.enable(false)
    // swapy.value.destroy()
    // console.log(swapy.value.slotItemMap())

    swapy.value.onBeforeSwap((event) => {
      console.log('beforeSwap', event)
      // This is for dynamically enabling and disabling swapping.
      // Return true to allow swapping, and return false to prevent swapping.
      return true
    })

    swapy.value.onSwapStart(event => {
      console.log('start', event)
    })

    swapy.value.onSwap(event => {
      console.log('swap', event)
    })

    swapy.value.onSwapEnd(event => {
      console.log('end', event)
    })
  }
})

onUnmounted(() => {
  swapy.value?.destroy()
})
</script>

<template>
  <div class="container"
    ref="container">
    <div class="slot top"
      data-swapy-slot="a">
      <div class="item item-a"
        data-swapy-item="a">
        <div data-swapy-no-drag>A</div>
      </div>
    </div>
    <div class="middle">
      <div class="slot middle-left"
        data-swapy-slot="b">
        <div class="item item-b"
          data-swapy-item="b">
          <div class="handle"
            data-swapy-handle></div>
          <div>B</div>
        </div>
      </div>
      <div class="slot middle-right"
        data-swapy-slot="c">
      </div>
    </div>
    <div class="slot bottom"
      data-swapy-slot="d">
      <div class="item item-d"
        data-swapy-item="d">
        <div>D</div>
      </div>
    </div>
  </div>
</template>
