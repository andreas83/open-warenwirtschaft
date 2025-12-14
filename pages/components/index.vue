<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('components.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ $t('components.description') }}
        </p>
      </div>

      <!-- Table of Contents -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {{ $t('components.tableOfContents') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <div :class="section.icon" class="w-5 h-5" />
            {{ section.title }}
          </a>
        </div>
      </div>

      <!-- Components Sections -->
      <div class="space-y-12">
        <!-- Form Components -->
        <ComponentSection
          id="form-components"
          :title="$t('components.sections.formComponents')"
          icon="i-mdi-form-textbox"
        >
          <!-- FormInput -->
          <ComponentDemo
            :title="$t('components.formInput.title')"
            :description="$t('components.formInput.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <FormInput
                  v-model="formInputDemo.basic"
                  :label="$t('components.formInput.examples.basic')"
                  placeholder="Enter text..."
                />
                <FormInput
                  v-model="formInputDemo.required"
                  :label="$t('components.formInput.examples.required')"
                  placeholder="This field is required"
                  required
                />
                <FormInput
                  v-model="formInputDemo.withHint"
                  :label="$t('components.formInput.examples.withHint')"
                  hint="This is a helpful hint"
                />
                <FormInput
                  v-model="formInputDemo.withError"
                  :label="$t('components.formInput.examples.withError')"
                  error="This field has an error"
                />
                <FormInput
                  v-model="formInputDemo.disabled"
                  :label="$t('components.formInput.examples.disabled')"
                  disabled
                />
                <FormInput
                  v-model="formInputDemo.number"
                  type="number"
                  :label="$t('components.formInput.examples.number')"
                  :min="0"
                  :max="100"
                  :step="1"
                />
              </div>
            </template>
            <template #code>
&lt;FormInput
  v-model="value"
  label="Label"
  placeholder="Placeholder text"
  :required="true"
  :disabled="false"
  hint="Optional hint text"
  error="Optional error message"
  type="text"
  :min="0"
  :max="100"
  :step="1"
/&gt;
            </template>
          </ComponentDemo>

          <!-- FormTextarea -->
          <ComponentDemo
            :title="$t('components.formTextarea.title')"
            :description="$t('components.formTextarea.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <FormTextarea
                  v-model="formTextareaDemo.basic"
                  :label="$t('components.formTextarea.examples.basic')"
                  placeholder="Enter multi-line text..."
                />
                <FormTextarea
                  v-model="formTextareaDemo.withMaxLength"
                  :label="$t('components.formTextarea.examples.withMaxLength')"
                  :max-length="200"
                  placeholder="Maximum 200 characters"
                />
                <FormTextarea
                  v-model="formTextareaDemo.customRows"
                  :label="$t('components.formTextarea.examples.customRows')"
                  :rows="6"
                />
              </div>
            </template>
            <template #code>
&lt;FormTextarea
  v-model="value"
  label="Label"
  placeholder="Placeholder text"
  :rows="4"
  :max-length="200"
  :required="true"
  hint="Optional hint"
/&gt;
            </template>
          </ComponentDemo>

          <!-- FormSelect -->
          <ComponentDemo
            title="FormSelect"
            description="A customizable select dropdown component with consistent styling, validation, and error handling."
          >
            <template #preview>
              <div class="space-y-4">
                <FormSelect
                  v-model="formSelectDemo.basic"
                  label="Basic Select"
                  :options="['Option 1', 'Option 2', 'Option 3']"
                  placeholder="Choose an option"
                />
                <FormSelect
                  v-model="formSelectDemo.withObjects"
                  label="Select with Objects"
                  :options="selectOptions"
                  value-key="id"
                  label-key="name"
                  placeholder="Select a country"
                />
                <FormSelect
                  v-model="formSelectDemo.required"
                  label="Required Select"
                  :options="['Yes', 'No', 'Maybe']"
                  required
                  placeholder="This field is required"
                />
                <FormSelect
                  v-model="formSelectDemo.withError"
                  label="Select with Error"
                  :options="['Option A', 'Option B']"
                  error="Please select a valid option"
                />
              </div>
            </template>
            <template #code>
&lt;FormSelect
  v-model="value"
  label="Label"
  :options="options"
  value-key="id"
  label-key="name"
  placeholder="Select an option"
  :required="true"
  hint="Optional hint"
  error="Optional error"
/&gt;
            </template>
          </ComponentDemo>
        </ComponentSection>

        <!-- Button Components -->
        <ComponentSection
          id="button-components"
          :title="$t('components.sections.buttonComponents')"
          icon="i-mdi-gesture-tap-button"
        >
          <!-- LoadingButton -->
          <ComponentDemo
            :title="$t('components.loadingButton.title')"
            :description="$t('components.loadingButton.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <div class="flex flex-wrap gap-3">
                  <LoadingButton variant="primary">
                    {{ $t('components.loadingButton.examples.primary') }}
                  </LoadingButton>
                  <LoadingButton variant="secondary">
                    {{ $t('components.loadingButton.examples.secondary') }}
                  </LoadingButton>
                  <LoadingButton variant="danger">
                    {{ $t('components.loadingButton.examples.danger') }}
                  </LoadingButton>
                  <LoadingButton variant="success">
                    {{ $t('components.loadingButton.examples.success') }}
                  </LoadingButton>
                </div>
                <div class="flex flex-wrap gap-3">
                  <LoadingButton size="sm">{{ $t('components.loadingButton.examples.small') }}</LoadingButton>
                  <LoadingButton size="md">{{ $t('components.loadingButton.examples.medium') }}</LoadingButton>
                  <LoadingButton size="lg">{{ $t('components.loadingButton.examples.large') }}</LoadingButton>
                </div>
                <div class="flex flex-wrap gap-3">
                  <LoadingButton icon="i-mdi-check">{{ $t('components.loadingButton.examples.withIcon') }}</LoadingButton>
                  <LoadingButton :loading="true">{{ $t('components.loadingButton.examples.loading') }}</LoadingButton>
                  <LoadingButton disabled>{{ $t('components.loadingButton.examples.disabled') }}</LoadingButton>
                </div>
              </div>
            </template>
            <template #code>
&lt;LoadingButton
  variant="primary|secondary|danger|success"
  size="sm|md|lg"
  :loading="false"
  :disabled="false"
  icon="i-mdi-check"
  @click="handleClick"
&gt;
  Button Text
&lt;/LoadingButton&gt;
            </template>
          </ComponentDemo>
        </ComponentSection>

        <!-- Layout Components -->
        <ComponentSection
          id="layout-components"
          title="Layout Components"
          icon="i-mdi-view-dashboard"
        >
          <!-- Card -->
          <ComponentDemo
            title="Card"
            description="A flexible container component for grouping related content with header and footer support."
          >
            <template #preview>
              <div class="space-y-4">
                <Card title="Default Card">
                  <p class="text-gray-600 dark:text-gray-400">This is a card with default styling and medium padding.</p>
                </Card>
                <Card variant="bordered" padding="lg">
                  <template #header>
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold">Custom Header</h3>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </template>
                  <p class="text-gray-600 dark:text-gray-400">This is a bordered card with large padding and custom header.</p>
                  <template #footer>
                    <div class="flex justify-end gap-2">
                      <LoadingButton size="sm" variant="secondary">Cancel</LoadingButton>
                      <LoadingButton size="sm">Save</LoadingButton>
                    </div>
                  </template>
                </Card>
                <Card variant="elevated" hoverable>
                  <p class="text-gray-600 dark:text-gray-400">This is an elevated card with hover effect.</p>
                </Card>
              </div>
            </template>
            <template #code>
&lt;Card
  title="Card Title"
  variant="default|bordered|elevated"
  padding="none|sm|md|lg"
  :hoverable="false"
&gt;
  Card content
  &lt;template #header&gt;Custom header&lt;/template&gt;
  &lt;template #footer&gt;Custom footer&lt;/template&gt;
&lt;/Card&gt;
            </template>
          </ComponentDemo>
        </ComponentSection>

        <!-- Feedback Components -->
        <ComponentSection
          id="feedback-components"
          :title="$t('components.sections.feedbackComponents')"
          icon="i-mdi-message-alert"
        >
          <!-- LoadingSpinner -->
          <ComponentDemo
            :title="$t('components.loadingSpinner.title')"
            :description="$t('components.loadingSpinner.description')"
          >
            <template #preview>
              <div class="space-y-6">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ $t('components.loadingSpinner.examples.sizes') }}</p>
                  <div class="flex items-end gap-6">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                    <LoadingSpinner size="xl" />
                  </div>
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ $t('components.loadingSpinner.examples.withText') }}</p>
                  <LoadingSpinner :text="$t('components.loadingSpinner.examples.loadingText')" />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ $t('components.loadingSpinner.examples.centered') }}</p>
                  <div class="border border-gray-300 dark:border-gray-600 rounded">
                    <LoadingSpinner center :text="$t('components.loadingSpinner.examples.centeredText')" />
                  </div>
                </div>
              </div>
            </template>
            <template #code>
