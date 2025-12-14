<template>
  <div class="p-6">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ t('ui.demo.title', 'UI Components Demo') }}</h1>
        <p class="text-gray-600">{{ t('ui.demo.subtitle', 'Interactive showcase of all reusable UX components') }}</p>
      </div>

      <!-- Navigation Tabs -->
      <Tabs v-model="activeSection" :tabs="sectionTabs" variant="pills" />

      <!-- Color Palette Section -->
      <section v-show="activeSection === 'colors'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-palette text-indigo-600"></span>
          Color Palette
        </h2>
        <p class="text-gray-600 mb-6">Custom color system defined in <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">nuxt.config.ts</code>. Each color has shades from 50 (lightest) to 950 (darkest).</p>

        <!-- Primary -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Primary (Indigo)</h3>
          <div class="grid grid-cols-11 gap-1">
            <div class="text-center">
              <div class="h-12 rounded bg-primary-50"></div>
              <span class="text-xs text-gray-500">50</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-100"></div>
              <span class="text-xs text-gray-500">100</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-200"></div>
              <span class="text-xs text-gray-500">200</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-300"></div>
              <span class="text-xs text-gray-500">300</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-400"></div>
              <span class="text-xs text-gray-500">400</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-500"></div>
              <span class="text-xs text-gray-500">500</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-600"></div>
              <span class="text-xs text-gray-500">600</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-700"></div>
              <span class="text-xs text-gray-500">700</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-800"></div>
              <span class="text-xs text-gray-500">800</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-900"></div>
              <span class="text-xs text-gray-500">900</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-primary-950"></div>
              <span class="text-xs text-gray-500">950</span>
            </div>
          </div>
        </div>

        <!-- Secondary -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Secondary (Slate)</h3>
          <div class="grid grid-cols-11 gap-1">
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-50"></div>
              <span class="text-xs text-gray-500">50</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-100"></div>
              <span class="text-xs text-gray-500">100</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-200"></div>
              <span class="text-xs text-gray-500">200</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-300"></div>
              <span class="text-xs text-gray-500">300</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-400"></div>
              <span class="text-xs text-gray-500">400</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-500"></div>
              <span class="text-xs text-gray-500">500</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-600"></div>
              <span class="text-xs text-gray-500">600</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-700"></div>
              <span class="text-xs text-gray-500">700</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-800"></div>
              <span class="text-xs text-gray-500">800</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-900"></div>
              <span class="text-xs text-gray-500">900</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-secondary-950"></div>
              <span class="text-xs text-gray-500">950</span>
            </div>
          </div>
        </div>

        <!-- Success -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Success (Emerald)</h3>
          <div class="grid grid-cols-11 gap-1">
            <div class="text-center">
              <div class="h-12 rounded bg-success-50"></div>
              <span class="text-xs text-gray-500">50</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-100"></div>
              <span class="text-xs text-gray-500">100</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-200"></div>
              <span class="text-xs text-gray-500">200</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-300"></div>
              <span class="text-xs text-gray-500">300</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-400"></div>
              <span class="text-xs text-gray-500">400</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-500"></div>
              <span class="text-xs text-gray-500">500</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-600"></div>
              <span class="text-xs text-gray-500">600</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-700"></div>
              <span class="text-xs text-gray-500">700</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-800"></div>
              <span class="text-xs text-gray-500">800</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-900"></div>
              <span class="text-xs text-gray-500">900</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-success-950"></div>
              <span class="text-xs text-gray-500">950</span>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Warning (Amber)</h3>
          <div class="grid grid-cols-11 gap-1">
            <div class="text-center">
              <div class="h-12 rounded bg-warning-50"></div>
              <span class="text-xs text-gray-500">50</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-100"></div>
              <span class="text-xs text-gray-500">100</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-200"></div>
              <span class="text-xs text-gray-500">200</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-300"></div>
              <span class="text-xs text-gray-500">300</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-400"></div>
              <span class="text-xs text-gray-500">400</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-500"></div>
              <span class="text-xs text-gray-500">500</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-600"></div>
              <span class="text-xs text-gray-500">600</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-700"></div>
              <span class="text-xs text-gray-500">700</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-800"></div>
              <span class="text-xs text-gray-500">800</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-900"></div>
              <span class="text-xs text-gray-500">900</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-warning-950"></div>
              <span class="text-xs text-gray-500">950</span>
            </div>
          </div>
        </div>

        <!-- Danger -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Danger (Red)</h3>
          <div class="grid grid-cols-11 gap-1">
            <div class="text-center">
              <div class="h-12 rounded bg-danger-50"></div>
              <span class="text-xs text-gray-500">50</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-100"></div>
              <span class="text-xs text-gray-500">100</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-200"></div>
              <span class="text-xs text-gray-500">200</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-300"></div>
              <span class="text-xs text-gray-500">300</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-400"></div>
              <span class="text-xs text-gray-500">400</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-500"></div>
              <span class="text-xs text-gray-500">500</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-600"></div>
              <span class="text-xs text-gray-500">600</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-700"></div>
              <span class="text-xs text-gray-500">700</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-800"></div>
              <span class="text-xs text-gray-500">800</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-900"></div>
              <span class="text-xs text-gray-500">900</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-danger-950"></div>
              <span class="text-xs text-gray-500">950</span>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Info (Sky Blue)</h3>
          <div class="grid grid-cols-11 gap-1">
            <div class="text-center">
              <div class="h-12 rounded bg-info-50"></div>
              <span class="text-xs text-gray-500">50</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-100"></div>
              <span class="text-xs text-gray-500">100</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-200"></div>
              <span class="text-xs text-gray-500">200</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-300"></div>
              <span class="text-xs text-gray-500">300</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-400"></div>
              <span class="text-xs text-gray-500">400</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-500"></div>
              <span class="text-xs text-gray-500">500</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-600"></div>
              <span class="text-xs text-gray-500">600</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-700"></div>
              <span class="text-xs text-gray-500">700</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-800"></div>
              <span class="text-xs text-gray-500">800</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-900"></div>
              <span class="text-xs text-gray-500">900</span>
            </div>
            <div class="text-center">
              <div class="h-12 rounded bg-info-950"></div>
              <span class="text-xs text-gray-500">950</span>
            </div>
          </div>
        </div>

        <!-- Usage Examples -->
        <div class="border-t pt-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Usage Examples</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div class="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-3 h-3 rounded-full bg-primary-500"></span>
                <span class="font-medium text-primary-900">Primary Card</span>
              </div>
              <p class="text-sm text-primary-700">Used for main actions and branding.</p>
            </div>
            <div class="p-4 bg-success-50 border border-success-200 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-3 h-3 rounded-full bg-success-500"></span>
                <span class="font-medium text-success-900">Success Card</span>
              </div>
              <p class="text-sm text-success-700">Used for positive feedback.</p>
            </div>
            <div class="p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-3 h-3 rounded-full bg-danger-500"></span>
                <span class="font-medium text-danger-900">Danger Card</span>
              </div>
              <p class="text-sm text-danger-700">Used for errors and warnings.</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-2">Usage:</h4>
          <pre class="text-sm text-gray-600 overflow-x-auto"><code>&lt;!-- Background colors --&gt;
