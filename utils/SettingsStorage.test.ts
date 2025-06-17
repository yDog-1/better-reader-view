import { describe, it, expect, beforeEach, vi } from "vitest";
import { SettingsStorage } from "./SettingsStorage";

// Test constants for default settings
const defaultSettings = {
  fontSize: "16px",
  fontFamily: "serif",
  theme: "light" as const,
  backgroundColor: "#ffffff",
  textColor: "#000000",
};

// Test constants for sample settings
const darkThemeSettings = {
  fontSize: "18px",
  fontFamily: "serif",
  theme: "dark" as const,
  backgroundColor: "#1a1a1a",
  textColor: "#e0e0e0",
};

const lightThemeSettings = {
  fontSize: "16px",
  fontFamily: "sans-serif",
  theme: "light" as const,
  backgroundColor: "#ffffff",
  textColor: "#000000",
};

const sepiaThemeSettings = {
  fontSize: "20px",
  fontFamily: "serif",
  theme: "sepia" as const,
  backgroundColor: "#f7f3e9",
  textColor: "#5c4b37",
};

describe("SettingsStorage", () => {
  let settingsStorage: SettingsStorage;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    settingsStorage = new SettingsStorage();
  });

  describe("saveSettings", () => {
    it("should save settings to localStorage", () => {
      settingsStorage.saveSettings(darkThemeSettings);

      const saved = localStorage.getItem("readerViewSettings");
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(darkThemeSettings);
    });

    it("should overwrite existing settings", () => {
      settingsStorage.saveSettings(lightThemeSettings);
      settingsStorage.saveSettings(sepiaThemeSettings);

      const saved = localStorage.getItem("readerViewSettings");
      expect(JSON.parse(saved!)).toEqual(sepiaThemeSettings);
    });
  });

  describe("loadSettings", () => {
    it("should load settings from localStorage", () => {
      localStorage.setItem(
        "readerViewSettings",
        JSON.stringify(darkThemeSettings),
      );

      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(darkThemeSettings);
    });

    it("should return default settings when no settings exist", () => {
      const loaded = settingsStorage.loadSettings();

      expect(loaded).toEqual(defaultSettings);
    });

    it("should return default settings when localStorage contains invalid JSON", () => {
      localStorage.setItem("readerViewSettings", "invalid json");

      const loaded = settingsStorage.loadSettings();

      expect(loaded).toEqual(defaultSettings);
    });

    it("should merge partial settings with defaults", () => {
      const partialSettings = {
        fontSize: "20px",
        theme: "dark" as const,
      };

      const expectedMergedSettings = {
        fontSize: "20px",
        fontFamily: "serif",
        theme: "dark" as const,
        backgroundColor: "#ffffff",
        textColor: "#000000",
      };

      localStorage.setItem(
        "readerViewSettings",
        JSON.stringify(partialSettings),
      );

      const loaded = settingsStorage.loadSettings();

      expect(loaded).toEqual(expectedMergedSettings);
    });
  });

  describe("getDefaultSettings", () => {
    it("should return consistent default settings", () => {
      const defaults1 = settingsStorage.getDefaultSettings();
      const defaults2 = settingsStorage.getDefaultSettings();

      expect(defaults1).toEqual(defaults2);
      expect(defaults1).toEqual(defaultSettings);
    });
  });

  describe("resetSettings", () => {
    it("should remove settings from localStorage", () => {
      settingsStorage.saveSettings(darkThemeSettings);
      expect(localStorage.getItem("readerViewSettings")).toBeTruthy();

      settingsStorage.resetSettings();
      expect(localStorage.getItem("readerViewSettings")).toBeNull();
    });

    it("should return default settings after reset", () => {
      settingsStorage.saveSettings(darkThemeSettings);
      settingsStorage.resetSettings();

      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(settingsStorage.getDefaultSettings());
    });
  });

  describe("error handling", () => {
    it("should handle localStorage quota exceeded error", () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });

      expect(() =>
        settingsStorage.saveSettings(darkThemeSettings),
      ).not.toThrow();

      // Restore original method
      localStorage.setItem = originalSetItem;
    });

    it("should handle localStorage access errors", () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error("Storage access error");
      });

      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(settingsStorage.getDefaultSettings());

      // Restore original method
      localStorage.getItem = originalGetItem;
    });

    it("should handle localStorage removeItem errors", () => {
      // Mock localStorage.removeItem to throw error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error("Remove access error");
      });

      // Should not throw when resetSettings is called
      expect(() => settingsStorage.resetSettings()).not.toThrow();

      // Restore original method
      localStorage.removeItem = originalRemoveItem;
    });

    it("should handle localStorage setItem DOMException", () => {
      // Mock localStorage.setItem to throw DOMException
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        const exception = new Error("QuotaExceededError");
        exception.name = "QuotaExceededError";
        throw exception;
      });

      expect(() =>
        settingsStorage.saveSettings(darkThemeSettings),
      ).not.toThrow();

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });

  describe("edge cases", () => {
    it("should handle null localStorage values", () => {
      // Mock localStorage.getItem to return null explicitly
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockReturnValue(null);

      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(defaultSettings);

      // Restore original method
      localStorage.getItem = originalGetItem;
    });

    it("should handle undefined localStorage values", () => {
      // Mock localStorage.getItem to return undefined
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockReturnValue(undefined);

      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(defaultSettings);

      // Restore original method
      localStorage.getItem = originalGetItem;
    });

    it("should handle corrupted JSON with syntax errors", () => {
      localStorage.setItem("readerViewSettings", "{invalid json syntax}");

      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(defaultSettings);
    });

    it("should handle JSON with wrong data types", () => {
      localStorage.setItem("readerViewSettings", "true"); // boolean instead of object

      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(defaultSettings);
    });

    it("should handle JSON with array instead of object", () => {
      localStorage.setItem("readerViewSettings", '["invalid", "array"]');

      const loaded = settingsStorage.loadSettings();
      // Array gets merged, adding array indices as properties
      expect(loaded).toEqual({
        ...defaultSettings,
        "0": "invalid",
        "1": "array",
      });
    });

    it("should merge settings with extra unknown properties", () => {
      const settingsWithExtra = {
        fontSize: "20px",
        theme: "dark" as const,
        unknownProperty: "should be ignored",
        anotherUnknown: 123,
      };

      localStorage.setItem(
        "readerViewSettings",
        JSON.stringify(settingsWithExtra),
      );

      const loaded = settingsStorage.loadSettings();

      // Should include known properties and merge with defaults, preserving extra properties
      expect(loaded).toEqual({
        fontSize: "20px",
        fontFamily: "serif", // from defaults
        theme: "dark",
        backgroundColor: "#ffffff", // from defaults
        textColor: "#000000", // from defaults
        unknownProperty: "should be ignored", // preserved
        anotherUnknown: 123, // preserved
      });
    });

    it("should handle settings with invalid enum values", () => {
      const invalidSettings = {
        fontSize: "20px",
        theme: "invalid-theme" as unknown as "light" | "dark" | "sepia", // invalid theme value
        fontFamily: "serif",
      };

      localStorage.setItem(
        "readerViewSettings",
        JSON.stringify(invalidSettings),
      );

      const loaded = settingsStorage.loadSettings();

      // Should merge with defaults, keeping valid values
      expect(loaded.fontSize).toBe("20px");
      expect(loaded.fontFamily).toBe("serif");
      // Invalid theme is preserved (implementation doesn't validate enum values)
      expect(loaded.theme).toBe("invalid-theme");
    });

    it("should handle empty object in localStorage", () => {
      localStorage.setItem("readerViewSettings", "{}");

      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(defaultSettings);
    });

    it("should handle partial settings with null values", () => {
      const partialSettingsWithNulls = {
        fontSize: null,
        theme: "dark" as const,
        backgroundColor: null,
      };

      localStorage.setItem(
        "readerViewSettings",
        JSON.stringify(partialSettingsWithNulls),
      );

      const loaded = settingsStorage.loadSettings();

      // Null values are preserved (implementation uses object spread)
      expect(loaded.fontSize).toBe(null);
      expect(loaded.theme).toBe("dark");
      expect(loaded.backgroundColor).toBe(null);
    });
  });

  describe("storage key consistency", () => {
    it("should use consistent storage key across all operations", () => {
      const storageKey = "readerViewSettings";

      // Save settings
      settingsStorage.saveSettings(darkThemeSettings);
      expect(localStorage.getItem(storageKey)).toBeTruthy();

      // Load settings
      const loaded = settingsStorage.loadSettings();
      expect(loaded).toEqual(darkThemeSettings);

      // Reset settings
      settingsStorage.resetSettings();
      expect(localStorage.getItem(storageKey)).toBeNull();
    });
  });

  describe("performance and memory", () => {
    it("should handle large number of save operations", () => {
      for (let i = 0; i < 100; i++) {
        const testSettings = {
          ...defaultSettings,
          fontSize: `${14 + i}px`,
        };
        expect(() => settingsStorage.saveSettings(testSettings)).not.toThrow();
      }

      const loaded = settingsStorage.loadSettings();
      expect(loaded.fontSize).toBe("113px"); // 14 + 99
    });

    it("should handle rapid consecutive operations", () => {
      // Rapid save/load cycles
      for (let i = 0; i < 10; i++) {
        settingsStorage.saveSettings(darkThemeSettings);
        const loaded = settingsStorage.loadSettings();
        expect(loaded).toEqual(darkThemeSettings);
      }
    });
  });

  describe("utility methods", () => {
    describe("updateSetting", () => {
      it("should update a single setting and return updated settings", () => {
        settingsStorage.saveSettings(defaultSettings);

        const updated = settingsStorage.updateSetting("fontSize", "20px");

        expect(updated.fontSize).toBe("20px");
        expect(updated.fontFamily).toBe(defaultSettings.fontFamily); // unchanged
        expect(updated.theme).toBe(defaultSettings.theme); // unchanged

        // Verify it was saved
        const loaded = settingsStorage.loadSettings();
        expect(loaded.fontSize).toBe("20px");
      });

      it("should update theme setting", () => {
        const updated = settingsStorage.updateSetting("theme", "dark");

        expect(updated.theme).toBe("dark");

        const loaded = settingsStorage.loadSettings();
        expect(loaded.theme).toBe("dark");
      });

      it("should work when no previous settings exist", () => {
        settingsStorage.resetSettings();

        const updated = settingsStorage.updateSetting(
          "backgroundColor",
          "#1a1a1a",
        );

        expect(updated.backgroundColor).toBe("#1a1a1a");
        // Should merge with defaults
        expect(updated.fontSize).toBe(defaultSettings.fontSize);
      });
    });

    describe("hasStoredSettings", () => {
      it("should return false when no settings are stored", () => {
        settingsStorage.resetSettings();

        expect(settingsStorage.hasStoredSettings()).toBe(false);
      });

      it("should return true when settings are stored", () => {
        settingsStorage.saveSettings(defaultSettings);

        expect(settingsStorage.hasStoredSettings()).toBe(true);
      });

      it("should handle localStorage access errors", () => {
        const originalGetItem = localStorage.getItem;
        localStorage.getItem = vi.fn().mockImplementation(() => {
          throw new Error("Storage access error");
        });

        expect(settingsStorage.hasStoredSettings()).toBe(false);

        localStorage.getItem = originalGetItem;
      });
    });

    describe("exportSettings", () => {
      it("should export current settings as formatted JSON", () => {
        settingsStorage.saveSettings(darkThemeSettings);

        const exported = settingsStorage.exportSettings();
        const parsed = JSON.parse(exported);

        expect(parsed).toEqual(darkThemeSettings);
        expect(exported).toContain("\n"); // Should be formatted
      });

      it("should export default settings when none are saved", () => {
        settingsStorage.resetSettings();

        const exported = settingsStorage.exportSettings();
        const parsed = JSON.parse(exported);

        expect(parsed).toEqual(defaultSettings);
      });
    });

    describe("importSettings", () => {
      it("should import valid settings from JSON string", () => {
        const importData = JSON.stringify(sepiaThemeSettings);

        const success = settingsStorage.importSettings(importData);

        expect(success).toBe(true);

        const loaded = settingsStorage.loadSettings();
        expect(loaded).toEqual(sepiaThemeSettings);
      });

      it("should reject invalid JSON", () => {
        const success = settingsStorage.importSettings("invalid json");

        expect(success).toBe(false);

        // Settings should remain unchanged
        const loaded = settingsStorage.loadSettings();
        expect(loaded).toEqual(defaultSettings);
      });

      it("should reject settings with missing required fields", () => {
        const incompleteSettings = {
          fontSize: "18px",
          // missing other required fields
        };

        const success = settingsStorage.importSettings(
          JSON.stringify(incompleteSettings),
        );

        expect(success).toBe(false);
      });

      it("should reject non-object data", () => {
        const nonObjectData = '"just a string"';

        const success = settingsStorage.importSettings(nonObjectData);

        expect(success).toBe(false);
      });

      it("should reject array data", () => {
        const arrayData = JSON.stringify(["not", "an", "object"]);

        const success = settingsStorage.importSettings(arrayData);

        expect(success).toBe(false);
      });

      it("should reject null data", () => {
        const nullData = JSON.stringify(null);

        const success = settingsStorage.importSettings(nullData);

        expect(success).toBe(false);
      });

      it("should accept extra properties in valid settings", () => {
        const settingsWithExtra = {
          ...darkThemeSettings,
          extraProperty: "ignored",
        };

        const success = settingsStorage.importSettings(
          JSON.stringify(settingsWithExtra),
        );

        expect(success).toBe(true);

        const loaded = settingsStorage.loadSettings();
        // Should have saved the valid parts
        expect(loaded.fontSize).toBe(darkThemeSettings.fontSize);
        expect(loaded.theme).toBe(darkThemeSettings.theme);
      });
    });
  });

  describe("private method validation", () => {
    // Access private method for testing via type assertion
    const getPrivateMethod = (instance: unknown, methodName: string) =>
      (instance as { [key: string]: unknown })[methodName] as (
        ...args: unknown[]
      ) => unknown;

    it("should validate correct settings structure", () => {
      const isValidSettings = getPrivateMethod(
        settingsStorage,
        "isValidSettings",
      );

      expect(isValidSettings(defaultSettings)).toBe(true);
      expect(isValidSettings(darkThemeSettings)).toBe(true);
    });

    it("should reject invalid settings structures", () => {
      const isValidSettings = getPrivateMethod(
        settingsStorage,
        "isValidSettings",
      );

      expect(isValidSettings(null)).toBe(false);
      expect(isValidSettings(undefined)).toBe(false);
      expect(isValidSettings("string")).toBe(false);
      expect(isValidSettings(123)).toBe(false);
      expect(isValidSettings([])).toBe(false);
      expect(isValidSettings({})).toBe(false); // missing required fields

      const incompleteSettings = {
        fontSize: "16px",
        // missing other required fields
      };
      expect(isValidSettings(incompleteSettings)).toBe(false);
    });
  });
});
