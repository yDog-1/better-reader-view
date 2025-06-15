import { describe, it, expect, beforeEach } from 'vitest'
import { StyleManager } from './StyleManager'
import { cssVariables, readerVars, themes } from '../styles/css-variables'

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

  describe('updateCSSVariable', () => {
    it('should set a single CSS variable on document root', () => {
      styleManager.updateCSSVariable('--reader-bg-color', '#ff0000')
      
      const value = getComputedStyle(document.documentElement).getPropertyValue('--reader-bg-color')
      expect(value.trim()).toBe('#ff0000')
    })

    it('should update existing CSS variable', () => {
      styleManager.updateCSSVariable('--reader-bg-color', '#ff0000')
      styleManager.updateCSSVariable('--reader-bg-color', '#00ff00')
      
      const value = getComputedStyle(document.documentElement).getPropertyValue('--reader-bg-color')
      expect(value.trim()).toBe('#00ff00')
    })
  })

  describe('updateCSSVariables', () => {
    it('should set multiple CSS variables at once', () => {
      const variables = {
        '--reader-bg-color': '#f0f0f0',
        '--reader-text-color': '#333333',
        '--reader-font-size': '18px'
      }
      
      styleManager.updateCSSVariables(variables)
      
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--reader-bg-color')
      const textColor = getComputedStyle(document.documentElement).getPropertyValue('--reader-text-color')
      const fontSize = getComputedStyle(document.documentElement).getPropertyValue('--reader-font-size')
      
      expect(bgColor.trim()).toBe('#f0f0f0')
      expect(textColor.trim()).toBe('#333333')
      expect(fontSize.trim()).toBe('18px')
    })

    it('should handle empty variables object', () => {
      expect(() => styleManager.updateCSSVariables({})).not.toThrow()
    })
  })

  describe('getCSSVariable', () => {
    it('should retrieve CSS variable value', () => {
      document.documentElement.style.setProperty('--reader-bg-color', 'test-value')
      
      const value = styleManager.getCSSVariable('--reader-bg-color')
      expect(value).toBe('test-value')
    })

    it('should return empty string for non-existent variable', () => {
      // Clear any existing CSS variables first
      document.documentElement.style.removeProperty('--reader-font-size')
      
      const value = styleManager.getCSSVariable('--reader-font-size')
      expect(value).toBe('')
    })
  })

  describe('removeCSSVariable', () => {
    it('should remove CSS variable from document root', () => {
      document.documentElement.style.setProperty('--reader-bg-color', 'remove-me')
      expect(styleManager.getCSSVariable('--reader-bg-color')).toBe('remove-me')
      
      styleManager.removeCSSVariable('--reader-bg-color')
      expect(styleManager.getCSSVariable('--reader-bg-color')).toBe('')
    })

    it('should handle removing non-existent variable', () => {
      expect(() => styleManager.removeCSSVariable('--reader-text-color')).not.toThrow()
    })
  })

  describe('applyTheme', () => {
    it('should apply light theme variables', () => {
      styleManager.applyTheme('light')
      
      const bgColor = styleManager.getCSSVariable('--reader-bg-color')
      const textColor = styleManager.getCSSVariable('--reader-text-color')
      
      expect(bgColor).toBe('#ffffff')
      expect(textColor).toBe('#333333')
    })

    it('should apply dark theme variables', () => {
      styleManager.applyTheme('dark')
      
      const bgColor = styleManager.getCSSVariable('--reader-bg-color')
      const textColor = styleManager.getCSSVariable('--reader-text-color')
      
      expect(bgColor).toBe('#1a1a1a')
      expect(textColor).toBe('#e0e0e0')
    })

    it('should apply sepia theme variables', () => {
      styleManager.applyTheme('sepia')
      
      const bgColor = styleManager.getCSSVariable('--reader-bg-color')
      const textColor = styleManager.getCSSVariable('--reader-text-color')
      
      expect(bgColor).toBe('#f4f1e8')
      expect(textColor).toBe('#5c4b37')
    })
  })

  describe('applyFontSize', () => {
    it('should apply font size class variables', () => {
      styleManager.applyFontSize('font-large')
      
      const fontSize = styleManager.getCSSVariable('--reader-font-size')
      expect(fontSize).toBe('18px')
    })
  })

  describe('applyFontFamily', () => {
    it('should apply font family class variables', () => {
      styleManager.applyFontFamily('font-serif')
      
      const fontFamily = styleManager.getCSSVariable('--reader-font-family')
      expect(fontFamily).toBe('Georgia, "Times New Roman", serif')
    })
  })

  describe('resetToDefaults', () => {
    it('should reset all variables to default values', () => {
      styleManager.updateCSSVariable('--reader-bg-color', '#custom')
      styleManager.resetToDefaults()
      
      const bgColor = styleManager.getCSSVariable('--reader-bg-color')
      expect(bgColor).toBe(cssVariables['--reader-bg-color'])
    })
  })

  describe('getDefaultVariables', () => {
    it('should return default CSS variables object', () => {
      const defaults = styleManager.getDefaultVariables()
      expect(defaults).toEqual(cssVariables)
    })
  })

  describe('Vanilla Extract methods', () => {
    describe('applyVanillaTheme', () => {
      it('should apply theme class to document body', () => {
        styleManager.applyVanillaTheme('dark')
        
        expect(document.body.classList.contains(themes.dark)).toBe(true)
        expect(document.body.classList.contains(themes.light)).toBe(false)
      })

      it('should replace existing theme classes', () => {
        styleManager.applyVanillaTheme('light')
        styleManager.applyVanillaTheme('sepia')
        
        expect(document.body.classList.contains(themes.sepia)).toBe(true)
        expect(document.body.classList.contains(themes.light)).toBe(false)
        expect(document.body.classList.contains(themes.dark)).toBe(false)
      })
    })

    describe('updateVanillaVariable', () => {
      it('should update a vanilla extract CSS variable', () => {
        styleManager.updateVanillaVariable('backgroundColor', '#ff0000')
        
        const value = getComputedStyle(document.documentElement).getPropertyValue(readerVars.backgroundColor)
        expect(value.trim()).toBe('#ff0000')
      })
    })

    describe('updateVanillaVariables', () => {
      it('should update multiple vanilla extract variables', () => {
        const variables = {
          backgroundColor: '#f0f0f0',
          textColor: '#333333',
          fontSize: '18px'
        }
        
        styleManager.updateVanillaVariables(variables)
        
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue(readerVars.backgroundColor)
        const textColor = getComputedStyle(document.documentElement).getPropertyValue(readerVars.textColor)
        const fontSize = getComputedStyle(document.documentElement).getPropertyValue(readerVars.fontSize)
        
        expect(bgColor.trim()).toBe('#f0f0f0')
        expect(textColor.trim()).toBe('#333333')
        expect(fontSize.trim()).toBe('18px')
      })
    })

    describe('getVanillaVariable', () => {
      it('should retrieve vanilla extract variable value', () => {
        document.documentElement.style.setProperty(readerVars.backgroundColor, 'test-value')
        
        const value = styleManager.getVanillaVariable('backgroundColor')
        expect(value).toBe('test-value')
      })
    })

    describe('removeVanillaVariable', () => {
      it('should remove vanilla extract variable', () => {
        document.documentElement.style.setProperty(readerVars.backgroundColor, 'remove-me')
        expect(styleManager.getVanillaVariable('backgroundColor')).toBe('remove-me')
        
        styleManager.removeVanillaVariable('backgroundColor')
        expect(styleManager.getVanillaVariable('backgroundColor')).toBe('')
      })
    })

    describe('applyFontSizeBySize', () => {
      it('should apply font size using FontSize type', () => {
        styleManager.applyFontSizeBySize('large')
        
        const fontSize = styleManager.getVanillaVariable('fontSize')
        expect(fontSize).toBe('18px')
      })
    })

    describe('applyFontFamilyByFamily', () => {
      it('should apply font family using FontFamily type', () => {
        styleManager.applyFontFamilyByFamily('serif')
        
        const fontFamily = styleManager.getVanillaVariable('fontFamily')
        expect(fontFamily).toBe('Georgia, "Times New Roman", serif')
      })
    })
  })
})