import '@testing-library/jest-dom'
import { fakeBrowser } from 'wxt/testing'

// Reset fake browser before each test
beforeEach(() => {
  fakeBrowser.reset()
})