&lt;LoadingSpinner
  size="sm|md|lg|xl"
  text="Loading message..."
  :center="true"
  :overlay="false"
/&gt;
            </template>
          </ComponentDemo>

          <!-- Toast -->
          <ComponentDemo
            :title="$t('components.toast.title')"
            :description="$t('components.toast.description')"
          >
            <template #preview>
              <div class="space-y-3">
                <LoadingButton @click="showToast('success')">
                  {{ $t('components.toast.examples.showSuccess') }}
                </LoadingButton>
                <LoadingButton variant="danger" @click="showToast('error')">
                  {{ $t('components.toast.examples.showError') }}
                </LoadingButton>
                <LoadingButton variant="secondary" @click="showToast('warning')">
                  {{ $t('components.toast.examples.showWarning') }}
                </LoadingButton>
                <LoadingButton variant="secondary" @click="showToast('info')">
                  {{ $t('components.toast.examples.showInfo') }}
                </LoadingButton>
              </div>
            </template>
            <template #code>
&lt;Toast
  message="Toast message"
  title="Optional title"
  type="success|error|warning|info"
  position="top-right|top-center|bottom-right|bottom-center"
  :duration="4000"
  :dismissible="true"
  @close="handleClose"
/&gt;
            </template>
          </ComponentDemo>

          <!-- ConfirmModal -->
          <ComponentDemo
            :title="$t('components.confirmModal.title')"
            :description="$t('components.confirmModal.description')"
          >
            <template #preview>
              <LoadingButton @click="showConfirmModal = true">
                {{ $t('components.confirmModal.examples.show') }}
              </LoadingButton>
              <ConfirmModal
                :show="showConfirmModal"
                :title="$t('components.confirmModal.examples.title')"
                :message="$t('components.confirmModal.examples.message')"
                :confirm-text="$t('components.confirmModal.examples.confirm')"
                :cancel-text="$t('components.confirmModal.examples.cancel')"
                @confirm="handleConfirm"
                @cancel="showConfirmModal = false"
              />
            </template>
            <template #code>