&lt;div class="bg-primary-500"&gt;...&lt;/div&gt;
&lt;div class="bg-success-100"&gt;...&lt;/div&gt;

&lt;!-- Text colors --&gt;
&lt;span class="text-danger-600"&gt;Error&lt;/span&gt;
&lt;span class="text-info-700"&gt;Info&lt;/span&gt;

&lt;!-- Border colors --&gt;
&lt;div class="border border-warning-300"&gt;...&lt;/div&gt;</code></pre>
        </div>
      </section>

      <!-- Buttons Section -->
      <section v-show="activeSection === 'buttons'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-gesture-tap-button text-indigo-600"></span>
          Buttons
        </h2>
        <p class="text-gray-600 mb-6">Consistent button styles across the application.</p>

        <!-- Variants -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Variants</h3>
          <div class="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </div>

        <!-- Sizes -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Sizes</h3>
          <div class="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </div>

        <!-- With Icons -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">With Icons</h3>
          <div class="flex flex-wrap gap-3">
            <Button icon="i-mdi-plus" variant="primary">Add Item</Button>
            <Button icon="i-mdi-content-save" variant="success">Save</Button>
            <Button icon="i-mdi-delete" variant="danger">Delete</Button>
            <Button icon="i-mdi-download" variant="secondary">Export</Button>
            <Button icon="i-mdi-pencil" variant="ghost">Edit</Button>
          </div>
        </div>

        <!-- States -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">States</h3>
          <div class="flex flex-wrap gap-3">
            <Button :loading="true">Loading...</Button>
            <Button :disabled="true">Disabled</Button>
            <Button variant="primary" block class="max-w-xs">Full Width</Button>
          </div>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-2">Usage:</h4>
          <pre class="text-sm text-gray-600 overflow-x-auto"><code>&lt;Button variant="primary" size="md" icon="i-mdi-check"&gt;
  Save Changes
