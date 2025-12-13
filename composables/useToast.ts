import { createApp, h, ref } from 'vue'
import Toast from '~/components/Toast.vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  message: string
  title?: string
  type?: ToastType
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
  duration?: number
  dismissible?: boolean
}

const activeToasts = ref<Array<{ id: number; container: HTMLElement }>>([])
let toastId = 0

export const useToast = () => {
  const show = (options: ToastOptions) => {
    const id = ++toastId
    const container = document.createElement('div')
    document.body.appendChild(container)

    const app = createApp({
      setup() {
        const handleClose = () => {
          setTimeout(() => {
            app.unmount()
            document.body.removeChild(container)
            activeToasts.value = activeToasts.value.filter(t => t.id !== id)
          }, 300)
        }

        return () => h(Toast, {
          ...options,
          onClose: handleClose
        })
      }
    })

    app.mount(container)
    activeToasts.value.push({ id, container })
  }

  const success = (message: string, title?: string, duration?: number) => {
    show({ message, title, type: 'success', duration })
  }

  const error = (message: string, title?: string, duration?: number) => {
    show({ message, title, type: 'error', duration })
  }

  const warning = (message: string, title?: string, duration?: number) => {
    show({ message, title, type: 'warning', duration })
  }

  const info = (message: string, title?: string, duration?: number) => {
    show({ message, title, type: 'info', duration })
  }

  const clear = () => {
    activeToasts.value.forEach(({ container }) => {
      if (container.parentNode) {
        document.body.removeChild(container)
      }
    })
    activeToasts.value = []
  }

  return {
    show,
    success,
    error,
    warning,
    info,
    clear
  }
}
