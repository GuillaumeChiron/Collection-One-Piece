<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const success = ref(false)

async function handleSubmit() {
  errorMessage.value = null

  if (password.value.length < 6) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  submitting.value = true
  const error = await authStore.updatePassword(password.value)
  submitting.value = false

  if (error) {
    errorMessage.value = error.message
  } else {
    success.value = true
    setTimeout(() => router.replace('/admin'), 2000)
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-6">
    <div v-if="authStore.loading" class="text-parchment-muted">Chargement...</div>

    <form
      v-else-if="authStore.isAuthenticated && !success"
      @submit.prevent="handleSubmit"
      class="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl bg-linear-to-b from-ink-surface to-ink px-6 py-8 shadow-panel"
    >
      <h1 class="text-center font-display text-3xl text-gold">Nouveau mot de passe</h1>
      <label class="flex flex-col gap-1 text-sm text-parchment-muted">
        Nouveau mot de passe
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          class="rounded-md border border-ink-border bg-ink-surface px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm text-parchment-muted">
        Confirmer le mot de passe
        <input
          v-model="confirmPassword"
          type="password"
          required
          minlength="6"
          class="rounded-md border border-ink-border bg-ink-surface px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </label>
      <button
        type="submit"
        :disabled="submitting"
        class="rounded-md bg-gold px-4 py-2 font-semibold text-ink transition-colors active:scale-[0.97] hover:bg-gold-light disabled:opacity-50"
      >
        Valider
      </button>
      <p v-if="errorMessage" class="text-center text-sm text-crimson-light">{{ errorMessage }}</p>
    </form>

    <div
      v-else-if="success"
      class="mx-auto flex w-full max-w-sm flex-col items-center gap-4 rounded-xl bg-linear-to-b from-ink-surface to-ink px-6 py-8 text-center shadow-panel"
    >
      <h1 class="font-display text-3xl text-gold">Mot de passe mis à jour</h1>
      <p class="text-sm text-parchment-muted">Redirection vers l'espace admin...</p>
    </div>

    <div
      v-else
      class="mx-auto flex w-full max-w-sm flex-col items-center gap-4 rounded-xl bg-linear-to-b from-ink-surface to-ink px-6 py-8 text-center shadow-panel"
    >
      <h1 class="font-display text-3xl text-gold">Lien invalide ou expiré</h1>
      <p class="text-sm text-parchment-muted">
        Ce lien de réinitialisation n'est plus valable. Redemande un nouvel email depuis la page de connexion.
      </p>
      <RouterLink to="/admin" class="text-sm text-gold hover:text-gold-light">Retour à la connexion</RouterLink>
    </div>
  </div>
</template>
