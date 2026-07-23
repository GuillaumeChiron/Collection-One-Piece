<script setup lang="ts">
import { computed } from 'vue'
import type { Tome } from '@/types/tome'
import { sagaForNumero, type Saga } from '@/data/sagas'
import TomeCard from './TomeCard.vue'

const props = defineProps<{
  tomes: Tome[]
  editable: boolean
}>()

const emit = defineEmits<{
  'open-reservation': [tome: Tome]
}>()

const groups = computed(() => {
  const result: { saga: Saga; tomes: Tome[] }[] = []

  for (const tome of props.tomes) {
    const saga = sagaForNumero(tome.numero)
    const last = result[result.length - 1]

    if (last && last.saga.name === saga.name) {
      last.tomes.push(tome)
    } else {
      result.push({ saga, tomes: [tome] })
    }
  }

  return result
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-4 sm:px-8 sm:py-6">
    <section v-for="group in groups" :key="group.saga.name" class="mb-8 last:mb-0">
      <h3 class="mb-3 flex items-baseline gap-3 border-b border-gold/20 pb-2 font-display text-2xl text-gold">
        {{ group.saga.name }}
        <span class="font-sans text-xs font-normal text-parchment-muted">
          tomes {{ group.tomes[0]?.numero }}–{{ group.tomes[group.tomes.length - 1]?.numero }}
        </span>
      </h3>
      <TransitionGroup name="grid" tag="div" class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">
        <TomeCard
          v-for="tome in group.tomes"
          :key="tome.id"
          :tome="tome"
          :editable="editable"
          @open-reservation="emit('open-reservation', $event)"
        />
      </TransitionGroup>
    </section>

    <Transition name="fade-slide">
      <p v-if="tomes.length === 0" class="px-4 py-12 text-center text-sm text-parchment-muted">
        Aucun tome ne correspond à ta recherche.
      </p>
    </Transition>
  </div>
</template>
