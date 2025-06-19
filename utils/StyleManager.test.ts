import { describe, it, expect, beforeEach, vi } from "vitest";
import { StyleManager } from "./StyleManager";

// Mock Vanilla Extract imports for testing
vi.mock("../assets/css-variables", () => ({
  cssVariables: {
    "--reader-bg-color": "var(--mock-bg-color)",
    "--reader-text-color": "var(--mock-text-color)",
    "--reader-font-size": "var(--mock-font-size)",
    "--reader-font-family": "var(--mock-font-family)",
  },
  themeVariables: {
    light: {
      "--reader-bg-color": "#ffffff",
      "--reader-text-color": "#000000",
    },
    dark: {
      "--reader-bg-color": "#1a1a1a",
      "--reader-text-color": "#e0e0e0",
    },
    sepia: {
      "--reader-bg-color": "#f7f3e9",
      "--reader-text-color": "#5c4b37",
    },
  },
  fontSizeVariables: {
    small: { "--reader-font-size": "14px" },
    medium: { "--reader-font-size": "16px" },
    large: { "--reader-font-size": "18px" },
    "font-large": { "--reader-font-size": "18px" },
  },
  fontFamilyVariables: {
    serif: { "--reader-font-family": "serif" },
    sansSerif: { "--reader-font-family": "sans-serif" },
    monospace: { "--reader-font-family": "monospace" },
    "font-serif": {
      "--reader-font-family": 'Georgia, "Times New Roman", serif',
    },
  },
  readerVars: {
    backgroundColor: "--mock-bg-color",
    textColor: "--mock-text-color",
    fontSize: "--mock-font-size",
    fontFamily: "--mock-font-family",
  },
  themes: {
    light: "mock-light-theme",
    dark: "mock-dark-theme",
    sepia: "mock-sepia-theme",
  },
  fontSizes: {
    large: "18px",
  },
  fontFamilies: {
    serif: 'Georgia, "Times New Roman", serif',
  },
}));

