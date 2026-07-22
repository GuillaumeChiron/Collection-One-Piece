<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCollectionStore } from '@/stores/collectionStore'
import ProgressHeader from './ProgressHeader.vue'
import CollectionGrid from './CollectionGrid.vue'

const authStore = useAuthStore()
const collectionStore = useCollectionStore()

const email = ref('')
const password = ref('')
const loginError = ref<string | null>(null)
const loggingIn = ref(false)

let subscribed = false

function loadCollection() {
  if (subscribed) return
  subscribed = true
  collectionStore.fetchTomes()
  collectionStore.subscribeRealtime()
}

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) loadCollection()
  },
  { immediate: true },
)

onUnmounted(() => {
  collectionStore.unsubscribeRealtime()
})

async function handleLogin() {
  loggingIn.value = true
  loginError.value = null
  const error = await authStore.signIn(email.value, password.value)
  loggingIn.value = false
  if (error) {
    loginError.value = error.message
  }
}

function handleLogout() {
  authStore.signOut()
}
</script>

<template>
  <div v-if="authStore.loading" class="flex min-h-screen items-center justify-center text-parchment-muted">
    Chargement...
  </div>

  <form
    v-else-if="!authStore.isAuthenticated"
    @submit.prevent="handleLogin"
    class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4"
  >
    <h1 class="text-center font-display text-4xl text-gold">Connexion collectionneur</h1>
    <label class="flex flex-col gap-1 text-sm text-parchment-muted">
      Email
      <input
        v-model="email"
        type="email"
        required
        class="rounded-md border border-ink-border bg-ink-surface px-3 py-2 text-parchment outline-none focus:border-gold"
      />
    </label>
    <label class="flex flex-col gap-1 text-sm text-parchment-muted">
      Mot de passe
      <input
        v-model="password"
        type="password"
        required
        class="rounded-md border border-ink-border bg-ink-surface px-3 py-2 text-parchment outline-none focus:border-gold"
      />
    </label>
    <button
      type="submit"
      :disabled="loggingIn"
      class="rounded-md bg-gold px-4 py-2 font-semibold text-ink transition-colors hover:bg-gold-light disabled:opacity-50"
    >
      Se connecter
    </button>
    <p v-if="loginError" class="text-center text-sm text-crimson-light">{{ loginError }}</p>
  </form>

  <div v-else class="min-h-screen">
    <div class="flex justify-end px-4 pt-4 sm:px-8">
      <button
        type="button"
        @click="handleLogout"
        class="rounded-full border border-crimson px-4 py-1.5 text-sm text-crimson-light transition-colors hover:bg-crimson hover:text-parchment"
      >
        Se déconnecter
      </button>
    </div>
    <ProgressHeader />
    <CollectionGrid :tomes="collectionStore.tomes" :editable="true" />
  </div>
</template>
