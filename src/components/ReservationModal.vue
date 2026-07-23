<script setup lang="ts">
import { ref, watch } from 'vue'
import { useReservationStore } from '@/stores/reservationStore'
import { useToast } from '@/composables/useToast'
import type { Tome } from '@/types/tome'

const props = defineProps<{
  tome: Tome | null
}>()

const emit = defineEmits<{
  close: []
}>()

const reservationStore = useReservationStore()
const toast = useToast()
const guestName = ref('')
const submitting = ref(false)
const succeeded = ref(false)

watch(
  () => props.tome,
  () => {
    guestName.value = ''
    succeeded.value = false
  },
)

async function confirmReservation() {
  if (!props.tome || !guestName.value.trim()) return

  submitting.value = true
  const result = await reservationStore.reserveTome(props.tome.id, guestName.value.trim())
  submitting.value = false

  if (result) {
    succeeded.value = true
    toast.success(`Tome ${props.tome.numero} réservé !`)
    await new Promise((resolve) => setTimeout(resolve, 700))
    emit('close')
  }
}

function cancel() {
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="tome" role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4 backdrop-blur-sm">
      <div class="modal-panel w-full max-w-sm rounded-xl border border-ink-border bg-ink-surface p-6 shadow-modal">
        <Transition name="fade-slide" mode="out-in">
          <div v-if="succeeded" key="success" class="flex flex-col items-center gap-3 py-6 text-center">
            <span class="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/40">
              <svg class="h-7 w-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p class="font-display text-2xl text-gold">Réservé avec succès</p>
            <p class="text-sm text-parchment-muted">Merci {{ guestName }} !</p>
          </div>

          <div v-else key="form">
            <h2 class="font-display text-2xl text-gold">Réserver le tome {{ tome.numero }}</h2>
            <form @submit.prevent="confirmReservation" class="mt-4 flex flex-col gap-4">
              <label class="flex flex-col gap-1 text-sm text-parchment-muted">
                Votre prénom
                <input
                  v-model="guestName"
                  type="text"
                  required
                  class="rounded-md border border-ink-border bg-ink px-3 py-2 text-parchment outline-none focus:border-gold"
                />
              </label>
              <div class="flex gap-3">
                <button
                  type="submit"
                  :disabled="submitting"
                  class="flex-1 rounded-md bg-gold px-4 py-2 font-semibold text-ink transition-colors active:scale-[0.97] hover:bg-gold-light disabled:opacity-50"
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  @click="cancel"
                  class="flex-1 rounded-md border border-ink-border px-4 py-2 text-parchment-muted transition-colors active:scale-[0.97] hover:border-crimson hover:text-crimson-light"
                >
                  Annuler
                </button>
              </div>
            </form>
            <p v-if="reservationStore.error" class="mt-3 text-sm text-crimson-light">{{ reservationStore.error }}</p>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>
