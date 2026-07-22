<script setup lang="ts">
import type { Tome } from '@/types/tome'
import TomeCard from './TomeCard.vue'

defineProps<{
  tomes: Tome[]
  editable: boolean
}>()

const emit = defineEmits<{
  'open-reservation': [tome: Tome]
}>()
</script>

<template>
  <section class="mx-auto grid max-w-6xl grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:gap-5 sm:p-6 md:grid-cols-4 lg:grid-cols-6">
    <TomeCard
      v-for="tome in tomes"
      :key="tome.id"
      :tome="tome"
      :editable="editable"
      @open-reservation="emit('open-reservation', $event)"
    />
  </section>
</template>
