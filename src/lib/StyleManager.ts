interface CustomStyles {
  fontSize?: string
  fontFamily?: string
  backgroundColor?: string
  textColor?: string
  theme?: 'light' | 'dark' | 'sepia'
  fontSizeClass?: 'font-small' | 'font-medium' | 'font-large' | 'font-xlarge'
  fontFamilyClass?: 'font-serif' | 'font-sans' | 'font-mono'
}

export class StyleManager {
  private readonly STYLE_ID = 'reader-view-styles'

  injectStyles(cssContent: string): void {
    // Remove existing styles
    this.removeStyles()
    
    // Create and inject new styles
    const styleElement = document.createElement('style')
    styleElement.setAttribute('data-reader-view', 'true')
    styleElement.id = this.STYLE_ID
    styleElement.textContent = cssContent
    
    document.head.appendChild(styleElement)
  }

  removeStyles(): void {
    const existingStyle = document.getElementById(this.STYLE_ID)
    if (existingStyle) {
      existingStyle.remove()
    }
    
    // Also remove any styles with the data attribute
    const allReaderStyles = document.querySelectorAll('style[data-reader-view]')
    allReaderStyles.forEach(style => style.remove())
  }

  generateCustomCSS(customStyles: CustomStyles): string {
    const {
      fontSize = '16px',
      fontFamily = 'system-ui, -apple-system, sans-serif',
      backgroundColor = '#ffffff',
      textColor = '#000000',
      theme,
      fontSizeClass,
      fontFamilyClass
    } = customStyles

    let css = `
      :root {
        --reader-font-size: ${fontSize};
        --reader-font-family: ${fontFamily};
        --reader-bg-color: ${backgroundColor};
        --reader-text-color: ${textColor};
      }
    `

    // Add theme-specific overrides
    if (theme) {
      css += `
        .reader-view-container.theme-${theme} {
          /* Theme-specific variables will be applied from base CSS */
        }
      `
    }

    // Add font size class overrides
    if (fontSizeClass) {
      css += `
        .reader-view-container.${fontSizeClass} {
          /* Font size class variables will be applied from base CSS */
        }
      `
    }

    // Add font family class overrides
    if (fontFamilyClass) {
      css += `
        .reader-view-container.${fontFamilyClass} {
          /* Font family class variables will be applied from base CSS */
        }
      `
    }

    return css
  }

  async loadBaseStyles(): Promise<string> {
    // In a real implementation, this would load from the CSS file
    // For testing, we'll return a mock CSS content
    return `
      .reader-view-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: var(--reader-bg-color);
        color: var(--reader-text-color);
        font-family: var(--reader-font-family);
        font-size: var(--reader-font-size);
        z-index: 999999;
      }
      
      .reader-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      
      .reader-title {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 0.5em;
      }
    `
  }

  async applyCustomStyles(customStyles: CustomStyles): Promise<void> {
    const baseCSS = await this.loadBaseStyles()
    const customCSS = this.generateCustomCSS(customStyles)
    const combinedCSS = baseCSS + '\n' + customCSS
    
    this.injectStyles(combinedCSS)
  }

  getAppliedClasses(customStyles: CustomStyles): string[] {
    const classes: string[] = ['reader-view-container']
    
    if (customStyles.theme) {
      classes.push(`theme-${customStyles.theme}`)
    }
    
    if (customStyles.fontSizeClass) {
      classes.push(customStyles.fontSizeClass)
    }
    
    if (customStyles.fontFamilyClass) {
      classes.push(customStyles.fontFamilyClass)
    }
    
    return classes
  }
}