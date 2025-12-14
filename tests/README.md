# Test Suite Documentation

This directory contains the comprehensive test suite for the Warenwirtschaftssystem (ERP) application.

## Overview

The test suite is built using:
- **Vitest** - Fast unit test framework for Vite-based projects
- **@vue/test-utils** - Official testing utility library for Vue.js components
- **@nuxt/test-utils** - Testing utilities for Nuxt applications
- **jsdom** - JavaScript implementation of web standards for DOM manipulation

## Directory Structure

```
tests/
├── unit/                          # Unit tests
│   ├── api/                       # API endpoint tests
│   │   ├── produkte.test.ts       # Product API tests
│   │   ├── kunden.test.ts         # Customer API tests
│   │   ├── rechnungen.test.ts     # Invoice API tests
│   │   ├── standorte.test.ts      # Location API tests
│   │   └── bestand.test.ts        # Inventory API tests
│   └── components/                # Component tests
│       ├── FormInput.test.ts      # Form input component tests
│       ├── LoadingSpinner.test.ts # Loading spinner tests
│       └── ConfirmModal.test.ts   # Confirmation modal tests
├── integration/                   # Integration tests
│   ├── invoice-workflow.test.ts   # Complete invoice workflow tests
│   └── product-management.test.ts # Product management workflow tests
├── helpers/                       # Test helper utilities
│   ├── test-data.factory.ts       # Factory functions for test data
│   └── api-test.helpers.ts        # API testing helper functions
├── mocks/                         # Mock implementations
│   └── prisma.mock.ts             # Prisma client mock
├── setup.ts                       # Global test setup
└── README.md                      # This file
```

## Running Tests

### Run all tests
```bash
yarn test
```

### Run tests in watch mode (development)
```bash
yarn test
```

### Run tests once (CI/CD)
```bash
yarn test:run
```

### Run tests with UI interface
```bash
yarn test:ui
```

### Run tests with coverage report
```bash
yarn test:coverage
```

## Writing Tests

### API Endpoint Tests

API tests use mocked Prisma client to avoid database dependencies:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { createMockEvent } from '../../helpers/api-test.helpers'
import { createTestProdukt } from '../../helpers/test-data.factory'

describe('API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return data', async () => {
    const testData = createTestProdukt()
    mockPrisma.produkte.findMany.mockResolvedValue([testData])

    const event = createMockEvent({ query: { limit: '10' } })
    const result = await handler(event)

    expect(result).toHaveProperty('data')
  })
})
```

### Component Tests

Component tests use Vue Test Utils to mount and test Vue components:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormInput from '../../../components/FormInput.vue'

describe('Component', () => {
  it('should render correctly', () => {
    const wrapper = mount(FormInput, {
      props: { modelValue: '', label: 'Test' }
    })

    expect(wrapper.find('label').text()).toContain('Test')
  })
})
```

### Integration Tests

Integration tests verify complete workflows across multiple components:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mockPrisma } from '../mocks/prisma.mock'
import { createTestRechnung } from '../helpers/test-data.factory'

describe('Workflow', () => {
  it('should complete the workflow', async () => {
    // Setup
    const invoice = createTestRechnung()
    mockPrisma.rechnungen.create.mockResolvedValue(invoice)

    // Execute
    // ... workflow steps

    // Verify
    expect(invoice).toHaveProperty('RechnungsID')
  })
})
```

## Test Utilities

### Test Data Factories

Located in `helpers/test-data.factory.ts`, these functions create test data:

- `createTestProdukt()` - Creates test product data
- `createTestKunde()` - Creates test customer data
- `createTestRechnung()` - Creates test invoice data
- `createTestLieferant()` - Creates test supplier data
- `createTestStandort()` - Creates test location data
- `createTestBestand()` - Creates test inventory data

All factory functions accept an optional `overrides` parameter:

```typescript
const produkt = createTestProdukt({
  Produktname: 'Custom Name',
  SKU: 'CUSTOM-001'
})
```

### API Test Helpers

Located in `helpers/api-test.helpers.ts`:

- `createMockEvent()` - Creates mock H3 event for testing API endpoints
- `mockSuccessResponse()` - Creates mock success response
- `mockErrorResponse()` - Creates mock error response
- `testApiEndpoint()` - Helper to test API endpoint handlers

### Prisma Mock

Located in `mocks/prisma.mock.ts`, provides a complete mocked Prisma client with all necessary methods stubbed using Vitest's `vi.fn()`.

## Best Practices

1. **Clear All Mocks**: Always use `beforeEach(() => vi.clearAllMocks())` to reset mock state between tests

2. **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested
   ```typescript
   it('should return 404 when product not found', async () => {})
   ```

3. **Arrange-Act-Assert**: Structure tests in three phases:
   - Arrange: Set up test data and mocks
   - Act: Execute the code being tested
   - Assert: Verify the results

4. **Test One Thing**: Each test should verify one specific behavior

5. **Use Factory Functions**: Use test data factories for consistent test data creation

6. **Mock External Dependencies**: Always mock database calls, API requests, and file system operations

7. **Test Error Cases**: Don't just test happy paths - test error handling too

## Coverage Goals

Aim for the following coverage targets:
- **API Endpoints**: 80%+ coverage
- **Components**: 70%+ coverage
- **Business Logic**: 90%+ coverage
- **Integration Workflows**: Cover critical user journeys

## Continuous Integration

Tests are designed to run in CI/CD environments:

```yaml
# Example CI configuration
test:
  script:
    - yarn install
    - yarn test:run
    - yarn test:coverage
```

## Troubleshooting

### Tests timing out
Increase the timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000
}
```

### Mock not working
Ensure you're clearing mocks between tests:
```typescript
beforeEach(() => {
  vi.clearAllMocks()
})
```

### Component tests failing
Check that all component dependencies are properly mocked or provided in the test setup.

## Contributing

When adding new features:
1. Write tests alongside your code
2. Ensure all tests pass before committing
3. Update this documentation if you add new test utilities
4. Maintain or improve code coverage

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Guide](https://test-utils.vuejs.org/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
