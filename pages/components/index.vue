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

          <!-- DatePicker -->
          <ComponentDemo
            :title="$t('components.datePicker.title')"
            :description="$t('components.datePicker.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <DatePicker
                  v-model="datePickerDemo.basic"
                  :label="$t('components.datePicker.examples.basic')"
                />
                <DatePicker
                  v-model="datePickerDemo.withRange"
                  :label="$t('components.datePicker.examples.withRange')"
                  :min="datePickerDemo.minDate"
                  :max="datePickerDemo.maxDate"
                  hint="Select a date within the allowed range"
                />
                <DatePicker
                  v-model="datePickerDemo.required"
                  :label="$t('components.datePicker.examples.required')"
                  required
                />
              </div>
            </template>
            <template #code>
&lt;DatePicker
  v-model="value"
  label="Select Date"
  :required="true"
  :min="minDate"
  :max="maxDate"
  hint="Optional hint"
/&gt;
            </template>
          </ComponentDemo>

          <!-- FormSelect -->
          <ComponentDemo
            :title="$t('components.formSelect.title')"
            :description="$t('components.formSelect.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <FormSelect
                  v-model="formSelectDemo.basic"
                  :label="$t('components.formSelect.examples.basic')"
                  :options="formSelectDemo.options"
                  placeholder="Select an option..."
                />
                <FormSelect
                  v-model="formSelectDemo.withObjects"
                  :label="$t('components.formSelect.examples.withObjects')"
                  :options="formSelectDemo.countries"
                  value-key="code"
                  label-key="name"
                  placeholder="Select a country..."
                />
              </div>
            </template>
            <template #code>
&lt;FormSelect
  v-model="value"
  label="Select Label"
  :options="options"
  placeholder="Choose..."
  value-key="value"
  label-key="label"
  :required="true"
/&gt;
            </template>
          </ComponentDemo>

          <!-- Checkbox -->
          <ComponentDemo
            :title="$t('components.checkbox.title')"
            :description="$t('components.checkbox.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <Checkbox
                  v-model="checkboxDemo.terms"
                  :label="$t('components.checkbox.examples.terms')"
                />
                <Checkbox
                  v-model="checkboxDemo.newsletter"
                  :label="$t('components.checkbox.examples.newsletter')"
                  :hint="$t('components.checkbox.examples.newsletterHint')"
                />
                <Checkbox
                  v-model="checkboxDemo.disabled"
                  label="Disabled checkbox"
                  disabled
                />
              </div>
            </template>
            <template #code>
&lt;Checkbox
  v-model="checked"
  label="Accept terms"
  hint="Optional description"
  :required="true"
/&gt;
            </template>
          </ComponentDemo>

          <!-- RadioGroup -->
          <ComponentDemo
            :title="$t('components.radioGroup.title')"
            :description="$t('components.radioGroup.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <RadioGroup
                  v-model="radioDemo.size"
                  :label="$t('components.radioGroup.examples.label')"
                  :options="radioDemo.sizeOptions"
                />
                <RadioGroup
                  v-model="radioDemo.payment"
                  :label="$t('components.radioGroup.examples.paymentLabel')"
                  :options="radioDemo.paymentOptions"
                  value-key="value"
                  label-key="label"
                  inline
                />
              </div>
            </template>
            <template #code>
&lt;RadioGroup
  v-model="selected"
  label="Choose option"
  :options="options"
  :inline="false"
  value-key="value"
  label-key="label"
/&gt;
            </template>
          </ComponentDemo>

          <!-- Toggle -->
          <ComponentDemo
            :title="$t('components.toggle.title')"
            :description="$t('components.toggle.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <Toggle
                  v-model="toggleDemo.notifications"
                  :label="$t('components.toggle.examples.notifications')"
                  :hint="$t('components.toggle.examples.notificationsHint')"
                />
                <Toggle
                  v-model="toggleDemo.darkMode"
                  :label="$t('components.toggle.examples.darkMode')"
                />
                <div class="flex gap-4 items-center">
                  <Toggle v-model="toggleDemo.small" size="sm" />
                  <Toggle v-model="toggleDemo.medium" size="md" />
                  <Toggle v-model="toggleDemo.large" size="lg" />
                </div>
              </div>
            </template>
            <template #code>
