# Testing Guide

## Quick Start

```bash
# Install dependencies
yarn install

# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests with UI
yarn test:ui
```

## Test Commands

| Command | Description |
|---------|-------------|
| `yarn test` | Run tests in watch mode (for development) |
| `yarn test:run` | Run all tests once (for CI/CD) |
| `yarn test:ui` | Open Vitest UI for interactive testing |
| `yarn test:coverage` | Generate coverage report |

## Test Structure

```
tests/
├── unit/          # Unit tests for individual functions/components
├── integration/   # Tests for complete workflows
├── helpers/       # Test utilities and factories
└── mocks/         # Mock implementations
```

## Writing Your First Test

### 1. API Endpoint Test

```typescript
// tests/unit/api/myendpoint.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { createMockEvent } from '../../helpers/api-test.helpers'

describe('My API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return data successfully', async () => {
    // Arrange: Set up test data
    const testData = { id: 1, name: 'Test' }
    mockPrisma.model.findMany.mockResolvedValue([testData])

    // Act: Call the endpoint
    const event = createMockEvent({ query: {} })
    const result = await handler(event)

    // Assert: Verify results
    expect(result).toBeDefined()
    expect(mockPrisma.model.findMany).toHaveBeenCalled()
  })
})
```

### 2. Component Test

```typescript
// tests/unit/components/MyComponent.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '../../../components/MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test Title' }
    })

    expect(wrapper.text()).toContain('Test Title')
  })

  it('should emit event on click', async () => {
    const wrapper = mount(MyComponent)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### 3. Integration Test

```typescript
// tests/integration/my-workflow.test.ts
import { describe, it, expect } from 'vitest'
import { mockPrisma } from '../mocks/prisma.mock'

describe('Complete Workflow', () => {
  it('should complete the entire workflow', async () => {
    // Test multiple steps working together
    // 1. Create entity
    // 2. Update related entities
    // 3. Verify final state
  })
})
```

## Test Data Factories

Use factory functions to create consistent test data:

```typescript
import {
  createTestProdukt,
  createTestKunde,
  createTestRechnung
} from '../../helpers/test-data.factory'

// Use default values
const produkt = createTestProdukt()

// Override specific fields
const customProdukt = createTestProdukt({
  Produktname: 'Custom Product',
  SKU: 'CUSTOM-001'
})
```

## Mocking Prisma

The Prisma client is automatically mocked. Configure mock responses:

```typescript
import { mockPrisma } from '../../mocks/prisma.mock'

// Mock successful response
mockPrisma.produkte.findMany.mockResolvedValue([testProduct])

// Mock error
mockPrisma.produkte.create.mockRejectedValue(new Error('Database error'))

// Mock multiple calls
mockPrisma.produkte.findUnique
  .mockResolvedValueOnce(product1)
  .mockResolvedValueOnce(product2)
```

## Common Patterns

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  mockPrisma.model.create.mockResolvedValue(testData)

  const result = await handler(event)

  expect(result).toBeDefined()
})
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', async () => {
  mockPrisma.model.findMany.mockRejectedValue(new Error('DB Error'))

  const result = await handler(event)

  expect(result).toHaveProperty('status', 500)
  expect(result).toHaveProperty('message')
})
```

### Testing Validation

```typescript
it('should validate required fields', async () => {
  const event = createMockEvent({
    body: { /* missing required field */ }
  })

  const result = await handler(event)

  expect(result).toHaveProperty('status', 400)
})
```

## Coverage Reports

After running `yarn test:coverage`, view the report:

```bash
# Open HTML coverage report
open coverage/index.html
```

Coverage is reported for:
- **Statements**: Individual lines of code
- **Branches**: If/else paths
- **Functions**: Function definitions
- **Lines**: Lines executed

## Debugging Tests

### Run Specific Test File

```bash
yarn test tests/unit/api/produkte.test.ts
```

### Run Tests Matching Pattern

```bash
yarn test --grep "should create"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
  "runtimeArgs": ["run"],
  "console": "integratedTerminal"
}
```

## Best Practices

✅ **DO:**
- Clear mocks between tests with `beforeEach(() => vi.clearAllMocks())`
- Use descriptive test names
- Test both success and error cases
- Use test data factories for consistency
- Keep tests independent and isolated

❌ **DON'T:**
- Test implementation details
- Share state between tests
- Make real database calls
- Test external libraries
- Write overly complex tests

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn test:run
      - run: yarn test:coverage
```

## Getting Help

- Check the [tests/README.md](tests/README.md) for detailed documentation
- Review existing tests for examples
- See [Vitest docs](https://vitest.dev/) for framework details
- See [Vue Test Utils](https://test-utils.vuejs.org/) for component testing

## Next Steps

1. Run the test suite: `yarn test`
2. Check coverage: `yarn test:coverage`
3. Write tests for new features
4. Maintain >80% coverage for critical code
