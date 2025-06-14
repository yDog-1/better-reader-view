import React from 'react'

interface Settings {
  fontSize: string
  fontFamily: string
  theme: 'light' | 'dark' | 'sepia'
  backgroundColor: string
  textColor: string
}

interface SettingsPanelProps {
  isVisible: boolean
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isVisible,
  settings,
  onSettingsChange,
  onClose
}) => {
  const fontSizeOptions = [
    { label: 'Small', value: '14px' },
    { label: 'Medium', value: '16px' },
    { label: 'Large', value: '18px' },
    { label: 'X-Large', value: '20px' }
  ]

  const fontFamilyOptions = [
    { label: 'Serif', value: 'serif' },
    { label: 'Sans-serif', value: 'sans-serif' },
    { label: 'Monospace', value: 'monospace' }
  ]

  const themeOptions = [
    { label: 'Light', value: 'light' as const },
    { label: 'Dark', value: 'dark' as const },
    { label: 'Sepia', value: 'sepia' as const }
  ]

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '300px',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000000,
    display: isVisible ? 'block' : 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }

  const headerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  }

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px'
  }

  const contentStyle: React.CSSProperties = {
    padding: '20px'
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: '20px'
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  }

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  }

  const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: isActive ? '#007acc' : '#f8f9fa',
    color: isActive ? '#ffffff' : '#333',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s ease'
  })

  return (
    <div data-testid="settings-panel" style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Reader Settings</h3>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>
      </div>
      
      <div style={contentStyle}>
        {/* Font Size Section */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Font Size</div>
          <div style={buttonGroupStyle}>
            {fontSizeOptions.map(option => (
              <button
                key={option.value}
                style={getButtonStyle(settings.fontSize === option.value)}
                className={settings.fontSize === option.value ? 'active' : ''}
                onClick={() => handleSettingChange('fontSize', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Section */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Font Family</div>
          <div style={buttonGroupStyle}>
            {fontFamilyOptions.map(option => (
              <button
                key={option.value}
                style={getButtonStyle(settings.fontFamily === option.value)}
                className={settings.fontFamily === option.value ? 'active' : ''}
                onClick={() => handleSettingChange('fontFamily', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Section */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Theme</div>
          <div style={buttonGroupStyle}>
            {themeOptions.map(option => (
              <button
                key={option.value}
                style={getButtonStyle(settings.theme === option.value)}
                className={settings.theme === option.value ? 'active' : ''}
                onClick={() => handleSettingChange('theme', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}