&lt;/Button&gt;

&lt;Button variant="danger" :loading="isDeleting"&gt;
  Delete
&lt;/Button&gt;</code></pre>
        </div>
      </section>

      <!-- Modal Section -->
      <section v-show="activeSection === 'modals'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-card-outline text-indigo-600"></span>
          Modals
        </h2>
        <p class="text-gray-600 mb-6">Dialog windows for user interactions and confirmations.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Button @click="showModal.basic = true" variant="primary">
            Basic Modal
          </Button>
          <Button @click="showModal.confirm = true" variant="danger" icon="i-mdi-delete">
            Confirm Delete
          </Button>
          <Button @click="showModal.form = true" variant="secondary" icon="i-mdi-form-textbox">
            Form Modal
          </Button>
          <Button @click="showModal.info = true" variant="ghost" icon="i-mdi-information">
            Info Modal
          </Button>
          <Button @click="showModal.large = true" variant="secondary">
            Large Modal
          </Button>
        </div>

        <!-- Basic Modal -->
        <Modal v-model="showModal.basic" title="Basic Modal" size="md">
          <p class="text-gray-600">This is a basic modal with a title and close button. Click outside or press Escape to close.</p>
          <template #footer>
            <div class="flex justify-end gap-3">
              <Button variant="secondary" @click="showModal.basic = false">Cancel</Button>
              <Button variant="primary" @click="showModal.basic = false">Confirm</Button>
            </div>
          </template>
        </Modal>

        <!-- Confirm Modal -->
        <Modal v-model="showModal.confirm" title="Confirm Delete" icon="i-mdi-alert-circle" variant="danger" size="sm">
          <p class="text-gray-600">Are you sure you want to delete this item? This action cannot be undone.</p>
          <template #footer>
            <div class="flex justify-end gap-3">
              <Button variant="secondary" @click="showModal.confirm = false">Cancel</Button>
              <Button variant="danger" @click="handleDelete">Delete</Button>
            </div>
          </template>
        </Modal>

        <!-- Form Modal -->
        <Modal v-model="showModal.form" title="Create New Item" icon="i-mdi-plus-circle" variant="info" size="md">
          <div class="space-y-4">
            <FormInput v-model="modalForm.name" label="Name" placeholder="Enter name" required />
            <FormInput v-model="modalForm.email" label="Email" type="email" placeholder="email@example.com" />
            <FormTextarea v-model="modalForm.description" label="Description" :rows="3" />
          </div>
          <template #footer>
            <div class="flex justify-end gap-3">
              <Button variant="secondary" @click="showModal.form = false">Cancel</Button>
              <Button variant="primary" icon="i-mdi-content-save" @click="showModal.form = false">Save</Button>
            </div>
          </template>
        </Modal>

        <!-- Info Modal -->
        <Modal v-model="showModal.info" title="Information" icon="i-mdi-information" variant="info" size="sm" :closable="true">
          <div class="text-center py-4">
            <div class="i-mdi-check-circle w-16 h-16 text-emerald-500 mx-auto mb-4"></div>
            <p class="text-gray-600">Your changes have been saved successfully!</p>
          </div>
          <template #footer>
            <div class="flex justify-center">
              <Button variant="primary" @click="showModal.info = false">Got it</Button>
            </div>
          </template>
        </Modal>

        <!-- Large Modal -->
        <Modal v-model="showModal.large" title="Large Modal" size="lg">
          <div class="space-y-4">
            <p class="text-gray-600">This is a larger modal suitable for complex content, forms, or data displays.</p>
            <div class="grid grid-cols-2 gap-4">
              <FormInput v-model="modalForm.field1" label="Field 1" />
              <FormInput v-model="modalForm.field2" label="Field 2" />
              <FormInput v-model="modalForm.field3" label="Field 3" />
              <FormInput v-model="modalForm.field4" label="Field 4" />
            </div>
          </div>
          <template #footer>
            <div class="flex justify-between">
              <Button variant="ghost">Need Help?</Button>
              <div class="flex gap-3">
                <Button variant="secondary" @click="showModal.large = false">Cancel</Button>
                <Button variant="primary" @click="showModal.large = false">Submit</Button>
              </div>
            </div>
          </template>
        </Modal>

        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-2">Usage:</h4>
          <pre class="text-sm text-gray-600 overflow-x-auto"><code>&lt;Modal v-model="showModal" title="Modal Title" size="md"&gt;
  &lt;p&gt;Modal content here&lt;/p&gt;
  &lt;template #footer&gt;
    &lt;Button @click="showModal = false"&gt;Close&lt;/Button&gt;
  &lt;/template&gt;
