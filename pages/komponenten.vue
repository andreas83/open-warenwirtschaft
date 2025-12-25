<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ $t('components.title') }}</h1>
        <p class="text-lg text-gray-600">{{ $t('components.description') }}</p>
      </div>

      <!-- Table of Contents -->
      <div class="card mb-8">
        <div class="card-body">
          <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="i-mdi-format-list-bulleted text-primary-600"></span>
            {{ $t('components.tableOfContents') }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a v-for="section in sections" :key="section.id" :href="`#${section.id}`"
               class="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <span :class="section.icon" class="text-primary-600"></span>
              <span class="text-gray-700 hover:text-primary-600">{{ $t(section.label) }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Form Components Section -->
      <section id="form-components" class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span class="i-mdi-form-textbox text-primary-600"></span>
          {{ $t('components.sections.formComponents') }}
        </h2>

        <!-- FormInput Component -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t('components.formInput.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('components.formInput.description') }}</p>
          </div>
          <div class="card-body space-y-6">
            <!-- Examples -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Input -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formInput.examples.basic') }}</h4>
                <FormInput v-model="formExamples.basic" :label="$t('common.name')" placeholder="Enter your name" />
              </div>

              <!-- Required Input -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formInput.examples.required') }}</h4>
                <FormInput v-model="formExamples.required" :label="$t('common.email')" placeholder="example@email.com" required />
              </div>

              <!-- With Hint -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formInput.examples.withHint') }}</h4>
                <FormInput v-model="formExamples.withHint" :label="$t('common.phone')" placeholder="+49 123 456789" hint="Format: +49 XXX XXXXXX" />
              </div>

              <!-- Number Input -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formInput.examples.number') }}</h4>
                <FormInput v-model="formExamples.number" label="Price" type="number" :min="0" :step="0.01" />
              </div>

              <!-- Disabled Input -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formInput.examples.disabled') }}</h4>
                <FormInput v-model="formExamples.disabled" label="Disabled Field" disabled />
              </div>

              <!-- With Error -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formInput.examples.withError') }}</h4>
                <FormInput v-model="formExamples.withError" :label="$t('common.email')" error="Invalid email format" />
              </div>
            </div>

            <!-- Code Example -->
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">{{ $t('components.demo.code') }}</h4>
                <button @click="copyCode('formInput')" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ $t('components.demo.copyCode') }}
                </button>
              </div>
              <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;FormInput
  v-model="value"
  label="Field Label"
  placeholder="Placeholder text"
  hint="Helpful hint text"
  :required="true"
  :disabled="false"
  error="Error message"
/&gt;</code></pre>
            </div>
          </div>
        </div>

        <!-- FormTextarea Component -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t('components.formTextarea.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('components.formTextarea.description') }}</p>
          </div>
          <div class="card-body space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Textarea -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formTextarea.examples.basic') }}</h4>
                <FormTextarea v-model="formExamples.textarea" :label="$t('common.description')" :rows="3" />
              </div>

              <!-- With Max Length -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formTextarea.examples.withMaxLength') }}</h4>
                <FormTextarea v-model="formExamples.textareaMax" :label="$t('common.notes')" :rows="3" :max-length="200" />
              </div>

              <!-- Custom Rows -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.formTextarea.examples.customRows') }}</h4>
                <FormTextarea v-model="formExamples.textareaCustom" label="Large Text Area" :rows="6" />
              </div>
            </div>

            <!-- Code Example -->
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">{{ $t('components.demo.code') }}</h4>
                <button @click="copyCode('formTextarea')" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ $t('components.demo.copyCode') }}
                </button>
              </div>
              <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;FormTextarea
  v-model="value"
  label="Description"
  :rows="3"
  :max-length="500"
  placeholder="Enter description..."