describe("StyleManager", () => {
  let styleManager: StyleManager;

  beforeEach(() => {
    // Clear any existing styles
    const existingStyles = document.querySelectorAll("style[data-reader-view]");
    existingStyles.forEach((style) => style.remove());

    styleManager = new StyleManager();
  });

  describe("injectStyles", () => {
    it("should inject CSS styles into the document", () => {
      const cssContent = ".test { color: red; }";

      styleManager.injectStyles(cssContent);

      const injectedStyle = document.querySelector("style[data-reader-view]");
      expect(injectedStyle).toBeTruthy();
      expect(injectedStyle?.textContent).toBe(cssContent);
    });

    it("should replace existing styles when called multiple times", () => {
      const firstCSS = ".test1 { color: red; }";
      const secondCSS = ".test2 { color: blue; }";

      styleManager.injectStyles(firstCSS);
      styleManager.injectStyles(secondCSS);

      const styles = document.querySelectorAll("style[data-reader-view]");
      expect(styles).toHaveLength(1);
      expect(styles[0].textContent).toBe(secondCSS);
    });
  });

  describe("removeStyles", () => {
    it("should remove injected styles from the document", () => {
      const cssContent = ".test { color: red; }";

      styleManager.injectStyles(cssContent);
      expect(document.querySelector("style[data-reader-view]")).toBeTruthy();

      styleManager.removeStyles();
      expect(document.querySelector("style[data-reader-view]")).toBeFalsy();
    });

    it("should handle removing styles when none exist", () => {
      expect(() => styleManager.removeStyles()).not.toThrow();
    });
  });

  describe("generateCustomCSS", () => {
    it("should generate CSS with custom variables", () => {
      const customStyles = {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f0f0f0",
        textColor: "#333333",
      };

      const css = styleManager.generateCustomCSS(customStyles);

      expect(css).toContain("--reader-font-size: 18px");
      expect(css).toContain("--reader-font-family: Arial, sans-serif");
      expect(css).toContain("--reader-bg-color: #f0f0f0");
      expect(css).toContain("--reader-text-color: #333333");
    });

    it("should use default values when custom styles are not provided", () => {
      const css = styleManager.generateCustomCSS({});

      expect(css).toContain("--reader-font-size: 16px");
      expect(css).toContain("--reader-font-family: system-ui");
      expect(css).toContain("--reader-bg-color: #ffffff");
      expect(css).toContain("--reader-text-color: #000000");
    });

    it("should generate CSS with theme classes", () => {
      const customStyles = {
        theme: "dark" as const,
      };

      const css = styleManager.generateCustomCSS(customStyles);

      expect(css).toContain(".reader-view-container.theme-dark");
    });

    it("should generate CSS with font size classes", () => {
      const customStyles = {
        fontSizeClass: "font-large" as const,
      };

      const css = styleManager.generateCustomCSS(customStyles);

      expect(css).toContain(".reader-view-container.font-large");
    });
  });

  describe("loadBaseStyles", () => {
    it("should load base CSS file content", async () => {
      const baseCSS = await styleManager.loadBaseStyles();

      expect(baseCSS).toBeTruthy();
      expect(typeof baseCSS).toBe("string");
      expect(baseCSS).toContain(".reader-view-container");
    });
  });

  describe("applyCustomStyles", () => {
    it("should apply modern styles using Vanilla Extract", async () => {
      const customStyles = {
        fontSize: "20px",
        theme: "dark" as const,
      };

      await styleManager.applyCustomStyles(customStyles);

      // Check that theme class is applied to document element
      expect(
        document.documentElement.classList.contains("mock-dark-theme"),
      ).toBe(true);

      // Check that CSS variables are set
      const fontSize = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--mock-font-size");
      expect(fontSize.trim()).toBe("20px");
    });
  });

  describe("updateCSSVariable", () => {
    it("should set a single CSS variable on document root", () => {
      styleManager.updateCSSVariable("--reader-bg-color", "#ff0000");

      const value = getComputedStyle(document.documentElement).getPropertyValue(
        "--reader-bg-color",
      );
      expect(value.trim()).toBe("#ff0000");
    });

    it("should update existing CSS variable", () => {
      styleManager.updateCSSVariable("--reader-bg-color", "#ff0000");
      styleManager.updateCSSVariable("--reader-bg-color", "#00ff00");

      const value = getComputedStyle(document.documentElement).getPropertyValue(
        "--reader-bg-color",
      );
      expect(value.trim()).toBe("#00ff00");
    });
  });

  describe("updateCSSVariables", () => {
    it("should set multiple CSS variables at once", () => {
      const variables = {
        "--reader-bg-color": "#f0f0f0",
        "--reader-text-color": "#333333",
        "--reader-font-size": "18px",
      };

      styleManager.updateCSSVariables(variables);

      const bgColor = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--reader-bg-color");
      const textColor = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--reader-text-color");
      const fontSize = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--reader-font-size");

      expect(bgColor.trim()).toBe("#f0f0f0");
      expect(textColor.trim()).toBe("#333333");
      expect(fontSize.trim()).toBe("18px");
    });

    it("should handle empty variables object", () => {
      expect(() => styleManager.updateCSSVariables({})).not.toThrow();
    });
  });

  describe("getCSSVariable", () => {
    it("should retrieve CSS variable value", () => {
      document.documentElement.style.setProperty(
        "--reader-bg-color",
        "test-value",
      );

      const value = styleManager.getCSSVariable("--reader-bg-color");
      expect(value).toBe("test-value");
    });

    it("should return empty string for non-existent variable", () => {
      // Clear any existing CSS variables first
      document.documentElement.style.removeProperty("--reader-font-size");

      const value = styleManager.getCSSVariable("--reader-font-size");
      expect(value).toBe("");
    });
  });

  describe("removeCSSVariable", () => {
    it("should remove CSS variable from document root", () => {
      document.documentElement.style.setProperty(
        "--reader-bg-color",
        "remove-me",
      );
      expect(styleManager.getCSSVariable("--reader-bg-color")).toBe(
        "remove-me",
      );

      styleManager.removeCSSVariable("--reader-bg-color");
      expect(styleManager.getCSSVariable("--reader-bg-color")).toBe("");
    });

    it("should handle removing non-existent variable", () => {
      expect(() =>
        styleManager.removeCSSVariable("--reader-text-color"),
      ).not.toThrow();
    });
  });

  describe("applyTheme", () => {
    it("should apply light theme variables", () => {
      styleManager.applyTheme("light");

      const bgColor = styleManager.getCSSVariable("--reader-bg-color");
      const textColor = styleManager.getCSSVariable("--reader-text-color");

      expect(bgColor).toBe("#ffffff");
      expect(textColor).toBe("#000000");
    });

    it("should apply dark theme variables", () => {
      styleManager.applyTheme("dark");

      const bgColor = styleManager.getCSSVariable("--reader-bg-color");
      const textColor = styleManager.getCSSVariable("--reader-text-color");

      expect(bgColor).toBe("#1a1a1a");
      expect(textColor).toBe("#e0e0e0");
    });

    it("should apply sepia theme variables", () => {
      styleManager.applyTheme("sepia");

      const bgColor = styleManager.getCSSVariable("--reader-bg-color");
      const textColor = styleManager.getCSSVariable("--reader-text-color");

      expect(bgColor).toBe("#f7f3e9");
      expect(textColor).toBe("#5c4b37");
    });
  });

  describe("applyFontSize", () => {
    it("should apply font size class variables", () => {
      styleManager.applyFontSize("font-large");

      const fontSize = styleManager.getCSSVariable("--reader-font-size");
      expect(fontSize).toBe("18px");
    });
  });

  describe("applyFontFamily", () => {
    it("should apply font family class variables", () => {
      styleManager.applyFontFamily("font-serif");

      const fontFamily = styleManager.getCSSVariable("--reader-font-family");
      expect(fontFamily).toBe('Georgia, "Times New Roman", serif');
    });
  });

  describe("resetToDefaults", () => {
    it("should call updateCSSVariables with default values", () => {
      const spy = vi.spyOn(styleManager, "updateCSSVariables");

      styleManager.resetToDefaults();

      expect(spy).toHaveBeenCalledWith({
        "--reader-bg-color": "var(--mock-bg-color)",
        "--reader-text-color": "var(--mock-text-color)",
        "--reader-font-size": "var(--mock-font-size)",
        "--reader-font-family": "var(--mock-font-family)",
      });
    });
  });

  describe("getDefaultVariables", () => {
    it("should return default CSS variables object", () => {
      const defaults = styleManager.getDefaultVariables();
      expect(defaults).toEqual({
        "--reader-bg-color": "var(--mock-bg-color)",
        "--reader-text-color": "var(--mock-text-color)",
        "--reader-font-size": "var(--mock-font-size)",
        "--reader-font-family": "var(--mock-font-family)",
      });
    });
  });

  describe("Vanilla Extract methods", () => {
    describe("applyVanillaTheme", () => {
      it("should apply theme class to document element", () => {
        styleManager.applyVanillaTheme("dark");

        expect(
          document.documentElement.classList.contains("mock-dark-theme"),
        ).toBe(true);
        expect(
          document.documentElement.classList.contains("mock-light-theme"),
        ).toBe(false);
      });

      it("should replace existing theme classes", () => {
        // Clear any existing classes first
        document.documentElement.className = "";

        styleManager.applyVanillaTheme("light");
        styleManager.applyVanillaTheme("sepia");

        expect(
          document.documentElement.classList.contains("mock-sepia-theme"),
        ).toBe(true);
        expect(
          document.documentElement.classList.contains("mock-light-theme"),
        ).toBe(false);
        expect(
          document.documentElement.classList.contains("mock-dark-theme"),
        ).toBe(false);
      });
    });

    describe("updateVanillaVariable", () => {
      it("should update a vanilla extract CSS variable", () => {
        styleManager.updateVanillaVariable("backgroundColor", "#ff0000");

        const value = getComputedStyle(
          document.documentElement,
        ).getPropertyValue("--mock-bg-color");
        expect(value.trim()).toBe("#ff0000");
      });
    });

    describe("updateVanillaVariables", () => {
      it("should update multiple vanilla extract variables", () => {
        const variables = {
          backgroundColor: "#f0f0f0",
          textColor: "#333333",
          fontSize: "18px",
        };

        styleManager.updateVanillaVariables(variables);

        const bgColor = getComputedStyle(
          document.documentElement,
        ).getPropertyValue("--mock-bg-color");
        const textColor = getComputedStyle(
          document.documentElement,
        ).getPropertyValue("--mock-text-color");
        const fontSize = getComputedStyle(
          document.documentElement,
        ).getPropertyValue("--mock-font-size");

        expect(bgColor.trim()).toBe("#f0f0f0");
        expect(textColor.trim()).toBe("#333333");
        expect(fontSize.trim()).toBe("18px");
      });
    });

    describe("getVanillaVariable", () => {
      it("should retrieve vanilla extract variable value", () => {
        document.documentElement.style.setProperty(
          "--mock-bg-color",
          "test-value",
        );

        const value = styleManager.getVanillaVariable("backgroundColor");
        expect(value).toBe("test-value");
      });
    });

    describe("removeVanillaVariable", () => {
      it("should remove vanilla extract variable", () => {
        document.documentElement.style.setProperty(
          "--mock-bg-color",
          "remove-me",
        );
        expect(styleManager.getVanillaVariable("backgroundColor")).toBe(
          "remove-me",
        );

        styleManager.removeVanillaVariable("backgroundColor");
        expect(styleManager.getVanillaVariable("backgroundColor")).toBe("");
      });
    });

    describe("applyFontSizeBySize", () => {
      it("should apply font size using FontSize type", () => {
        styleManager.applyFontSizeBySize("large");

        const fontSize = styleManager.getVanillaVariable("fontSize");
        expect(fontSize).toBe("18px");
      });
    });

    describe("applyFontFamilyByFamily", () => {
      it("should apply font family using FontFamily type", () => {
        styleManager.applyFontFamilyByFamily("serif");

        const fontFamily = styleManager.getVanillaVariable("fontFamily");
        expect(fontFamily).toBe('Georgia, "Times New Roman", serif');
      });
    });
  });
});
