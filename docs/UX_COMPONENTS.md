# UX Components Guide

This document describes the new UX components added to improve user experience across the application.

## Overview

The following components have been created to standardize UX patterns and replace inconsistent implementations:

1. **Toast Notifications** - Replace browser `alert()` dialogs
2. **LoadingSpinner** - Unified loading states
3. **LoadingButton** - Buttons with loading states
4. **Breadcrumbs** - Navigation breadcrumb trail
5. **Pagination** - Standardized pagination controls
6. **FormInput** - Form inputs with validation
7. **FormTextarea** - Textareas with validation

## Toast Notifications

### Usage

Replace all `alert()` and native dialog usage with toast notifications for better UX.

```vue
<script setup>
const toast = useToast()

// Success message
toast.success('Product saved successfully!')

// Error message
toast.error('Failed to delete product')

// Warning message
toast.warning('This action cannot be undone')

// Info message
toast.info('New feature available')

// Custom options
toast.show({
  message: 'Custom toast',
  title: 'Important',
  type: 'success',
  duration: 5000,
  position: 'top-center'
})
</script>
```

### API Reference

**useToast() composable:**
- `success(message, title?, duration?)` - Show success toast
- `error(message, title?, duration?)` - Show error toast
- `warning(message, title?, duration?)` - Show warning toast
- `info(message, title?, duration?)` - Show info toast
- `show(options)` - Show custom toast
- `clear()` - Clear all toasts

**Options:**
- `message` (required): Toast message text
- `title` (optional): Toast title
- `type`: 'success' | 'error' | 'warning' | 'info'
- `position`: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
- `duration`: Number in milliseconds (0 = no auto-dismiss)
- `dismissible`: Boolean (default: true)

## LoadingSpinner

### Usage

Use for loading states instead of plain text.

```vue
<template>
  <!-- Basic spinner -->
  <LoadingSpinner v-if="loading" />

  <!-- With text -->
  <LoadingSpinner v-if="loading" text="Loading products..." />

  <!-- Centered in container -->
  <LoadingSpinner v-if="loading" text="Loading..." center />

  <!-- Full-screen overlay -->
  <LoadingSpinner v-if="loading" text="Processing..." overlay />

  <!-- Different sizes -->
  <LoadingSpinner size="sm" />
  <LoadingSpinner size="md" />
  <LoadingSpinner size="lg" />
  <LoadingSpinner size="xl" />
</template>
```

### Props

- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `text`: Optional loading text
- `center`: Centers vertically in container
- `overlay`: Full-screen overlay with backdrop

## LoadingButton

### Usage

Buttons that show loading state during async operations.

```vue
<template>
  <LoadingButton
    :loading="isDeleting"
    variant="danger"
    @click="handleDelete"
  >
    Delete
  </LoadingButton>

  <LoadingButton
    :loading="isSaving"
    variant="primary"
    type="submit"
  >
    Save Changes
  </LoadingButton>

  <!-- With icon -->
  <LoadingButton
    :loading="isLoading"
    icon="i-mdi-check"
    variant="success"
  >
    Confirm
  </LoadingButton>
</template>

<script setup>
const isSaving = ref(false)

async function handleSave() {
  isSaving.value = true
  try {
    await saveData()
    toast.success('Saved successfully!')
  } catch (error) {
    toast.error('Save failed')
  } finally {
    isSaving.value = false
  }
}
</script>
```

### Props

- `type`: 'button' | 'submit' | 'reset' (default: 'button')
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: Boolean - shows spinner when true
- `disabled`: Boolean
- `icon`: Icon class (e.g., 'i-mdi-check')

## Breadcrumbs

### Usage

Add navigation breadcrumbs to pages.

```vue
<template>
  <Breadcrumbs :crumbs="breadcrumbs" />
</template>

<script setup>
const { t } = useI18n()

const breadcrumbs = computed(() => [
  { label: t('menu.products'), to: '/produkte' },
  { label: t('produkte.edit'), to: `/produkte/edit/${id}` },
  { label: productName.value } // Last item has no link
])
</script>
```

### Props

- `crumbs`: Array of `{ label: string, to?: string }`
  - Last item should not have `to` property (current page)

## Pagination

### Usage

Standardized pagination controls.

```vue
<template>
  <Pagination
    :current-page="currentPage"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
  />
</template>

<script setup>
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
</script>
```

### Props

- `currentPage`: Current page number (1-indexed)
- `totalPages`: Total number of pages
- `maxVisible`: Maximum visible page buttons (default: 7)
- `showFirstLast`: Show first/last buttons (default: true)

