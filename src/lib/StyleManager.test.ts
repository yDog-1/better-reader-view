import { describe, it, expect, beforeEach } from 'vitest'
import { StyleManager } from './StyleManager'

describe('StyleManager', () => {
  let styleManager: StyleManager

  beforeEach(() => {
    // Clear any existing styles
    const existingStyles = document.querySelectorAll('style[data-reader-view]')
    existingStyles.forEach(style => style.remove())
    
    styleManager = new StyleManager()
  })

  describe('injectStyles', () => {
    it('should inject CSS styles into the document', () => {
      const cssContent = '.test { color: red; }'
      
      styleManager.injectStyles(cssContent)
      
      const injectedStyle = document.querySelector('style[data-reader-view]')
      expect(injectedStyle).toBeTruthy()
      expect(injectedStyle?.textContent).toBe(cssContent)
    })

    it('should replace existing styles when called multiple times', () => {
      const firstCSS = '.test1 { color: red; }'
      const secondCSS = '.test2 { color: blue; }'
      
      styleManager.injectStyles(firstCSS)
      styleManager.injectStyles(secondCSS)
      
      const styles = document.querySelectorAll('style[data-reader-view]')
      expect(styles).toHaveLength(1)
      expect(styles[0].textContent).toBe(secondCSS)
    })
  })

  describe('removeStyles', () => {
    it('should remove injected styles from the document', () => {
      const cssContent = '.test { color: red; }'
      
      styleManager.injectStyles(cssContent)
      expect(document.querySelector('style[data-reader-view]')).toBeTruthy()
      
      styleManager.removeStyles()
      expect(document.querySelector('style[data-reader-view]')).toBeFalsy()
    })

    it('should handle removing styles when none exist', () => {
      expect(() => styleManager.removeStyles()).not.toThrow()
    })
  })

  describe('generateCustomCSS', () => {
    it('should generate CSS with custom variables', () => {
      const customStyles = {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        textColor: '#333333'
      }
      
      const css = styleManager.generateCustomCSS(customStyles)
      
      expect(css).toContain('--reader-font-size: 18px')
      expect(css).toContain('--reader-font-family: Arial, sans-serif')
      expect(css).toContain('--reader-bg-color: #f0f0f0')
      expect(css).toContain('--reader-text-color: #333333')
    })

    it('should use default values when custom styles are not provided', () => {
      const css = styleManager.generateCustomCSS({})
      
      expect(css).toContain('--reader-font-size: 16px')
      expect(css).toContain('--reader-font-family: system-ui')
      expect(css).toContain('--reader-bg-color: #ffffff')
      expect(css).toContain('--reader-text-color: #000000')
    })

    it('should generate CSS with theme classes', () => {
      const customStyles = {
        theme: 'dark' as const
      }
      
      const css = styleManager.generateCustomCSS(customStyles)
      
      expect(css).toContain('.reader-view-container.theme-dark')
    })

    it('should generate CSS with font size classes', () => {
      const customStyles = {
        fontSizeClass: 'font-large' as const
      }
      
      const css = styleManager.generateCustomCSS(customStyles)
      
      expect(css).toContain('.reader-view-container.font-large')
    })
  })

  describe('loadBaseStyles', () => {
    it('should load base CSS file content', async () => {
      const baseCSS = await styleManager.loadBaseStyles()
      
      expect(baseCSS).toBeTruthy()
      expect(typeof baseCSS).toBe('string')
      expect(baseCSS).toContain('.reader-view-container')
    })
  })

  describe('applyCustomStyles', () => {
    it('should inject combined base and custom styles', async () => {
      const customStyles = {
        fontSize: '20px',
        theme: 'dark' as const
      }
      
      await styleManager.applyCustomStyles(customStyles)
      
      const injectedStyle = document.querySelector('style[data-reader-view]')
      expect(injectedStyle).toBeTruthy()
      expect(injectedStyle?.textContent).toContain('.reader-view-container')
      expect(injectedStyle?.textContent).toContain('--reader-font-size: 20px')
    })
  })
})