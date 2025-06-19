import * as CSSVars from "../assets/css-variables";

type CSSVariableKeys = CSSVars.CSSVariableKeys;
type Theme = CSSVars.Theme;
type FontSizeClass = CSSVars.FontSizeClass;
type FontFamilyClass = CSSVars.FontFamilyClass;
type FontSize = CSSVars.FontSize;
type FontFamily = CSSVars.FontFamily;

interface CustomStyles {
  fontSize?: string | FontSize;
  fontFamily?: string | FontFamily;
  backgroundColor?: string;
  textColor?: string;
  theme?: Theme;
  fontSizeClass?: FontSizeClass;
  fontFamilyClass?: FontFamilyClass;
}

export class StyleManager {
  private readonly STYLE_ID = "reader-view-styles";
  private currentThemeClass: string | null = null;

  // Apply Vanilla Extract theme classes directly to the document
  applyVanillaExtractTheme(theme: Theme): void {
    // Remove existing theme classes
    if (this.currentThemeClass) {
      document.documentElement.classList.remove(this.currentThemeClass);
    }

    // Apply new theme class
    const themeClass = CSSVars.themes[theme];
    document.documentElement.classList.add(themeClass);
    this.currentThemeClass = themeClass;
  }

  // Modern approach: Use CSS variables with Vanilla Extract contract
  applyThemeVariables(theme: Theme): void {
    // Apply theme class to enable contract variables
    this.applyVanillaExtractTheme(theme);

    // The theme contract will provide the values automatically
    // Individual variables can be overridden if needed using updateVanillaVariable
  }

  // Legacy method for backward compatibility - now uses Vanilla Extract
  injectStyles(cssContent: string): void {
    console.warn(
      "injectStyles is deprecated. Use applyVanillaExtractTheme instead.",
    );

    // Remove existing styles
    this.removeStyles();

    // For legacy compatibility, still create style element but prefer CSS variables
    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-reader-view", "true");
    styleElement.id = this.STYLE_ID;
    styleElement.textContent = cssContent;

    document.head.appendChild(styleElement);
  }

  removeStyles(): void {
    const existingStyle = document.getElementById(this.STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Remove theme classes
    if (this.currentThemeClass) {
      document.documentElement.classList.remove(this.currentThemeClass);
      this.currentThemeClass = null;
    }

    // Also remove any styles with the data attribute
    const allReaderStyles = document.querySelectorAll(
      "style[data-reader-view]",
    );
    allReaderStyles.forEach((style) => style.remove());
  }

  generateCustomCSS(customStyles: CustomStyles): string {
    const {
      fontSize = "16px",
      fontFamily = "system-ui, -apple-system, sans-serif",
      backgroundColor = "#ffffff",
      textColor = "#000000",
      theme,
      fontSizeClass,
      fontFamilyClass,
    } = customStyles;

    let css = `
      :root {
        --reader-font-size: ${fontSize};
        --reader-font-family: ${fontFamily};
        --reader-bg-color: ${backgroundColor};
        --reader-text-color: ${textColor};
      }
    `;

    // Add theme-specific overrides
    if (theme) {
      css += `
        .reader-view-container.theme-${theme} {
          /* Theme-specific variables will be applied from base CSS */
        }
      `;
    }

    // Add font size class overrides
    if (fontSizeClass) {
      css += `
        .reader-view-container.${fontSizeClass} {
          /* Font size class variables will be applied from base CSS */
        }
      `;
    }

    // Add font family class overrides
    if (fontFamilyClass) {
      css += `
        .reader-view-container.${fontFamilyClass} {
          /* Font family class variables will be applied from base CSS */
        }
      `;
    }

    return css;
  }

  // Modern method: Apply styles using Vanilla Extract variables
  async applyModernStyles(customStyles: CustomStyles): Promise<void> {
    // Apply theme using Vanilla Extract if specified
    if (customStyles.theme) {
      this.applyVanillaExtractTheme(customStyles.theme);
    }

    // Apply individual variable overrides
    if (customStyles.fontSize) {
      this.updateVanillaVariable("fontSize", customStyles.fontSize);
    }

    if (customStyles.fontFamily) {
      this.updateVanillaVariable("fontFamily", customStyles.fontFamily);
    }

    if (customStyles.backgroundColor) {
      this.updateVanillaVariable(
        "backgroundColor",
        customStyles.backgroundColor,
      );
    }

    if (customStyles.textColor) {
      this.updateVanillaVariable("textColor", customStyles.textColor);
    }
  }

  // Legacy compatibility methods
  async loadBaseStyles(): Promise<string> {
    console.warn(
      "loadBaseStyles is deprecated. Use applyModernStyles with Vanilla Extract instead.",
    );
    // Return base styles that use CSS variables compatible with Vanilla Extract
    return `
      .reader-view-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: ${CSSVars.readerVars.backgroundColor};
        color: ${CSSVars.readerVars.textColor};
        font-family: ${CSSVars.readerVars.fontFamily};
        font-size: ${CSSVars.readerVars.fontSize};
        z-index: 999999;
      }
      
      .reader-content {
        max-width: ${CSSVars.readerVars.maxWidth};
        margin: 0 auto;
        padding: ${CSSVars.readerVars.padding};
      }
      
      .reader-title {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 0.5em;
      }
    `;
  }

  async applyCustomStyles(customStyles: CustomStyles): Promise<void> {
    console.warn(
      "applyCustomStyles is deprecated. Use applyModernStyles instead.",
    );

    // Use modern approach for better performance
    await this.applyModernStyles(customStyles);
  }

  getAppliedClasses(customStyles: CustomStyles): string[] {
    const classes: string[] = ["reader-view-container"];

    if (customStyles.theme) {
      classes.push(`theme-${customStyles.theme}`);
    }

    if (customStyles.fontSizeClass) {
      classes.push(customStyles.fontSizeClass);
    }

    if (customStyles.fontFamilyClass) {
      classes.push(customStyles.fontFamilyClass);
    }

    return classes;
  }

  updateCSSVariable(variableName: CSSVariableKeys, value: string): void {
    document.documentElement.style.setProperty(variableName, value);
  }

  updateCSSVariables(
    variables: Partial<Record<CSSVariableKeys, string>>,
  ): void {
    const root = document.documentElement;

    Object.entries(variables).forEach(([variableName, value]) => {
      if (value !== undefined) {
        root.style.setProperty(variableName as CSSVariableKeys, value);
      }
    });
  }

  getCSSVariable(variableName: CSSVariableKeys): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  }