&lt;ConfirmModal
  :show="showModal"
  title="Confirmation Title"
  message="Are you sure?"
  confirm-text="Confirm"
  cancel-text="Cancel"
  @confirm="handleConfirm"
  @cancel="handleCancel"
/&gt;
            </template>
          </ComponentDemo>

          <!-- Alert -->
          <ComponentDemo
            title="Alert"
            description="Static alert component for displaying important messages with different severity levels."
          >
            <template #preview>
              <div class="space-y-4">
                <Alert
                  type="success"
                  title="Success"
                  message="Your changes have been saved successfully."
                />
                <Alert
                  type="error"
                  title="Error"
                  message="There was an error processing your request."
                  dismissible
                />
                <Alert
                  type="warning"
                  message="Your session will expire in 5 minutes."
                />
                <Alert
                  type="info"
                  variant="outlined"
                  dismissible
                >
                  <strong>New feature available!</strong> Check out our latest updates in the dashboard.
                </Alert>
              </div>
            </template>
            <template #code>
&lt;Alert
  message="Alert message"
  title="Optional title"
  type="success|error|warning|info"
  variant="filled|outlined|soft"
  :dismissible="false"
  @dismiss="handleDismiss"
/&gt;
            </template>
          </ComponentDemo>

          <!-- Badge -->
          <ComponentDemo
            title="Badge"
            description="Small status indicators and labels for displaying metadata."
          >
            <template #preview>
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="primary">Primary</Badge>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Badge icon="i-mdi-check" variant="success">Completed</Badge>
                  <Badge icon="i-mdi-clock" variant="warning">Pending</Badge>
                  <Badge icon="i-mdi-close" variant="error">Failed</Badge>
                </div>
              </div>
            </template>
            <template #code>
&lt;Badge
  variant="default|success|error|warning|info|primary"
  size="sm|md|lg"
  :rounded="true"
  icon="i-mdi-check"
&gt;
  Badge Text
&lt;/Badge&gt;
            </template>
          </ComponentDemo>

          <!-- EmptyState -->
          <ComponentDemo
            title="EmptyState"
            description="Display when there's no data to show, with optional actions."
          >
            <template #preview>
              <div class="space-y-8">
                <Card>
                  <EmptyState
                    title="No items found"
                    description="Get started by creating your first item."
                  >
                    <LoadingButton>Create Item</LoadingButton>
                  </EmptyState>
                </Card>
                <Card>
                  <EmptyState
                    title="No results"
                    description="Try adjusting your search or filter to find what you're looking for."
                    icon="i-mdi-magnify"
                    icon-size="md"
                  />
                </Card>
              </div>
            </template>
            <template #code>
&lt;EmptyState
  title="Title"
  description="Description text"
  icon="i-mdi-inbox"
  icon-size="sm|md|lg"