&lt;/Modal&gt;</code></pre>
        </div>
      </section>

      <!-- Toast Notifications Section -->
      <section v-show="activeSection === 'notifications'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-bell-ring text-indigo-600"></span>
          Toast Notifications
        </h2>
        <p class="text-gray-600 mb-6">Non-blocking notifications with consistent styling.</p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button variant="success" icon="i-mdi-check-circle" @click="toast.success('Operation completed successfully!')">
            Success
          </Button>
          <Button variant="danger" icon="i-mdi-close-circle" @click="toast.error('Something went wrong!')">
            Error
          </Button>
          <Button variant="warning" icon="i-mdi-alert-circle" @click="toast.warning('Please review before continuing')">
            Warning
          </Button>
          <Button variant="primary" icon="i-mdi-information" @click="toast.info('New update available')">
            Info
          </Button>
        </div>

        <div class="flex flex-wrap gap-3 mb-6">
          <Button variant="secondary" @click="showCustomToast">With Title</Button>
          <Button variant="ghost" @click="toast.clear()">Clear All</Button>
        </div>

        <!-- Toast Preview -->
        <div class="border rounded-lg p-4 bg-gray-50">
          <h4 class="font-medium text-gray-700 mb-3">Preview:</h4>
          <div class="space-y-3">
            <div class="bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
              <span class="i-mdi-check-circle text-emerald-600 w-5 h-5 mt-0.5"></span>
              <div><p class="text-sm">Success message with emerald accent</p></div>
            </div>
            <div class="bg-red-50 text-red-900 border-l-4 border-red-500 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
              <span class="i-mdi-close-circle text-red-600 w-5 h-5 mt-0.5"></span>
              <div><p class="text-sm">Error message with red accent</p></div>
            </div>
            <div class="bg-amber-50 text-amber-900 border-l-4 border-amber-500 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
              <span class="i-mdi-alert-circle text-amber-600 w-5 h-5 mt-0.5"></span>
              <div><p class="text-sm">Warning message with amber accent</p></div>
            </div>
            <div class="bg-indigo-50 text-indigo-900 border-l-4 border-indigo-500 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
              <span class="i-mdi-information text-indigo-600 w-5 h-5 mt-0.5"></span>
              <div><p class="text-sm">Info message with indigo accent</p></div>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-2">Usage:</h4>
          <pre class="text-sm text-gray-600 overflow-x-auto"><code>const toast = useToast()

