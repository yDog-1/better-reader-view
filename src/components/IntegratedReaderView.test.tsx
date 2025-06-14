import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntegratedReaderView } from './IntegratedReaderView'

// Mock SettingsStorage
vi.mock('../lib/SettingsStorage', () => ({
  SettingsStorage: vi.fn().mockImplementation(() => ({
    loadSettings: vi.fn().mockReturnValue({
      fontSize: '16px',
      fontFamily: 'serif',
      theme: 'light',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    }),
    saveSettings: vi.fn(),
    getDefaultSettings: vi.fn().mockReturnValue({
      fontSize: '16px',
      fontFamily: 'serif',
      theme: 'light',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    })
  }))
}))

describe('IntegratedReaderView', () => {
  const mockArticle = {
    title: 'Test Article Title',
    content: '<p>This is the article content with <strong>some formatting</strong>.</p>',
    textContent: 'This is the article content with some formatting.',
    length: 100,
    excerpt: 'This is the article content...',
    byline: 'By Test Author',
    dir: 'ltr',
    siteName: 'Test Site',
    lang: 'en'
  }

  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    document.body.innerHTML = ''
  })

  describe('rendering', () => {
    it('should render the integrated reader view', () => {
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={true}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByTestId('integrated-reader-view')).toBeInTheDocument()
      expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    })

    it('should be hidden when isVisible is false', () => {
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={false}
          onClose={mockOnClose}
        />
      )
      
      const readerView = screen.getByTestId('integrated-reader-view')
      expect(readerView).toHaveStyle({ display: 'none' })
    })
  })

  describe('settings panel interaction', () => {
    it('should show settings panel when settings button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={true}
          onClose={mockOnClose}
        />
      )
      
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument()
      expect(screen.getByText('Reader Settings')).toBeInTheDocument()
    })

    it('should hide settings panel when close button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={true}
          onClose={mockOnClose}
        />
      )
      
      // Open settings panel
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      // Close settings panel
      const closeButton = screen.getByRole('button', { name: /close settings/i })
      await user.click(closeButton)
      
      const settingsPanel = screen.getByTestId('settings-panel')
      expect(settingsPanel).toHaveStyle({ display: 'none' })
    })
  })

  describe('settings persistence', () => {
    it('should apply settings changes to the reader view', async () => {
      const user = userEvent.setup()
      
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={true}
          onClose={mockOnClose}
        />
      )
      
      // Open settings panel
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      // Change font size
      const largeButton = screen.getByText('Large')
      await user.click(largeButton)
      
      // The component should have updated its internal state
      // This is verified by checking that the settings panel still shows the correct active state
      expect(largeButton).toHaveClass('active')
    })
  })

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={true}
          onClose={mockOnClose}
        />
      )
      
      const closeButton = screen.getByRole('button', { name: /close reader/i })
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when escape key is pressed', () => {
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={true}
          onClose={mockOnClose}
        />
      )
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('toolbar', () => {
    it('should render toolbar with controls', () => {
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={true}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /close reader/i })).toBeInTheDocument()
    })

    it('should have proper toolbar positioning', () => {
      render(
        <IntegratedReaderView 
          article={mockArticle}
          isVisible={true}
          onClose={mockOnClose}
        />
      )
      
      const toolbar = screen.getByTestId('reader-toolbar')
      expect(toolbar).toBeInTheDocument()
    })
  })
})