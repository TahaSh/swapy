<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import './style.css'
import { createSwapy, SlotItemMapArray, Swapy, utils } from '../../src';

type Item = {
  id: string
  title: string
}

const initialItems: Item[] = [
  { id: '1', title: '1' },
  { id: '2', title: '2' },
  { id: '3', title: '3' },
]

const container = ref<HTMLElement | null>()
const swapy = ref<Swapy | null>(null)
const items = ref(initialItems)
const id = ref(4)

const slotItemMap = ref<SlotItemMapArray>([...utils.initSlotItemMap(items.value, 'id')])
watch(items, () =>
  utils.dynamicSwapy(swapy.value, items.value, 'id', slotItemMap.value, (value: SlotItemMapArray) => slotItemMap.value = value),
  { deep: true }
)
const slottedItems = computed(() => utils.toSlottedItems(items.value, 'id', slotItemMap.value))


onMounted(() => {
  if (container.value) {
    swapy.value = createSwapy(container.value, {
      manualSwap: true,
      // animation: 'dynamic'
      // autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    })
    swapy.value.onSwap(event => {
      requestAnimationFrame(() => {
        slotItemMap.value = event.newSlotItemMap.asArray
      })
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
    <div class="items">
      <div class="slot"
        v-for="{ slotId, itemId, item } in slottedItems"
        :key="slotId"
        :data-swapy-slot="slotId">
        <div v-if="item"
          class="item"
          :data-swapy-item="itemId"
          :key="itemId">
          <span>{{ item.title }}</span>
          <span class="delete"
            data-swapy-no-drag
            @click="() => {
              items = items.filter(i => i.id !== item.id)
            }"></span>
        </div>
      </div>
    </div>
    <div class="item item--add"
      @click="() => {
        const newItem: Item = { id: `${id}`, title: `${id}` }
        items.push(newItem)
        id++
      }">+</div>
  </div>
</template>
