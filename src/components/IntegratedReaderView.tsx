import React, { useState, useEffect } from 'react'
import { ReaderView } from './ReaderView'
import { SettingsPanel } from './SettingsPanel'
import { SettingsStorage } from '../lib/SettingsStorage'

interface Article {
  title: string
  content: string
  textContent: string
  length: number
  excerpt: string
  byline: string
  dir: string
  siteName: string
  lang: string
}

interface Settings {
  fontSize: string
  fontFamily: string
  theme: 'light' | 'dark' | 'sepia'
  backgroundColor: string
  textColor: string
}

interface IntegratedReaderViewProps {
  article: Article
  isVisible: boolean
  onClose: () => void
}

export const IntegratedReaderView: React.FC<IntegratedReaderViewProps> = ({
  article,
  isVisible,
  onClose
}) => {
  const [settings, setSettings] = useState<Settings>({
    fontSize: '16px',
    fontFamily: 'serif',
    theme: 'light',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  })
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [settingsStorage] = useState(() => new SettingsStorage())

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = settingsStorage.loadSettings()
    setSettings(loadedSettings)
  }, [settingsStorage])

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSettingsPanelVisible) {
          setIsSettingsPanelVisible(false)
        } else {
          onClose()
        }
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, isSettingsPanelVisible, onClose])

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings)
    settingsStorage.saveSettings(newSettings)
  }

  const handleToggleSettings = () => {
    setIsSettingsPanelVisible(!isSettingsPanelVisible)
  }

  const handleCloseSettings = () => {
    setIsSettingsPanelVisible(false)
  }

  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    display: 'flex',
    gap: '10px',
    zIndex: 1000001,
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none'
  }

  const buttonStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease'
  }

  const buttonHoverStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'rgba(0, 0, 0, 0.9)'
  }

  return (
    <div data-testid="integrated-reader-view" style={{ display: isVisible ? 'block' : 'none' }}>
      {/* Toolbar */}
      <div data-testid="reader-toolbar" style={toolbarStyle}>
        <button
          style={buttonStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
          onClick={handleToggleSettings}
          aria-label="Settings"
        >
          ⚙️ Settings
        </button>
        <button
          style={buttonStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
          onClick={onClose}
          aria-label="Close reader"
        >
          ✕ Close
        </button>
      </div>

      {/* Reader View */}
      <ReaderView
        article={article}
        isVisible={isVisible}
        customStyles={settings}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isVisible={isSettingsPanelVisible}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={handleCloseSettings}
      />
    </div>
  )
}