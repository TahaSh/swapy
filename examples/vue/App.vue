<script lang="ts" setup>
import './style.css'
import A from './A.vue'
import C from './C.vue'
import D from './D.vue'
import { createSwapy } from '../../src/index'
import { onMounted, ref } from 'vue'

const DEFAULT = {
  '1': 'a',
  '3': 'c',
  '4': 'd',
  '2': null
}
const slotItems: Record<string, 'a' | 'c' | 'd' | null> = localStorage.getItem('slotItem') ? JSON.parse(localStorage.getItem('slotItem')!) : DEFAULT

const container = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (container.value) {
    const swapy = createSwapy(container.value)
    swapy.onSwap(({ data }) => {
      localStorage.setItem('slotItem', JSON.stringify(data.object))
    })
  }
})

function getItemById(itemId: 'a' | 'c' | 'd' | null) {
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

<template>
  <div class="container"
    ref="container">
    <div class="slot a"
      data-swapy-slot="1">
      <component :is="getItemById(slotItems['1'])" />
    </div>
    <div class="second-row">
      <div class="slot b"
        data-swapy-slot="2">
        <component :is="getItemById(slotItems['2'])" />
      </div>
      <div class="slot c"
        data-swapy-slot="3">
        <component :is="getItemById(slotItems['3'])" />
      </div>
    </div>
    <div class="slot d"
      data-swapy-slot="4">
      <component :is="getItemById(slotItems['4'])" />
    </div>
  </div>
</template>