/&gt;</code></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- Button Components Section -->
      <section id="button-components" class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span class="i-mdi-gesture-tap-button text-primary-600"></span>
          {{ $t('components.sections.buttonComponents') }}
        </h2>

        <!-- LoadingButton Component -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t('components.loadingButton.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('components.loadingButton.description') }}</p>
          </div>
          <div class="card-body space-y-6">
            <!-- Variants -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Variants</h4>
              <div class="flex flex-wrap gap-3">
                <Button variant="primary">{{ $t('components.loadingButton.examples.primary') }}</Button>
                <Button variant="secondary">{{ $t('components.loadingButton.examples.secondary') }}</Button>
                <Button variant="success">{{ $t('components.loadingButton.examples.success') }}</Button>
                <Button variant="danger">{{ $t('components.loadingButton.examples.danger') }}</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <!-- Sizes -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Sizes</h4>
              <div class="flex flex-wrap items-center gap-3">
                <Button size="xs">{{ $t('components.loadingButton.examples.small') }}</Button>
                <Button size="sm">{{ $t('components.loadingButton.examples.small') }}</Button>
                <Button size="md">{{ $t('components.loadingButton.examples.medium') }}</Button>
                <Button size="lg">{{ $t('components.loadingButton.examples.large') }}</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            <!-- With Icons -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.loadingButton.examples.withIcon') }}</h4>
              <div class="flex flex-wrap gap-3">
                <Button icon="i-mdi-plus" variant="primary">{{ $t('common.create') }}</Button>
                <Button icon="i-mdi-content-save" variant="success">{{ $t('common.save') }}</Button>
                <Button icon="i-mdi-delete" variant="danger">{{ $t('common.delete') }}</Button>
                <Button icon="i-mdi-pencil" variant="secondary">{{ $t('common.edit') }}</Button>
              </div>
            </div>

            <!-- States -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">States</h4>
              <div class="flex flex-wrap gap-3">
                <Button :loading="true">{{ $t('components.loadingButton.examples.loading') }}</Button>
                <Button :disabled="true">{{ $t('components.loadingButton.examples.disabled') }}</Button>
                <Button variant="primary" block class="max-w-xs">Full Width Button</Button>
              </div>
            </div>

            <!-- Code Example -->
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">{{ $t('components.demo.code') }}</h4>
                <button @click="copyCode('button')" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ $t('components.demo.copyCode') }}
                </button>
              </div>
              <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;Button
  variant="primary"
  size="md"
  icon="i-mdi-check"
  :loading="false"
  :disabled="false"
  @click="handleClick"
&gt;
  Button Text
&lt;/Button&gt;</code></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- Feedback Components Section -->
      <section id="feedback-components" class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span class="i-mdi-bell-ring text-primary-600"></span>
          {{ $t('components.sections.feedbackComponents') }}
        </h2>

        <!-- Toast Component -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t('components.toast.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('components.toast.description') }}</p>
          </div>
          <div class="card-body space-y-6">
            <div class="flex flex-wrap gap-3">
              <Button variant="success" icon="i-mdi-check-circle" @click="showSuccessToast">
                {{ $t('components.toast.examples.showSuccess') }}
              </Button>
              <Button variant="danger" icon="i-mdi-close-circle" @click="showErrorToast">
                {{ $t('components.toast.examples.showError') }}
              </Button>
              <Button variant="warning" icon="i-mdi-alert-circle" @click="showWarningToast">
                {{ $t('components.toast.examples.showWarning') }}
              </Button>
              <Button variant="primary" icon="i-mdi-information" @click="showInfoToast">
                {{ $t('components.toast.examples.showInfo') }}
              </Button>
            </div>

            <!-- Code Example -->
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">{{ $t('components.demo.code') }}</h4>
                <button @click="copyCode('toast')" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ $t('components.demo.copyCode') }}
                </button>
              </div>
              <pre class="text-sm text-gray-800 overflow-x-auto"><code>const toast = useToast()

// Show different toast types
toast.success('Success message')
toast.error('Error message')
toast.warning('Warning message')
toast.info('Info message')

