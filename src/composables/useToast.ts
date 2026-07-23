import { useToastStore } from '@/stores/toastStore'

export function useToast() {
  const store = useToastStore()

  return {
    success: (message: string) => store.push(message, 'success', 3500),
    error: (message: string) => store.push(message, 'error', 6000),
    info: (message: string) => store.push(message, 'info', 3500),
  }
}
