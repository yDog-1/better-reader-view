import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SettingsStorage } from './SettingsStorage'

describe('SettingsStorage', () => {
  let settingsStorage: SettingsStorage

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    settingsStorage = new SettingsStorage()
  })

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const settings = {
        fontSize: '18px',
        fontFamily: 'serif',
        theme: 'dark' as const,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0'
      }

      settingsStorage.saveSettings(settings)

      const saved = localStorage.getItem('readerViewSettings')
      expect(saved).toBeTruthy()
      expect(JSON.parse(saved!)).toEqual(settings)
    })

    it('should overwrite existing settings', () => {
      const firstSettings = {
        fontSize: '16px',
        fontFamily: 'sans-serif',
        theme: 'light' as const,
        backgroundColor: '#ffffff',
        textColor: '#000000'
      }

      const secondSettings = {
        fontSize: '20px',
        fontFamily: 'serif',
        theme: 'sepia' as const,
        backgroundColor: '#f7f3e9',
        textColor: '#5c4b37'
      }

      settingsStorage.saveSettings(firstSettings)
      settingsStorage.saveSettings(secondSettings)

      const saved = localStorage.getItem('readerViewSettings')
      expect(JSON.parse(saved!)).toEqual(secondSettings)
    })
  })

  describe('loadSettings', () => {
    it('should load settings from localStorage', () => {
      const settings = {
        fontSize: '18px',
        fontFamily: 'serif',
        theme: 'dark' as const,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0'
      }

      localStorage.setItem('readerViewSettings', JSON.stringify(settings))

      const loaded = settingsStorage.loadSettings()
      expect(loaded).toEqual(settings)
    })

    it('should return default settings when no settings exist', () => {
      const loaded = settingsStorage.loadSettings()
      
      expect(loaded).toEqual({
        fontSize: '16px',
        fontFamily: 'serif',
        theme: 'light',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      })
    })

    it('should return default settings when localStorage contains invalid JSON', () => {
      localStorage.setItem('readerViewSettings', 'invalid json')

      const loaded = settingsStorage.loadSettings()
      
      expect(loaded).toEqual({
        fontSize: '16px',
        fontFamily: 'serif',
        theme: 'light',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      })
    })

    it('should merge partial settings with defaults', () => {
      const partialSettings = {
        fontSize: '20px',
        theme: 'dark' as const
      }

      localStorage.setItem('readerViewSettings', JSON.stringify(partialSettings))

      const loaded = settingsStorage.loadSettings()
      
      expect(loaded).toEqual({
        fontSize: '20px',
        fontFamily: 'serif',
        theme: 'dark',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      })
    })
  })

  describe('getDefaultSettings', () => {
    it('should return consistent default settings', () => {
      const defaults1 = settingsStorage.getDefaultSettings()
      const defaults2 = settingsStorage.getDefaultSettings()
      
      expect(defaults1).toEqual(defaults2)
      expect(defaults1).toEqual({
        fontSize: '16px',
        fontFamily: 'serif',
        theme: 'light',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      })
    })
  })

  describe('resetSettings', () => {
    it('should remove settings from localStorage', () => {
      const settings = {
        fontSize: '18px',
        fontFamily: 'serif',
        theme: 'dark' as const,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0'
      }

      settingsStorage.saveSettings(settings)
      expect(localStorage.getItem('readerViewSettings')).toBeTruthy()

      settingsStorage.resetSettings()
      expect(localStorage.getItem('readerViewSettings')).toBeNull()
    })

    it('should return default settings after reset', () => {
      const settings = {
        fontSize: '18px',
        fontFamily: 'serif',
        theme: 'dark' as const,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0'
      }

      settingsStorage.saveSettings(settings)
      settingsStorage.resetSettings()

      const loaded = settingsStorage.loadSettings()
      expect(loaded).toEqual(settingsStorage.getDefaultSettings())
    })
  })

  describe('error handling', () => {
    it('should handle localStorage quota exceeded error', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new DOMException('QuotaExceededError')
      })

      const settings = {
        fontSize: '18px',
        fontFamily: 'serif',
        theme: 'dark' as const,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0'
      }

      expect(() => settingsStorage.saveSettings(settings)).not.toThrow()

      // Restore original method
      localStorage.setItem = originalSetItem
    })

    it('should handle localStorage access errors', () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage access error')
      })

      const loaded = settingsStorage.loadSettings()
      expect(loaded).toEqual(settingsStorage.getDefaultSettings())

      // Restore original method
      localStorage.getItem = originalGetItem
    })
  })
})