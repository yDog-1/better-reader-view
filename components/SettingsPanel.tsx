import React from "react";
import {
  settingsPanelVisible,
  settingsPanelHidden,
  header,
  title,
  closeButton,
  content,
  section,
  sectionTitle,
  buttonGroup,
  button,
  buttonActive,
  darkTheme,
  sepiaTheme,
  lightTheme,
} from "../assets/settings-panel.css";
import { type Settings } from "../types";

interface SettingsPanelProps {
  isVisible: boolean;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isVisible,
  settings,
  onSettingsChange,
  onClose,
}) => {
  const fontSizeOptions = [
    { label: "Small", value: "14px" },
    { label: "Medium", value: "16px" },
    { label: "Large", value: "18px" },
    { label: "X-Large", value: "20px" },
  ];

  const fontFamilyOptions = [
    { label: "Serif", value: "serif" },
    { label: "Sans-serif", value: "sans-serif" },
    { label: "Monospace", value: "monospace" },
  ];

  const themeOptions = [
    { label: "Light", value: "light" as const },
    { label: "Dark", value: "dark" as const },
    { label: "Sepia", value: "sepia" as const },
  ];

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  // テーマに基づくクラス選択
  const getThemeClass = () => {
    switch (settings.theme) {
      case "dark":
        return darkTheme;
      case "sepia":
        return sepiaTheme;
      case "light":
      default:
        return lightTheme;
    }
  };

  const panelClass = `${isVisible ? settingsPanelVisible : settingsPanelHidden} ${getThemeClass()}`;

  return (
    <div data-testid="settings-panel" className={panelClass}>
      <div className={header}>
        <h3 className={title}>Reader Settings</h3>
        <button
          className={closeButton}
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>
      </div>

      <div className={content}>
        {/* Font Size Section */}
        <div className={section}>
          <div className={sectionTitle}>Font Size</div>
          <div className={buttonGroup}>
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                className={
                  settings.fontSize === option.value ? buttonActive : button
                }
                onClick={() => handleSettingChange("fontSize", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Section */}
        <div className={section}>
          <div className={sectionTitle}>Font Family</div>
          <div className={buttonGroup}>
            {fontFamilyOptions.map((option) => (
              <button
                key={option.value}
                className={
                  settings.fontFamily === option.value ? buttonActive : button
                }
                onClick={() => handleSettingChange("fontFamily", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Section */}
        <div className={section}>
          <div className={sectionTitle}>Theme</div>
          <div className={buttonGroup}>
            {themeOptions.map((option) => (
              <button
                key={option.value}
                className={
                  settings.theme === option.value ? buttonActive : button
                }
                onClick={() => handleSettingChange("theme", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