toast.success('Saved successfully!')
toast.error('Failed to save')
toast.warning('Unsaved changes')
toast.info('New version available')</code></pre>
        </div>
      </section>

      <!-- Loading States Section -->
      <section v-show="activeSection === 'loading'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-loading text-indigo-600"></span>
          Loading States
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="p-4 border rounded-lg">
            <h4 class="font-medium text-gray-700 mb-3">Sizes</h4>
            <div class="flex items-end gap-4">
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

          <div class="p-4 border rounded-lg">
            <h4 class="font-medium text-gray-700 mb-3">With Text</h4>
            <LoadingSpinner text="Loading data..." />
          </div>

          <div class="p-4 border rounded-lg h-32 relative">
            <h4 class="font-medium text-gray-700 mb-3">Centered</h4>
            <LoadingSpinner text="Centered" center />
          </div>

          <div class="p-4 border rounded-lg">
            <h4 class="font-medium text-gray-700 mb-3">Overlay</h4>
            <Button @click="showOverlay" variant="primary">Show Overlay (2s)</Button>
          </div>
        </div>

        <h3 class="text-lg font-medium text-gray-700 mb-4">Loading Buttons</h3>
        <div class="flex flex-wrap gap-3">
          <Button :loading="loadingStates.save" variant="primary" icon="i-mdi-content-save" @click="simulateAction('save')">
            {{ loadingStates.save ? 'Saving...' : 'Save' }}
          </Button>
          <Button :loading="loadingStates.delete" variant="danger" icon="i-mdi-delete" @click="simulateAction('delete')">
            {{ loadingStates.delete ? 'Deleting...' : 'Delete' }}
          </Button>
          <Button :loading="loadingStates.export" variant="secondary" icon="i-mdi-download" @click="simulateAction('export')">
            {{ loadingStates.export ? 'Exporting...' : 'Export' }}
          </Button>
        </div>

        <LoadingSpinner v-if="overlayVisible" text="Processing..." overlay />
      </section>

      <!-- Tabs Section -->
      <section v-show="activeSection === 'tabs'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-tab text-indigo-600"></span>
          Tabs
        </h2>

        <div class="space-y-8">
          <div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Underline Style</h3>
            <Tabs v-model="demoTab1" :tabs="demoTabs1" variant="underline">
              <template #overview>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-gray-600">Overview tab content goes here.</p>
                </div>
              </template>
              <template #details>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-gray-600">Details tab with more information.</p>
                </div>
              </template>
              <template #settings>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-gray-600">Settings configuration panel.</p>
                </div>
              </template>
            </Tabs>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Pills Style with Badges</h3>
            <Tabs v-model="demoTab2" :tabs="demoTabs2" variant="pills">
              <template #all><p class="text-gray-600 py-2">Showing all 42 items</p></template>
              <template #active><p class="text-gray-600 py-2">Showing 28 active items</p></template>
              <template #archived><p class="text-gray-600 py-2">Showing 14 archived items</p></template>
            </Tabs>
          </div>
        </div>
      </section>

      <!-- DataTable Section -->
      <section v-show="activeSection === 'table'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-table text-indigo-600"></span>
          DataTable
        </h2>
        <p class="text-gray-600 mb-4">Responsive table with search, sort, pagination. Resize to see mobile card view.</p>

        <DataTable
          :columns="tableColumns"
          :data="tableData"
          searchable
          paginated
          :page-size="5"
          selectable
          v-model:selected-rows="selectedRows"
          striped
        >
          <template #actions>
            <Button size="sm" icon="i-mdi-plus">Add New</Button>
          </template>
          <template #cell-status="{ value }">
            <span :class="['px-2 py-1 text-xs rounded-full', value === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700']">
              {{ value }}
            </span>
          </template>
          <template #rowActions="{ row }">
            <div class="flex gap-1">
              <button class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><span class="i-mdi-pencil w-4 h-4"></span></button>
              <button class="p-1.5 text-red-600 hover:bg-red-50 rounded"><span class="i-mdi-delete w-4 h-4"></span></button>
            </div>
          </template>
        </DataTable>

        <div v-if="selectedRows.length > 0" class="mt-4 p-3 bg-indigo-50 rounded-lg text-sm">
          <strong>{{ selectedRows.length }}</strong> row(s) selected
        </div>
      </section>

      <!-- Forms Section -->
      <section v-show="activeSection === 'forms'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-form-textbox text-indigo-600"></span>
          Form Components
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h3 class="font-medium text-gray-700">DatePicker</h3>
            <DatePicker v-model="formDemo.date" label="Select Date" hint="Click to open calendar" />
            <DatePicker v-model="formDemo.dateRange" label="With Limits" :min-date="minDate" :max-date="maxDate" hint="Next 30 days only" />
          </div>

          <div class="space-y-4">
            <h3 class="font-medium text-gray-700">AsyncAutocomplete</h3>
            <AsyncAutocomplete
              v-model="formDemo.selectedUser"
              label="Search Users"
              :items="searchResults"
              :loading="searchLoading"
              :display-fn="(item) => item?.name || ''"
              item-key="id"
              @search="handleAsyncSearch"
            >
              <template #item="{ item }">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span class="text-indigo-600 text-sm font-medium">{{ item.name.charAt(0) }}</span>
                  </div>
                  <div>
                    <div class="font-medium">{{ item.name }}</div>
                    <div class="text-xs text-gray-500">{{ item.email }}</div>
                  </div>
                </div>
              </template>
            </AsyncAutocomplete>
          </div>

          <div class="space-y-4">
            <h3 class="font-medium text-gray-700">FormInput</h3>
            <FormInput v-model="formDemo.name" label="Name" placeholder="Your name" required />
            <FormInput v-model="formDemo.email" label="Email" type="email" :validator="validateEmail" />
            <FormInput v-model="formDemo.price" label="Price" type="number" :min="0" :step="0.01" />
          </div>

          <div class="space-y-4">
            <h3 class="font-medium text-gray-700">FormSelect & FormTextarea</h3>
            <FormSelect v-model="formDemo.category" label="Category" :options="categoryOptions" placeholder="Select..." />
            <FormTextarea v-model="formDemo.description" label="Description" :rows="3" :max-length="200" />
          </div>
        </div>
      </section>

      <!-- Navigation Section -->
      <section v-show="activeSection === 'navigation'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-navigation text-indigo-600"></span>
          Navigation
        </h2>

        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Breadcrumbs</h3>
            <div class="space-y-3">
              <div class="p-4 border rounded-lg">
                <Breadcrumbs :crumbs="[{ label: 'Products', to: '/produkte' }, { label: 'Electronics' }, { label: 'Laptop Pro' }]" />
              </div>
              <div class="p-4 border rounded-lg">
                <Breadcrumbs :crumbs="[{ label: 'Hotel', to: '/hotel' }, { label: 'Rooms', to: '/hotel/zimmer' }, { label: 'Room 101' }]" />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Pagination</h3>
            <div class="p-4 border rounded-lg">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
                <select v-model.number="totalPages" class="px-3 py-1 border rounded text-sm">
                  <option :value="5">5 pages</option>
                  <option :value="10">10 pages</option>
                  <option :value="20">20 pages</option>
                </select>
              </div>
              <Pagination :current-page="currentPage" :total-pages="totalPages" @update:page="currentPage = $event" />
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Reference -->
      <section v-show="activeSection === 'reference'" class="bg-indigo-50 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-indigo-800 mb-4 flex items-center gap-2">
          <span class="i-mdi-book-open-page-variant text-indigo-600"></span>
          Quick Reference
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Button</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><code>variant</code>: primary, secondary, success, danger, warning, ghost, link</li>
              <li><code>size</code>: xs, sm, md, lg, xl</li>
              <li><code>icon</code>: icon class</li>
              <li><code>loading</code>: boolean</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Modal</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><code>v-model</code>: visibility</li>
              <li><code>title</code>: header text</li>
              <li><code>size</code>: sm, md, lg, xl, full</li>
              <li><code>variant</code>: default, info, success, warning, danger</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Toast</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><code>toast.success(msg)</code></li>
              <li><code>toast.error(msg)</code></li>
              <li><code>toast.warning(msg)</code></li>
              <li><code>toast.info(msg)</code></li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">DataTable</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><code>columns</code>: array</li>
              <li><code>searchable</code>: boolean</li>
              <li><code>paginated</code>: boolean</li>
              <li><code>selectable</code>: boolean</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">DatePicker</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><code>v-model</code>: date</li>
              <li><code>minDate/maxDate</code>: limits</li>
              <li><code>format</code>: output format</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Tabs</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><code>tabs</code>: array</li>
              <li><code>variant</code>: underline, pills</li>
              <li>Slots: <code>#tabValue</code></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const toast = useToast()