// Custom toast with title
toast.show({
  title: 'Custom Title',
  message: 'Custom message',
  type: 'success',
  duration: 5000
})</code></pre>
            </div>
          </div>
        </div>

        <!-- Loading Spinner Component -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t('components.loadingSpinner.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('components.loadingSpinner.description') }}</p>
          </div>
          <div class="card-body space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Sizes -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.loadingSpinner.examples.sizes') }}</h4>
                <div class="flex items-end gap-4 p-4 border rounded-lg">
                  <div class="text-center">
                    <LoadingSpinner size="sm" />
                    <span class="text-xs text-gray-500 mt-1 block">sm</span>
                  </div>
                  <div class="text-center">
                    <LoadingSpinner size="md" />
                    <span class="text-xs text-gray-500 mt-1 block">md</span>
                  </div>
                  <div class="text-center">
                    <LoadingSpinner size="lg" />
                    <span class="text-xs text-gray-500 mt-1 block">lg</span>
                  </div>
                  <div class="text-center">
                    <LoadingSpinner size="xl" />
                    <span class="text-xs text-gray-500 mt-1 block">xl</span>
                  </div>
                </div>
              </div>

              <!-- With Text -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.loadingSpinner.examples.withText') }}</h4>
                <div class="p-4 border rounded-lg">
                  <LoadingSpinner :text="$t('components.loadingSpinner.examples.loadingText')" />
                </div>
              </div>

              <!-- Centered -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('components.loadingSpinner.examples.centered') }}</h4>
                <div class="p-4 border rounded-lg h-32 relative">
                  <LoadingSpinner :text="$t('components.loadingSpinner.examples.centeredText')" center />
                </div>
              </div>
            </div>

            <!-- Code Example -->
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">{{ $t('components.demo.code') }}</h4>
                <button @click="copyCode('spinner')" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ $t('components.demo.copyCode') }}
                </button>
              </div>
              <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;LoadingSpinner size="md" text="Loading..." center /&gt;

&lt;!-- Full page overlay --&gt;
&lt;LoadingSpinner v-if="loading" text="Processing..." overlay /&gt;</code></pre>
            </div>
          </div>
        </div>

        <!-- Confirm Modal Component -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t('components.confirmModal.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('components.confirmModal.description') }}</p>
          </div>
          <div class="card-body space-y-6">
            <div>
              <Button variant="primary" @click="showConfirmModal">
                {{ $t('components.confirmModal.examples.show') }}
              </Button>
            </div>

            <!-- Confirmation Modal -->
            <Modal v-model="confirmModalVisible" :title="$t('components.confirmModal.examples.title')" size="sm" variant="info" icon="i-mdi-help-circle">
              <p class="text-gray-600">{{ $t('components.confirmModal.examples.message') }}</p>
              <template #footer>
                <div class="flex justify-end gap-3">
                  <Button variant="secondary" @click="confirmModalVisible = false">
                    {{ $t('components.confirmModal.examples.cancel') }}
                  </Button>
                  <Button variant="primary" @click="handleConfirm">
                    {{ $t('components.confirmModal.examples.confirm') }}
                  </Button>
                </div>
              </template>
            </Modal>

            <!-- Code Example -->
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">{{ $t('components.demo.code') }}</h4>
                <button @click="copyCode('modal')" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ $t('components.demo.copyCode') }}
                </button>
              </div>
              <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;Modal
  v-model="showModal"
  title="Modal Title"
  size="md"
  variant="info"
  icon="i-mdi-information"
&gt;
  &lt;p&gt;Modal content here&lt;/p&gt;

  &lt;template #footer&gt;
    &lt;div class="flex justify-end gap-3"&gt;
      &lt;Button @click="showModal = false"&gt;Cancel&lt;/Button&gt;
      &lt;Button variant="primary" @click="handleConfirm"&gt;Confirm&lt;/Button&gt;
    &lt;/div&gt;
  &lt;/template&gt;
