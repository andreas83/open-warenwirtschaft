import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'

describe('LoadingSpinner Component', () => {
  it('should render spinner', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    expect(wrapper.find('.rounded-full').exists()).toBe(true)
  })

  it('should display text when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        text: 'Loading...'
      }
    })

    expect(wrapper.text()).toContain('Loading...')
  })

  it('should not display text when not provided', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('should apply correct size classes for small', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'sm'
      }
    })

    expect(wrapper.find('.w-6').exists()).toBe(true)
  })

  it('should apply correct size classes for medium', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'md'
      }
    })

    expect(wrapper.find('.w-10').exists()).toBe(true)
  })

  it('should apply correct size classes for large', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'lg'
      }
    })

    expect(wrapper.find('.w-16').exists()).toBe(true)
  })

  it('should apply correct size classes for extra large', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'xl'
      }
    })

    expect(wrapper.find('.w-24').exists()).toBe(true)
  })

  it('should center content when center prop is true', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        center: true
      }
    })

    const container = wrapper.find('div')
    expect(container.classes()).toContain('justify-center')
    expect(container.classes()).toContain('min-h-[200px]')
  })

  it('should show overlay when overlay prop is true', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        overlay: true
      }
    })

    const container = wrapper.find('div')
    expect(container.classes()).toContain('fixed')
    expect(container.classes()).toContain('inset-0')
    expect(container.classes()).toContain('z-50')
  })

  it('should apply text size matching spinner size', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'lg',
        text: 'Please wait...'
      }
    })

    const textElement = wrapper.find('p')
    expect(textElement.classes()).toContain('text-lg')
  })
})
