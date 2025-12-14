import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormInput from '../../../components/FormInput.vue'

describe('FormInput Component', () => {
  it('should render input with label', () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: '',
        label: 'Test Label'
      }
    })

    expect(wrapper.find('label').text()).toContain('Test Label')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('should show required asterisk when required', () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: '',
        label: 'Required Field',
        required: true
      }
    })

    expect(wrapper.find('.text-red-500').exists()).toBe(true)
    expect(wrapper.find('input').attributes('required')).toBeDefined()
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: ''
      }
    })

    const input = wrapper.find('input')
    await input.setValue('test value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value'])
  })

  it('should handle number type correctly', async () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: 0,
        type: 'number'
      }
    })

    const input = wrapper.find('input')
    await input.setValue('42')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([42])
  })

  it('should display error message', () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: '',
        error: 'This field is required'
      }
    })

    const errorElement = wrapper.find('[role="alert"]')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toBe('This field is required')
  })

  it('should display hint when no error', () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: '',
        hint: 'Enter your name'
      }
    })

    expect(wrapper.text()).toContain('Enter your name')
    expect(wrapper.find('.text-gray-500').exists()).toBe(true)
  })

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.classes()).toContain('cursor-not-allowed')
  })

  it('should show error icon when there is an error', () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: '',
        error: 'Invalid input'
      }
    })

    expect(wrapper.find('.i-mdi-alert-circle').exists()).toBe(true)
  })

  it('should apply correct type attribute', () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: '',
        type: 'email'
      }
    })

    expect(wrapper.find('input').attributes('type')).toBe('email')
  })

  it('should handle min, max, and step for number inputs', () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: 5,
        type: 'number',
        min: 0,
        max: 100,
        step: 5
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('min')).toBe('0')
    expect(input.attributes('max')).toBe('100')
    expect(input.attributes('step')).toBe('5')
  })
})