&lt;/Modal&gt;</code></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- Navigation Components Section -->
      <section id="navigation-components" class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span class="i-mdi-navigation text-primary-600"></span>
          {{ $t('components.sections.navigationComponents') }}
        </h2>

        <!-- Pagination Component -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t('components.pagination.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('components.pagination.description') }}</p>
          </div>
          <div class="card-body space-y-6">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-gray-600">{{ $t('components.pagination.examples.currentPage') }}: {{ paginationExample.currentPage }}</span>
                <select v-model.number="paginationExample.totalPages" class="px-3 py-1 border rounded text-sm">
                  <option :value="5">5 pages</option>
                  <option :value="10">10 pages</option>
                  <option :value="20">20 pages</option>
                </select>
              </div>
              <Pagination
                :current-page="paginationExample.currentPage"
                :total-pages="paginationExample.totalPages"
                @update:page="paginationExample.currentPage = $event"
              />
            </div>

            <!-- Code Example -->
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">{{ $t('components.demo.code') }}</h4>
                <button @click="copyCode('pagination')" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ $t('components.demo.copyCode') }}
                </button>
              </div>
              <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;Pagination
  :current-page="currentPage"
  :total-pages="totalPages"
  @update:page="currentPage = $event"
/&gt;</code></pre>
            </div>
          </div>
        </div>

        <!-- Breadcrumbs Component -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t('components.breadcrumbs.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('components.breadcrumbs.description') }}</p>
          </div>
          <div class="card-body space-y-6">
            <div class="space-y-4">
              <div class="p-4 border rounded-lg">
                <Breadcrumbs :crumbs="[
                  { label: $t('components.breadcrumbs.examples.home'), to: '/' },
                  { label: $t('components.breadcrumbs.examples.products'), to: '/produkte' },
                  { label: $t('components.breadcrumbs.examples.details') }
                ]" />
              </div>
              <div class="p-4 border rounded-lg">
                <Breadcrumbs :crumbs="[
                  { label: $t('components.breadcrumbs.examples.home'), to: '/' },
                  { label: 'Restaurant', to: '/restaurant' },
                  { label: 'Tables', to: '/restaurant/tables' },
                  { label: 'Table 5' }
                ]" />
              </div>
            </div>

            <!-- Code Example -->
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">{{ $t('components.demo.code') }}</h4>
                <button @click="copyCode('breadcrumbs')" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ $t('components.demo.copyCode') }}
                </button>
              </div>
              <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;Breadcrumbs :crumbs="[
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/produkte' },
  { label: 'Product Details' }
]" /&gt;</code></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- Back to Top -->
      <div class="flex justify-center mt-12">
        <a href="#" class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
          <span class="i-mdi-arrow-up"></span>
          Back to Top
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const toast = useToast()

// Section navigation
const sections = [
  { id: 'form-components', label: 'components.sections.formComponents', icon: 'i-mdi-form-textbox' },
  { id: 'button-components', label: 'components.sections.buttonComponents', icon: 'i-mdi-gesture-tap-button' },
  { id: 'feedback-components', label: 'components.sections.feedbackComponents', icon: 'i-mdi-bell-ring' },
  { id: 'navigation-components', label: 'components.sections.navigationComponents', icon: 'i-mdi-navigation' }
]

// Form examples
const formExamples = ref({
  basic: '',
  required: '',
  withHint: '',
  withError: 'invalid-email',
  number: null,
  disabled: 'This field is disabled',
  textarea: '',
  textareaMax: '',
  textareaCustom: ''
})

// Pagination example
const paginationExample = ref({
  currentPage: 1,
  totalPages: 10
})

// Modal state
const confirmModalVisible = ref(false)

// Methods
function showSuccessToast() {
  toast.success(t('components.toast.examples.successMessage'))
}

function showErrorToast() {
  toast.error(t('components.toast.examples.errorMessage'))
}

function showWarningToast() {
  toast.warning(t('components.toast.examples.warningMessage'))
}

function showInfoToast() {
  toast.info(t('components.toast.examples.infoMessage'))
}

function showConfirmModal() {
  confirmModalVisible.value = true
}

function handleConfirm() {
  confirmModalVisible.value = false
  toast.success(t('components.confirmModal.examples.confirmed'))
}

function copyCode(componentName) {
  toast.success('Code copied to clipboard!')
}
</script>