&gt;
  &lt;!-- Optional action buttons --&gt;
  &lt;LoadingButton&gt;Action&lt;/LoadingButton&gt;
&lt;/EmptyState&gt;
            </template>
          </ComponentDemo>
        </ComponentSection>

        <!-- Navigation Components -->
        <ComponentSection
          id="navigation-components"
          :title="$t('components.sections.navigationComponents')"
          icon="i-mdi-navigation"
        >
          <!-- Pagination -->
          <ComponentDemo
            :title="$t('components.pagination.title')"
            :description="$t('components.pagination.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <Pagination
                  :current-page="paginationDemo.currentPage"
                  :total-pages="20"
                  @update:page="paginationDemo.currentPage = $event"
                />
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('components.pagination.examples.currentPage') }}: {{ paginationDemo.currentPage }}
                </p>
                <Pagination
                  :current-page="paginationDemo.currentPage2"
                  :total-pages="5"
                  :show-first-last="false"
                  @update:page="paginationDemo.currentPage2 = $event"
                />
              </div>
            </template>
            <template #code>
&lt;Pagination
  :current-page="currentPage"
  :total-pages="totalPages"
  :max-visible="7"
  :show-first-last="true"
  @update:page="handlePageChange"
/&gt;
            </template>
          </ComponentDemo>

          <!-- Breadcrumbs -->
          <ComponentDemo
            :title="$t('components.breadcrumbs.title')"
            :description="$t('components.breadcrumbs.description')"
          >
            <template #preview>
              <Breadcrumbs :crumbs="breadcrumbsDemo" />
            </template>
            <template #code>
&lt;Breadcrumbs
  :crumbs="[
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/produkte' },
    { label: 'Details' }
  ]"
/&gt;
            </template>
          </ComponentDemo>
        </ComponentSection>
      </div>

      <!-- Toast Container -->
      <Teleport to="body">
        <Toast
          v-if="toast.show"
          :key="toast.key"
          :message="toast.message"
          :title="toast.title"
          :type="toast.type"
          :position="toast.position"
          @close="toast.show = false"
        />
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Section navigation
const sections = [
  { id: 'form-components', title: t('components.sections.formComponents'), icon: 'i-mdi-form-textbox' },
  { id: 'button-components', title: t('components.sections.buttonComponents'), icon: 'i-mdi-gesture-tap-button' },
  { id: 'layout-components', title: 'Layout Components', icon: 'i-mdi-view-dashboard' },
  { id: 'feedback-components', title: t('components.sections.feedbackComponents'), icon: 'i-mdi-message-alert' },
  { id: 'navigation-components', title: t('components.sections.navigationComponents'), icon: 'i-mdi-navigation' }
]

// Form Input Demo State
const formInputDemo = reactive({
  basic: '',
  required: '',
  withHint: '',
  withError: 'Invalid value',
  disabled: 'Disabled field',
  number: 42
})

// Form Textarea Demo State
const formTextareaDemo = reactive({
  basic: '',
  withMaxLength: '',
  customRows: ''
})

// Form Select Demo State
const formSelectDemo = reactive({
  basic: '',
  withObjects: null,
  required: '',
  withError: ''
})

const selectOptions = [
  { id: 1, name: 'Germany' },
  { id: 2, name: 'Austria' },
  { id: 3, name: 'Switzerland' },
  { id: 4, name: 'France' }
]

// Pagination Demo State
const paginationDemo = reactive({
  currentPage: 1,
  currentPage2: 1
})

// Breadcrumbs Demo
const breadcrumbsDemo = [
  { label: t('components.breadcrumbs.examples.home'), to: '/' },
  { label: t('components.breadcrumbs.examples.products'), to: '/produkte' },
  { label: t('components.breadcrumbs.examples.details') }
]

// Confirm Modal Demo
const showConfirmModal = ref(false)

const handleConfirm = () => {
  showConfirmModal.value = false
  showToast('success', t('components.confirmModal.examples.confirmed'))
}

// Toast Demo
const toast = reactive({
  show: false,
  message: '',
  title: '',
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  position: 'top-right' as 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center',
  key: 0
})

const showToast = (type: 'success' | 'error' | 'warning' | 'info', customMessage?: string) => {
  const messages = {
    success: t('components.toast.examples.successMessage'),
    error: t('components.toast.examples.errorMessage'),
    warning: t('components.toast.examples.warningMessage'),
    info: t('components.toast.examples.infoMessage')
  }

  toast.type = type
  toast.message = customMessage || messages[type]
  toast.title = t(`components.toast.examples.${type}Title`)
  toast.show = true
  toast.key++
}

useHead({
  title: t('components.pageTitle')
})
</script>
