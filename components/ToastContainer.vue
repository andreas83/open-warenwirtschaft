<template>
  <Teleport to="body">
    <div class="fixed z-50 pointer-events-none inset-0">
      <!-- Top Right -->
      <div class="absolute top-4 right-4 flex flex-col gap-2 items-end">
        <TransitionGroup name="toast-slide">
          <div
            v-for="toast in topRightToasts"
            :key="toast.id"
            class="pointer-events-auto"
          >
            <Toast
              :message="toast.message"
              :title="toast.title"
              :type="toast.type"
              :dismissible="toast.dismissible"
              :visible="toast.visible"
              @close="dismiss(toast.id)"
            />
          </div>
        </TransitionGroup>
      </div>

      <!-- Top Center -->
      <div class="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center">
        <TransitionGroup name="toast-slide">
          <div
            v-for="toast in topCenterToasts"
            :key="toast.id"
            class="pointer-events-auto"
          >
            <Toast
              :message="toast.message"
              :title="toast.title"
              :type="toast.type"
              :dismissible="toast.dismissible"
              :visible="toast.visible"
              @close="dismiss(toast.id)"
            />
          </div>
        </TransitionGroup>
      </div>

      <!-- Bottom Right -->
      <div class="absolute bottom-4 right-4 flex flex-col-reverse gap-2 items-end">
        <TransitionGroup name="toast-slide-up">
          <div
            v-for="toast in bottomRightToasts"
            :key="toast.id"
            class="pointer-events-auto"
          >
            <Toast
              :message="toast.message"
              :title="toast.title"
              :type="toast.type"
              :dismissible="toast.dismissible"
              :visible="toast.visible"
              @close="dismiss(toast.id)"
            />
          </div>
        </TransitionGroup>
      </div>

      <!-- Bottom Center -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-2 items-center">
        <TransitionGroup name="toast-slide-up">
          <div
            v-for="toast in bottomCenterToasts"
            :key="toast.id"
            class="pointer-events-auto"
          >
            <Toast
              :message="toast.message"
              :title="toast.title"
              :type="toast.type"
              :dismissible="toast.dismissible"
              :visible="toast.visible"
              @close="dismiss(toast.id)"
            />
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToast()

const topRightToasts = computed(() =>
  toasts.value.filter(t => t.position === 'top-right')
)

const topCenterToasts = computed(() =>
  toasts.value.filter(t => t.position === 'top-center')
)

const bottomRightToasts = computed(() =>
  toasts.value.filter(t => t.position === 'bottom-right')
)

const bottomCenterToasts = computed(() =>
  toasts.value.filter(t => t.position === 'bottom-center')
)
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active,
.toast-slide-up-enter-active,
.toast-slide-up-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.toast-slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
