import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmModal from '../../../components/ConfirmModal.vue'

describe('ConfirmModal Component', () => {
  it('should render when show prop is true', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true
      }
    })

    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.isVisible()).toBe(true)
  })

  it('should not render when show prop is false', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: false
      }
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('should display custom title', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true,
        title: 'Delete Confirmation'
      }
    })

    expect(wrapper.find('h3').text()).toBe('Delete Confirmation')
  })

  it('should display custom message', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true,
        message: 'Are you sure you want to delete this item?'
      }
    })

    expect(wrapper.text()).toContain('Are you sure you want to delete this item?')
  })

  it('should use default title when not provided', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true
      }
    })

    expect(wrapper.find('h3').text()).toBe('Bestätigung')
  })

  it('should use default message when not provided', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true
      }
    })

    expect(wrapper.text()).toContain('Sind Sie sicher?')
  })

  it('should emit confirm event when confirm button clicked', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true
      }
    })

    const buttons = wrapper.findAll('button')
    const confirmButton = buttons[1] // Second button is confirm

    await confirmButton.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('should emit cancel event when cancel button clicked', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true
      }
    })

    const buttons = wrapper.findAll('button')
    const cancelButton = buttons[0] // First button is cancel

    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('should display custom button texts', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true,
        confirmText: 'Yes, Delete',
        cancelText: 'No, Keep'
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].text()).toBe('No, Keep')
    expect(buttons[1].text()).toBe('Yes, Delete')
  })

  it('should have correct styling classes', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true
      }
    })

    // Check for modal overlay
    expect(wrapper.find('.bg-black.bg-opacity-50').exists()).toBe(true)

    // Check for modal content
    expect(wrapper.find('.bg-white').exists()).toBe(true)
    expect(wrapper.find('.rounded-lg').exists()).toBe(true)
  })
})