  removeCSSVariable(variableName: CSSVariableKeys): void {
    document.documentElement.style.removeProperty(variableName);
  }

  applyTheme(theme: Theme): void {
    const themeVars = CSSVars.themeVariables[theme];
    this.updateCSSVariables(themeVars);
  }

  applyFontSize(fontSizeClass: FontSizeClass): void {
    const fontSizeVars = CSSVars.fontSizeVariables[fontSizeClass];
    this.updateCSSVariables(fontSizeVars);
  }

  applyFontFamily(fontFamilyClass: FontFamilyClass): void {
    const fontFamilyVars = CSSVars.fontFamilyVariables[fontFamilyClass];
    this.updateCSSVariables(fontFamilyVars);
  }

  resetToDefaults(): void {
    this.updateCSSVariables(CSSVars.cssVariables);
  }

  getDefaultVariables(): typeof CSSVars.cssVariables {
    return CSSVars.cssVariables;
  }

  applyVanillaTheme(theme: Theme): void {
    console.warn(
      "applyVanillaTheme is deprecated. Use applyVanillaExtractTheme instead.",
    );
    this.applyVanillaExtractTheme(theme);
  }

  updateVanillaVariable(
    variableName: keyof typeof CSSVars.readerVars,
    value: string,
  ): void {
    const cssVar = CSSVars.readerVars[variableName];
    document.documentElement.style.setProperty(cssVar, value);
  }

  updateVanillaVariables(
    variables: Partial<Record<keyof typeof CSSVars.readerVars, string>>,
  ): void {
    Object.entries(variables).forEach(([key, value]) => {
      if (value !== undefined) {
        const cssVar =
          CSSVars.readerVars[key as keyof typeof CSSVars.readerVars];
        document.documentElement.style.setProperty(cssVar, value);
      }
    });
  }

  getVanillaVariable(variableName: keyof typeof CSSVars.readerVars): string {
    const cssVar = CSSVars.readerVars[variableName];
    return getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
  }

  removeVanillaVariable(variableName: keyof typeof CSSVars.readerVars): void {
    const cssVar = CSSVars.readerVars[variableName];
    document.documentElement.style.removeProperty(cssVar);
  }

  applyFontSizeBySize(fontSize: FontSize): void {
    const sizeValue = CSSVars.fontSizes[fontSize];
    this.updateVanillaVariable("fontSize", sizeValue);
  }

  applyFontFamilyByFamily(fontFamily: FontFamily): void {
    const familyValue = CSSVars.fontFamilies[fontFamily];
    this.updateVanillaVariable("fontFamily", familyValue);
  }
}
