import * as CSSVars from "../assets/css-variables";

interface Settings {
  fontSize: string;
  fontFamily: string;
  theme: CSSVars.Theme;
  backgroundColor: string;
  textColor: string;
}

export class SettingsStorage {
  private readonly STORAGE_KEY = "readerViewSettings";

  private defaultSettings: Settings = {
    fontSize: CSSVars.fontSizes.medium,
    fontFamily: CSSVars.fontFamilies.serif,
    theme: "light",
    backgroundColor: "#ffffff",
    textColor: "#000000",
  };

  saveSettings(settings: Settings): void {
    try {
      const settingsJson = JSON.stringify(settings);
      localStorage.setItem(this.STORAGE_KEY, settingsJson);
    } catch {
      console.warn("Failed to save reader view settings");
      // Handle storage quota exceeded or other storage errors gracefully
    }
  }

  loadSettings(): Settings {
    try {
      const settingsJson = localStorage.getItem(this.STORAGE_KEY);

      if (!settingsJson) {
        return { ...this.defaultSettings };
      }

      const savedSettings = JSON.parse(settingsJson);

      // Merge saved settings with defaults to handle missing properties
      return {
        ...this.defaultSettings,
        ...savedSettings,
      };
    } catch {
      console.warn("Failed to load reader view settings, using defaults");
      return { ...this.defaultSettings };
    }
  }

  getDefaultSettings(): Settings {
    return { ...this.defaultSettings };
  }

  resetSettings(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      console.warn("Failed to reset reader view settings");
    }
  }

  // Utility method to update specific setting
  updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ): Settings {
    const currentSettings = this.loadSettings();
    const updatedSettings = {
      ...currentSettings,
      [key]: value,
    };

    this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  // Check if settings exist in storage
  hasStoredSettings(): boolean {
    try {
      return localStorage.getItem(this.STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  // Export settings as JSON string for backup/sharing
  exportSettings(): string {
    const settings = this.loadSettings();
    return JSON.stringify(settings, null, 2);
  }

  // Import settings from JSON string
  importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson);

      // Validate that imported settings have the correct structure
      if (this.isValidSettings(settings)) {
        this.saveSettings(settings);
        return true;
      }

      return false;
    } catch {
      console.warn("Failed to import settings");
      return false;
    }
  }

  private isValidSettings(obj: unknown): obj is Settings {
    if (!obj || typeof obj !== "object") {
      return false;
    }

    const requiredKeys: (keyof Settings)[] = [
      "fontSize",
      "fontFamily",
      "theme",
      "backgroundColor",
      "textColor",
    ];

    return requiredKeys.every((key) => key in obj);
  }
}