&lt;Toggle
  v-model="enabled"
  label="Enable feature"
  hint="Optional description"
  size="md"
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

        <!-- Data Display Components -->
        <ComponentSection
          id="data-display"
          :title="$t('components.sections.dataDisplay')"
          icon="i-mdi-card-text"
        >
          <!-- Badge -->
          <ComponentDemo
            :title="$t('components.badge.title')"
            :description="$t('components.badge.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                  <Badge>{{ $t('components.badge.examples.default') }}</Badge>
                  <Badge variant="secondary">{{ $t('components.badge.examples.secondary') }}</Badge>
                  <Badge variant="success">{{ $t('components.badge.examples.success') }}</Badge>
                  <Badge variant="danger">{{ $t('components.badge.examples.danger') }}</Badge>
                  <Badge variant="warning">{{ $t('components.badge.examples.warning') }}</Badge>
                  <Badge variant="info">{{ $t('components.badge.examples.info') }}</Badge>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Badge icon="i-mdi-check-circle" variant="success">With Icon</Badge>
                  <Badge rounded>Rounded</Badge>
                  <Badge variant="danger" rounded>99+</Badge>
                </div>
              </div>
            </template>
            <template #code>
&lt;Badge
  variant="primary|secondary|success|danger|warning|info"
  size="sm|md|lg"
  icon="i-mdi-check"
  :rounded="false"
&gt;
  Badge Text
&lt;/Badge&gt;
            </template>
          </ComponentDemo>

          <!-- Alert -->
          <ComponentDemo
            :title="$t('components.alert.title')"
            :description="$t('components.alert.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <Alert
                  type="success"
                  :title="$t('components.alert.examples.successTitle')"
                  :message="$t('components.alert.examples.successMessage')"
                />
                <Alert
                  type="error"
                  :title="$t('components.alert.examples.errorTitle')"
                  :message="$t('components.alert.examples.errorMessage')"
                />
                <Alert
                  type="warning"
                  :title="$t('components.alert.examples.warningTitle')"
                  :message="$t('components.alert.examples.warningMessage')"
                />
                <Alert
                  type="info"
                  :title="$t('components.alert.examples.infoTitle')"
                  :dismissible="true"
                >
                  {{ $t('components.alert.examples.infoMessage') }}
                </Alert>
              </div>
            </template>
            <template #code>
&lt;Alert
  type="success|error|warning|info"
  title="Alert Title"
  message="Alert message"
  :dismissible="true"
&gt;
  Custom content via slot
&lt;/Alert&gt;
            </template>
          </ComponentDemo>
        </ComponentSection>

        <!-- Layout Components -->
        <ComponentSection
          id="layout-components"
          :title="$t('components.sections.layoutComponents')"
          icon="i-mdi-view-dashboard"
        >
          <!-- Card -->
          <ComponentDemo
            :title="$t('components.card.title')"
            :description="$t('components.card.description')"
          >
            <template #preview>
              <div class="space-y-4">
                <Card :title="$t('components.card.examples.basicTitle')">
                  <p>{{ $t('components.card.examples.basicContent') }}</p>
                </Card>
                <Card variant="bordered" :title="$t('components.card.examples.borderedTitle')">
                  <p>{{ $t('components.card.examples.borderedContent') }}</p>
                </Card>
                <Card variant="elevated" hover>
                  <template #header>
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold">{{ $t('components.card.examples.customHeader') }}</h3>
                      <Badge variant="success">{{ $t('components.card.examples.newBadge') }}</Badge>
                    </div>
                  </template>
                  <p>{{ $t('components.card.examples.elevatedContent') }}</p>
                  <template #footer>
                    <div class="flex justify-end gap-2">
                      <LoadingButton variant="secondary" size="sm">{{ $t('common.cancel') }}</LoadingButton>
                      <LoadingButton size="sm">{{ $t('common.save') }}</LoadingButton>
                    </div>
                  </template>
                </Card>
              </div>
            </template>
            <template #code>
&lt;Card
  title="Card Title"
  variant="default|bordered|elevated"
  padding="none|sm|md|lg"
  :hover="false"
&gt;
  &lt;template #header&gt;Custom header&lt;/template&gt;
  Card content
  &lt;template #footer&gt;Custom footer&lt;/template&gt;
