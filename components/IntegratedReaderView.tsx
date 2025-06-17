import React, { useState, useEffect } from "react";
import { ReaderView } from "./ReaderView";
import { SettingsPanel } from "./SettingsPanel";
import { SettingsStorage } from "../utils/SettingsStorage";
import { closeButton } from "../assets/reader.css";
import {
  integratedReaderContainerVisible,
  integratedReaderContainerHidden,
  toolbarVisible,
  toolbarHidden,
  settingsButton,
  closeToolbarButton,
} from "../assets/integrated-reader.css";

interface Article {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
}

interface Settings {
  fontSize: string;
  fontFamily: string;
  theme: "light" | "dark" | "sepia";
  backgroundColor: string;
  textColor: string;
}

interface IntegratedReaderViewProps {
  article: Article;
  isVisible: boolean;
  onClose: () => void;
}

export const IntegratedReaderView: React.FC<IntegratedReaderViewProps> = ({
  article,
  isVisible,
  onClose,
}) => {
  const [settings, setSettings] = useState<Settings>({
    fontSize: "16px",
    fontFamily: "serif",
    theme: "light",
    backgroundColor: "#ffffff",
    textColor: "#000000",
  });
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [settingsStorage] = useState(() => new SettingsStorage());

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = settingsStorage.loadSettings();
    setSettings(loadedSettings);
  }, [settingsStorage]);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isSettingsPanelVisible) {
          setIsSettingsPanelVisible(false);
        } else {
          onClose();
        }
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isVisible, isSettingsPanelVisible, onClose]);

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
    settingsStorage.saveSettings(newSettings);
  };

  const handleToggleSettings = () => {
    setIsSettingsPanelVisible(!isSettingsPanelVisible);
  };

  const handleCloseSettings = () => {
    setIsSettingsPanelVisible(false);
  };

  // クラス名の動的生成
  const containerClass = isVisible
    ? integratedReaderContainerVisible
    : integratedReaderContainerHidden;
  const toolbarClass = isVisible ? toolbarVisible : toolbarHidden;

  return (
    <div data-testid="integrated-reader-view" className={containerClass}>
      {/* Toolbar */}
      <div data-testid="reader-toolbar" className={toolbarClass}>
        <button
          className={settingsButton}
          onClick={handleToggleSettings}
          aria-label="Settings"
        >
          ⚙️ Settings
        </button>
        <button
          className={`${closeToolbarButton} ${closeButton}`}
          onClick={onClose}
          aria-label="Close reader"
        >
          ✕
        </button>
      </div>

      {/* Reader View */}
      <ReaderView
        article={article}
        isVisible={isVisible}
        customStyles={settings}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isVisible={isSettingsPanelVisible}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={handleCloseSettings}
      />
    </div>
  );
};
