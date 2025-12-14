import { ref, shallowRef } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'
type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'

export interface ToastOptions {
  message: string
  title?: string
  type?: ToastType
  position?: ToastPosition
  duration?: number
  dismissible?: boolean
}

export interface ToastItem extends ToastOptions {
  id: number
  visible: boolean
}

const toasts = ref<ToastItem[]>([])
let toastId = 0

export const useToast = () => {
  const show = (options: ToastOptions) => {
    // Only run on client side
    if (import.meta.server) return

    const id = ++toastId
    const toast: ToastItem = {
      id,
      message: options.message,
      title: options.title,
      type: options.type || 'info',
      position: options.position || 'top-right',
      duration: options.duration ?? 4000,
      dismissible: options.dismissible ?? true,
      visible: true
    }

    toasts.value.push(toast)

    // Auto dismiss
    if (toast.duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, toast.duration)
    }

    return id
  }

  const dismiss = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value[index].visible = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }

  const success = (message: string, title?: string, duration?: number) => {
    return show({ message, title, type: 'success', duration })
  }

  const error = (message: string, title?: string, duration?: number) => {
    return show({ message, title, type: 'error', duration })
  }

  const warning = (message: string, title?: string, duration?: number) => {
    return show({ message, title, type: 'warning', duration })
  }

  const info = (message: string, title?: string, duration?: number) => {
    return show({ message, title, type: 'info', duration })
  }

  const clear = () => {
    toasts.value.forEach(t => {
      t.visible = false
    })
    setTimeout(() => {
      toasts.value = []
    }, 300)
  }

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    warning,
    info,
    clear
  }
}