### Events

- `@update:page`: Emitted when page changes

## FormInput

### Usage

Form inputs with validation and error display.

```vue
<template>
  <FormInput
    v-model="email"
    label="Email Address"
    type="email"
    placeholder="Enter your email"
    :required="true"
    :validator="validateEmail"
    hint="We'll never share your email"
  />
</template>

<script setup>
const email = ref('')

function validateEmail(value) {
  if (!value) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Invalid email format'
  }
  return null // null = valid
}
</script>
```

### Props

- `modelValue`: Input value (v-model)
- `label`: Input label
- `type`: Input type (default: 'text')
- `placeholder`: Placeholder text
- `required`: Show required indicator
- `disabled`: Disable input
- `hint`: Help text below input
- `error`: External error message
- `validator`: Function that returns error string or null
- `min`, `max`, `step`: Number input attributes

## FormTextarea

### Usage

Similar to FormInput but for multi-line text.

```vue
<template>
  <FormTextarea
    v-model="description"
    label="Description"
    :rows="6"
    :maxLength="500"
    :required="true"
    placeholder="Enter description..."
    hint="Maximum 500 characters"
  />
</template>
```

### Props

- Same as FormInput, plus:
- `rows`: Number of visible rows (default: 4)
- `maxLength`: Character limit (shows counter)

## Migration Examples

### Before: Using alert()

```vue
// ❌ Old way
async function deleteItem(id) {
  if (confirm('Are you sure?')) {
    try {
      await $fetch(`/api/items/${id}`, { method: 'DELETE' })
      alert('Deleted successfully')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }
}
```

### After: Using Toast + ConfirmModal

```vue
// ✅ New way
<template>
  <ConfirmModal
    v-if="showDeleteModal"
    :title="$t('common.confirmDelete')"
    :message="$t('items.confirmDelete')"
    @confirm="handleDelete"
    @cancel="showDeleteModal = false"
  />
</template>

<script setup>
const toast = useToast()
const showDeleteModal = ref(false)
const itemToDelete = ref(null)

function confirmDelete(id) {
  itemToDelete.value = id
  showDeleteModal.value = true
}

async function handleDelete() {
  showDeleteModal.value = false
  try {
    await $fetch(`/api/items/${itemToDelete.value}`, { method: 'DELETE' })
    toast.success($t('common.deleteSuccess'))
  } catch (error) {
    toast.error($t('common.deleteError'))
  }
}
</script>
```

### Before: Custom loading text

```vue
// ❌ Old way
<div v-if="loading">Loading products...</div>
```

### After: LoadingSpinner

```vue
// ✅ New way
<LoadingSpinner v-if="loading" :text="$t('produkte.loadingProducts')" center />
```

### Before: Custom pagination

```vue
// ❌ Old way (inconsistent across pages)
<div class="flex gap-2">
  <button @click="page--">Previous</button>
  <button v-for="p in pages" @click="page = p">{{ p }}</button>
  <button @click="page++">Next</button>
</div>
```

### After: Pagination component

```vue
// ✅ New way (consistent)
<Pagination
  :current-page="currentPage"
  :total-pages="totalPages"
  @update:page="currentPage = $event"
/>
```

## Translation Keys

Add these keys to i18n files:

```json
{
  "common": {
    "close": "Close",
    "save": "Save",
    "delete": "Delete",
    "confirmDelete": "Are you sure you want to delete this item?",
    "deleteSuccess": "Successfully deleted",
    "deleteError": "Error deleting",
    "saveSuccess": "Successfully saved",
    "saveError": "Error saving",
    "loadError": "Error loading",
    "page": "Page",
    "firstPage": "First Page",
    "lastPage": "Last Page",
    "nextPage": "Next Page",
    "previousPage": "Previous Page"
  }
}
```

## Best Practices

1. **Always use toast for notifications** - Never use `alert()`, `confirm()`, or `prompt()`
2. **Show loading states** - Use LoadingSpinner or LoadingButton for async operations
3. **Provide feedback** - Show success/error toasts after operations
4. **Add breadcrumbs** - Help users navigate nested pages
5. **Use standard pagination** - Consistent UX across all list pages
6. **Validate forms** - Use FormInput/FormTextarea validators
7. **Use i18n** - All user-facing text should be translatable

## Component Locations

