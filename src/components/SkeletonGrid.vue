<template>
  <div class="mx-auto max-w-6xl px-4 py-4 sm:px-8 sm:py-6">
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">
      <div
        v-for="n in 12"
        :key="n"
        class="flex animate-pulse flex-col gap-2 rounded-lg border border-ink-border bg-ink-surface/60 p-3"
      >
        <div class="aspect-2/3 w-full rounded-md bg-ink-border/60"></div>
        <div class="h-3 w-3/4 rounded bg-ink-border/60"></div>
        <div class="h-6 w-full rounded-full bg-ink-border/60"></div>
      </div>
    </div>
  </div>
</template>