// Section navigation
const activeSection = ref('colors')
const sectionTabs = [
  { value: 'colors', label: 'Colors', icon: 'i-mdi-palette' },
  { value: 'buttons', label: 'Buttons', icon: 'i-mdi-gesture-tap-button' },
  { value: 'modals', label: 'Modals', icon: 'i-mdi-card-outline' },
  { value: 'notifications', label: 'Toasts', icon: 'i-mdi-bell' },
  { value: 'loading', label: 'Loading', icon: 'i-mdi-loading' },
  { value: 'tabs', label: 'Tabs', icon: 'i-mdi-tab' },
  { value: 'table', label: 'DataTable', icon: 'i-mdi-table' },
  { value: 'forms', label: 'Forms', icon: 'i-mdi-form-textbox' },
  { value: 'navigation', label: 'Navigation', icon: 'i-mdi-navigation' },
  { value: 'reference', label: 'Reference', icon: 'i-mdi-book' }
]

// Modal demos
const showModal = ref({
  basic: false,
  confirm: false,
  form: false,
  info: false,
  large: false
})

const modalForm = ref({
  name: '',
  email: '',
  description: '',
  field1: '',
  field2: '',
  field3: '',
  field4: ''
})

function handleDelete() {
  showModal.value.confirm = false
  toast.success('Item deleted successfully')
}