- `components/Toast.vue` - Toast notification component
- `components/ToastContainer.vue` - Container for rendering toasts
- `components/LoadingSpinner.vue` - Loading spinner
- `components/LoadingButton.vue` - Button with loading state
- `components/Breadcrumbs.vue` - Breadcrumb navigation
- `components/Pagination.vue` - Pagination controls
- `components/FormInput.vue` - Form input with validation
- `components/FormTextarea.vue` - Textarea with validation
- `components/FormSelect.vue` - Select dropdown with validation
- `components/DatePicker.vue` - Calendar date picker
- `components/Tabs.vue` - Tab navigation component
- `components/DataTable.vue` - Responsive data table with search, sort, pagination
- `components/AsyncAutocomplete.vue` - Autocomplete with async search
- `composables/useToast.ts` - Toast notification composable
- `components/ConfirmModal.vue` - Existing modal for confirmations

## New Components

### DatePicker

Calendar-based date picker with min/max date support.

```vue
<template>
  <DatePicker
    v-model="selectedDate"
    label="Select Date"
    placeholder="Choose a date..."
    :min-date="minDate"
    :max-date="maxDate"
    format="dd.MM.yyyy"
    clearable
  />
</template>
```

**Props:**
- `modelValue`: Selected date (string or Date)
- `label`: Input label
- `placeholder`: Input placeholder
- `minDate` / `maxDate`: Date limits
- `format`: Output format ('dd.MM.yyyy' or 'yyyy-MM-dd')
- `clearable`: Allow clearing selection
- `disabled`: Disable input

### Tabs

Tab navigation with underline or pills style.

```vue
<template>
  <Tabs v-model="activeTab" :tabs="tabs" variant="underline">
    <template #tab1>Tab 1 content</template>
    <template #tab2>Tab 2 content</template>
  </Tabs>
</template>

<script setup>
const activeTab = ref('tab1')
const tabs = [
  { value: 'tab1', label: 'Tab 1', icon: 'i-mdi-home' },
  { value: 'tab2', label: 'Tab 2', badge: 5 },
  { value: 'tab3', label: 'Tab 3', disabled: true }
]
</script>
```

**Props:**
- `modelValue`: Active tab value
- `tabs`: Array of tab definitions
- `variant`: 'underline' or 'pills'

### DataTable

Responsive data table with search, sort, pagination, and selection.

```vue
<template>
  <DataTable
    :columns="columns"
    :data="data"
    searchable
    paginated
    :page-size="10"
    selectable
    v-model:selected-rows="selected"
  >
    <template #cell-status="{ value }">
      <Badge :variant="value === 'Active' ? 'success' : 'gray'">{{ value }}</Badge>
    </template>
    <template #rowActions="{ row }">
      <button @click="edit(row)">Edit</button>
    </template>
  </DataTable>
</template>
```

**Props:**
- `columns`: Column definitions (key, label, sortable, align, format)
- `data`: Array of data rows
- `loading`: Show loading state
- `searchable`: Enable search bar
- `paginated`: Enable pagination
- `pageSize`: Items per page
- `selectable`: Enable row selection
- `selectedRows`: Selected rows (v-model)
- `striped`: Striped rows
- `hoverable`: Hover effect

**Mobile View:** On screens smaller than `md`, the table automatically switches to a card-based layout for better mobile UX.

### AsyncAutocomplete

Autocomplete with debounced async search.

```vue
<template>
  <AsyncAutocomplete
    v-model="selectedUser"
    label="Search Users"
    :items="searchResults"
    :loading="isSearching"
    :display-fn="user => user.name"
    item-key="id"
    :debounce="300"
    :min-chars="2"
    @search="handleSearch"
  >
    <template #item="{ item }">
      <div>{{ item.name }} - {{ item.email }}</div>
    </template>
  </AsyncAutocomplete>
</template>

<script setup>
const selectedUser = ref(null)
const searchResults = ref([])
const isSearching = ref(false)

async function handleSearch(query) {
  isSearching.value = true
  searchResults.value = await fetchUsers(query)
  isSearching.value = false
}
</script>
```

**Props:**
- `modelValue`: Selected item
- `items`: Search results array
- `loading`: Loading state
- `itemKey`: Unique key field
- `displayFn`: Function to display item
- `debounce`: Debounce delay in ms
- `minChars`: Minimum characters before search

**Events:**
- `@search`: Emitted when user types (debounced)
- `@select`: Emitted when item selected
- `@clear`: Emitted when cleared

## Demo Page

Visit `/ui-demo` to see all components in action with interactive examples.

## Example: Complete Page Update

See `/pages/produkte/index.vue` for a complete example of a page using all UX components.
