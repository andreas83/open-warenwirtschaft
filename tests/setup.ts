import { vi } from 'vitest'
import { ref, computed, reactive, readonly } from 'vue'

// Make Vue composables globally available (Nuxt auto-imports)
global.ref = ref
global.computed = computed
global.reactive = reactive
global.readonly = readonly

// Mock Nuxt auto-imports
global.defineEventHandler = (handler: any) => handler
global.getQuery = vi.fn()
global.readBody = vi.fn()
global.setResponseStatus = vi.fn()
global.createError = vi.fn((options) => new Error(options.message || options.statusMessage))

// Mock environment variables
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db'
