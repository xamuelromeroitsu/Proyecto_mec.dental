import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Font Awesome icons — evitan warnings y errores en JSDOM
Object.defineProperty(HTMLElement.prototype, 'className', {
  configurable: true,
  get() {
    return this.getAttribute('class') || ''
  },
  set(value) {
    this.setAttribute('class', value)
  },
})

// Mock document.createElement para Font Awesome link en App.jsx
const originalCreateElement = document.createElement.bind(document)
document.createElement = vi.fn((tagName, options) => {
  if (tagName === 'link' && options?.href?.includes('fontawesome')) {
    const link = originalCreateElement('link')
    link.rel = 'stylesheet'
    link.href = ''
    return link
  }
  return originalCreateElement(tagName, options)
})

// Fake timers para tests con setTimeout (LoginView 1500ms, NewOrderForm 1200ms)
vi.useFakeTimers()

// Cleanup global después de cada test
afterEach(() => {
  vi.clearAllMocks()
  vi.clearAllTimers()
  document.body.innerHTML = ''
})