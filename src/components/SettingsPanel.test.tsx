import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPanel } from './SettingsPanel'

describe('SettingsPanel', () => {
  const mockOnSettingsChange = vi.fn()
  
  const defaultSettings = {
    fontSize: '16px',
    fontFamily: 'serif',
    theme: 'light' as const,
    backgroundColor: '#ffffff',
    textColor: '#000000'
  }

  beforeEach(() => {
    mockOnSettingsChange.mockClear()
  })

  describe('rendering', () => {
    it('should render the settings panel', () => {
      render(
        <SettingsPanel 
          isVisible={true}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument()
      expect(screen.getByText('Reader Settings')).toBeInTheDocument()
    })

    it('should be hidden when isVisible is false', () => {
      render(
        <SettingsPanel 
          isVisible={false}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      const panel = screen.getByTestId('settings-panel')
      expect(panel).toHaveStyle({ display: 'none' })
    })
  })

  describe('font size controls', () => {
    it('should render font size buttons', () => {
      render(
        <SettingsPanel 
          isVisible={true}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      expect(screen.getByText('Small')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('Large')).toBeInTheDocument()
      expect(screen.getByText('X-Large')).toBeInTheDocument()
    })

    it('should call onSettingsChange when font size is changed', async () => {
      const user = userEvent.setup()
      
      render(
        <SettingsPanel 
          isVisible={true}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      await user.click(screen.getByText('Large'))
      
      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        fontSize: '18px'
      })
    })
  })

  describe('font family controls', () => {
    it('should render font family options', () => {
      render(
        <SettingsPanel 
          isVisible={true}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      expect(screen.getByText('Serif')).toBeInTheDocument()
      expect(screen.getByText('Sans-serif')).toBeInTheDocument()
      expect(screen.getByText('Monospace')).toBeInTheDocument()
    })

    it('should call onSettingsChange when font family is changed', async () => {
      const user = userEvent.setup()
      
      render(
        <SettingsPanel 
          isVisible={true}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      await user.click(screen.getByText('Sans-serif'))
      
      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        fontFamily: 'sans-serif'
      })
    })
  })

  describe('theme controls', () => {
    it('should render theme options', () => {
      render(
        <SettingsPanel 
          isVisible={true}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('Sepia')).toBeInTheDocument()
    })

    it('should call onSettingsChange when theme is changed', async () => {
      const user = userEvent.setup()
      
      render(
        <SettingsPanel 
          isVisible={true}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      await user.click(screen.getByText('Dark'))
      
      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        theme: 'dark'
      })
    })
  })

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const mockOnClose = vi.fn()
      const user = userEvent.setup()
      
      render(
        <SettingsPanel 
          isVisible={true}
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onClose={mockOnClose}
        />
      )
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('active state indication', () => {
    it('should indicate the currently selected font size', () => {
      const settingsWithLargeFont = {
        ...defaultSettings,
        fontSize: '18px'
      }
      
      render(
        <SettingsPanel 
          isVisible={true}
          settings={settingsWithLargeFont}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      const largeButton = screen.getByText('Large')
      expect(largeButton).toHaveClass('active')
    })

    it('should indicate the currently selected theme', () => {
      const settingsWithDarkTheme = {
        ...defaultSettings,
        theme: 'dark' as const
      }
      
      render(
        <SettingsPanel 
          isVisible={true}
          settings={settingsWithDarkTheme}
          onSettingsChange={mockOnSettingsChange}
          onClose={() => {}}
        />
      )
      
      const darkButton = screen.getByText('Dark')
      expect(darkButton).toHaveClass('active')
    })
  })
})