// Toast demo
function showCustomToast() {
  toast.show({
    message: 'This is a custom notification with a title.',
    title: 'Custom Toast',
    type: 'info',
    duration: 5000
  })
}

// Loading demo
const overlayVisible = ref(false)
const loadingStates = ref({ save: false, delete: false, export: false })

function showOverlay() {
  overlayVisible.value = true
  setTimeout(() => { overlayVisible.value = false }, 2000)
}

function simulateAction(action) {
  loadingStates.value[action] = true
  setTimeout(() => {
    loadingStates.value[action] = false
    toast.success(action === 'save' ? 'Saved!' : action === 'delete' ? 'Deleted!' : 'Exported!')
  }, 2000)
}

// Tabs demo
const demoTab1 = ref('overview')
const demoTabs1 = [
  { value: 'overview', label: 'Overview', icon: 'i-mdi-view-dashboard' },
  { value: 'details', label: 'Details', icon: 'i-mdi-information' },
  { value: 'settings', label: 'Settings', icon: 'i-mdi-cog' }
]

const demoTab2 = ref('all')
const demoTabs2 = [
  { value: 'all', label: 'All', badge: 42 },
  { value: 'active', label: 'Active', badge: 28 },
  { value: 'archived', label: 'Archived', badge: 14 }
]

// DataTable demo
const selectedRows = ref([])
const tableColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created', label: 'Created', sortable: true }
]
const tableData = [
  { id: 1, name: 'Max Mustermann', email: 'max@example.com', status: 'Active', created: '2024-01-15' },
  { id: 2, name: 'Anna Schmidt', email: 'anna@example.com', status: 'Active', created: '2024-01-14' },
  { id: 3, name: 'Peter Weber', email: 'peter@example.com', status: 'Inactive', created: '2024-01-13' },
  { id: 4, name: 'Lisa Müller', email: 'lisa@example.com', status: 'Active', created: '2024-01-12' },
  { id: 5, name: 'Tom Fischer', email: 'tom@example.com', status: 'Inactive', created: '2024-01-11' },
  { id: 6, name: 'Sarah Koch', email: 'sarah@example.com', status: 'Active', created: '2024-01-10' },
  { id: 7, name: 'Michael Braun', email: 'michael@example.com', status: 'Active', created: '2024-01-09' },
  { id: 8, name: 'Julia Wagner', email: 'julia@example.com', status: 'Inactive', created: '2024-01-08' }
]

// Form demo
const minDate = new Date()
const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
const searchResults = ref([])
const searchLoading = ref(false)
const mockUsers = [
  { id: 1, name: 'Max Mustermann', email: 'max@example.com' },
  { id: 2, name: 'Anna Schmidt', email: 'anna@example.com' },
  { id: 3, name: 'Peter Weber', email: 'peter@example.com' },
  { id: 4, name: 'Lisa Müller', email: 'lisa@example.com' },
  { id: 5, name: 'Maria Hoffmann', email: 'maria@example.com' },
  { id: 6, name: 'Martin Klein', email: 'martin@example.com' }
]

function handleAsyncSearch(query) {
  searchLoading.value = true
  setTimeout(() => {
    searchResults.value = mockUsers.filter(u =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    )
    searchLoading.value = false
  }, 500)
}

const formDemo = ref({
  date: null,
  dateRange: null,
  selectedUser: null,
  name: '',
  email: '',
  price: null,
  category: null,
  description: ''
})

const categoryOptions = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'other', label: 'Other' }
]

function validateEmail(value) {
  if (!value) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email'
  return null
}

// Pagination demo
const currentPage = ref(1)
const totalPages = ref(10)
</script>
