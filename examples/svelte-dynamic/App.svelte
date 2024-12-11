<script lang="ts">
  import {
    createSwapy,
    type SlotItemMapArray,
    type Swapy,
    utils
  } from '../../src'
  import { onDestroy, onMount, untrack } from 'svelte'
  import './style.css'

  let container: HTMLElement
  let swapy: Swapy | null = null

  type Item = {
    id: string
    title: string
  }

  const initialItems: Item[] = [
    { id: '1', title: '1' },
    { id: '2', title: '2' },
    { id: '3', title: '3' }
  ]

  let items = $state(initialItems)
  let id = $state(4)

  let slotItemMap = $state(utils.initSlotItemMap(initialItems, 'id'))
  let slottedItems = $derived(utils.toSlottedItems(items, 'id', slotItemMap))

  let setSlotItemMap = (value: SlotItemMapArray) => (slotItemMap = value)

  $effect(() => {
    utils.dynamicSwapy(
      swapy,
      items,
      'id',
      untrack(() => slotItemMap),
      setSlotItemMap
    )
  })

  onMount(() => {
    if (container) {
      swapy = createSwapy(container, {
        manualSwap: true
        // animation: 'dynamic'
        // autoScrollOnDrag: true,
        // swapMode: 'drop',
        // enabled: true,
        // dragAxis: 'x',
        // dragOnHold: true
      })

      swapy.onSwapStart((event) => {
        console.log('start', event)
      })

      swapy.onSwap((event) => {
        requestAnimationFrame(() => {
          slotItemMap = event.newSlotItemMap.asArray
        })
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
  <div class="items">
    {#each slottedItems as { slotId, itemId, item }}
      {#key slotId}
        <div class="slot" data-swapy-slot={slotId}>
          {#if item}
            {#key itemId}
              <div class="item" data-swapy-item={itemId}>
                <span>{item.title}</span>
                <button
                  aria-label="delete"
                  class="delete"
                  data-swapy-no-drag
                  onclick={() => {
                    items = items.filter((i) => i.id !== item.id)
                  }}
                ></button>
              </div>
            {/key}
          {/if}
        </div>
      {/key}
    {/each}
  </div>
  <button
    class="item item--add"
    onclick={() => {
      const newItem: Item = { id: `${id}`, title: `${id}` }
      items.push(newItem)
      id++
    }}>+</button
  >
</div>