&lt;/Card&gt;
            </template>
          </ComponentDemo>

          <!-- Tabs -->
          <ComponentDemo
            :title="$t('components.tabs.title')"
            :description="$t('components.tabs.description')"
          >
            <template #preview>
              <div class="space-y-6">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ $t('components.tabs.examples.default') }}</p>
                  <Tabs :tabs="tabsDemo.defaultTabs">
                    <template #tab-0>{{ $t('components.tabs.examples.tab1Content') }}</template>
                    <template #tab-1>{{ $t('components.tabs.examples.tab2Content') }}</template>
                    <template #tab-2>{{ $t('components.tabs.examples.tab3Content') }}</template>
                  </Tabs>
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ $t('components.tabs.examples.pills') }}</p>
                  <Tabs :tabs="tabsDemo.pillsTabs" variant="pills">
                    <template #tab-0>{{ $t('components.tabs.examples.tab1Content') }}</template>
                    <template #tab-1>{{ $t('components.tabs.examples.tab2Content') }}</template>
                  </Tabs>
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ $t('components.tabs.examples.withIcons') }}</p>
                  <Tabs :tabs="tabsDemo.iconTabs" variant="underline">
                    <template #tab-0>{{ $t('components.tabs.examples.tab1Content') }}</template>
                    <template #tab-1>{{ $t('components.tabs.examples.tab2Content') }}</template>
                    <template #tab-2>{{ $t('components.tabs.examples.tab3Content') }}</template>
                  </Tabs>
                </div>
              </div>
            </template>
            <template #code>
&lt;Tabs
  :tabs="tabs"
  variant="default|pills|underline"
  :default-tab="0"
  @tab-change="handleTabChange"
&gt;
  &lt;template #tab-0&gt;Tab 1 content&lt;/template&gt;
  &lt;template #tab-1&gt;Tab 2 content&lt;/template&gt;
&lt;/Tabs&gt;

&lt;!-- tabs array --&gt;
const tabs = [
  { label: 'Tab 1', icon: 'i-mdi-home', badge: '3' },
  { label: 'Tab 2', disabled: true }
]
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
  { id: 'feedback-components', title: t('components.sections.feedbackComponents'), icon: 'i-mdi-message-alert' },
  { id: 'navigation-components', title: t('components.sections.navigationComponents'), icon: 'i-mdi-navigation' },
  { id: 'data-display', title: t('components.sections.dataDisplay'), icon: 'i-mdi-card-text' },
  { id: 'layout-components', title: t('components.sections.layoutComponents'), icon: 'i-mdi-view-dashboard' }
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

// Pagination Demo State
const paginationDemo = reactive({
  currentPage: 1,
  currentPage2: 1
})

// DatePicker Demo State
const today = new Date()
const minDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

const datePickerDemo = reactive({
  basic: '',
  withRange: '',
  required: '',
  minDate,
  maxDate
})

// FormSelect Demo State
const formSelectDemo = reactive({
  basic: '',
  withObjects: '',
  options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
  countries: [
    { code: 'de', name: 'Deutschland' },
    { code: 'at', name: 'Österreich' },
    { code: 'ch', name: 'Schweiz' },
    { code: 'us', name: 'United States' }
  ]
})

// Checkbox Demo State
const checkboxDemo = reactive({
  terms: false,
  newsletter: true,
  disabled: true
})

// Radio Demo State
const radioDemo = reactive({
  size: 'M',
  payment: 'card',
  sizeOptions: ['S', 'M', 'L', 'XL'],
  paymentOptions: [
    { value: 'card', label: t('components.radioGroup.examples.card') },
    { value: 'cash', label: t('components.radioGroup.examples.cash') },
    { value: 'paypal', label: t('components.radioGroup.examples.paypal') }
  ]
})

// Toggle Demo State
const toggleDemo = reactive({
  notifications: true,
  darkMode: false,
  small: false,
  medium: true,
  large: false
})

// Tabs Demo State
const tabsDemo = reactive({
  defaultTabs: [
    { label: t('components.tabs.examples.tab1'), id: 'tab1' },
    { label: t('components.tabs.examples.tab2'), id: 'tab2' },
    { label: t('components.tabs.examples.tab3'), id: 'tab3' }
  ],
  pillsTabs: [
    { label: t('components.tabs.examples.tab1'), id: 'pills1' },
    { label: t('components.tabs.examples.tab2'), id: 'pills2', badge: '5', badgeVariant: 'danger' as const }
  ],
  iconTabs: [
    { label: t('components.tabs.examples.home'), icon: 'i-mdi-home', id: 'icon1' },
    { label: t('components.tabs.examples.settings'), icon: 'i-mdi-cog', id: 'icon2' },
    { label: t('components.tabs.examples.profile'), icon: 'i-mdi-account', id: 'icon3' }
  ]
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
