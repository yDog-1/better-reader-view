import "@testing-library/jest-dom";
import { fakeBrowser } from "wxt/testing";
import { beforeEach, vi } from "vitest";

// Mock Vanilla Extract CSS imports
vi.mock("../assets/css-variables", () => ({
  readerThemeVars: {
    color: {
      background: "var(--background)",
      text: "var(--text)",
      link: "var(--link)",
      linkHover: "var(--link-hover)",
      codeBg: "var(--code-bg)",
      codeText: "var(--code-text)",
      blockquoteBorder: "var(--blockquote-border)",
      blockquoteBg: "var(--blockquote-bg)",
    },
    font: {
      size: "var(--font-size)",
      family: "var(--font-family)",
      lineHeight: "var(--line-height)",
    },
    layout: {
      maxWidth: "var(--max-width)",
      padding: "var(--padding)",
      margin: "var(--margin)",
    },
  },
  lightTheme: "light-theme",
  darkTheme: "dark-theme",
  sepiaTheme: "sepia-theme",
}));

vi.mock("../assets/reader.css", () => ({
  readerContainer: "reader-container",
  readerContent: "reader-content",
  readerTitle: "reader-title",
  readerByline: "reader-byline",
  readerBody: "reader-body",
  closeButton: "close-button",
}));

vi.mock("../assets/settings-panel.css", () => ({
  settingsPanelVisible: "settings-panel-visible",
  settingsPanelHidden: "settings-panel-hidden",
  header: "header",
  title: "title",
  closeButton: "close-button",
  content: "content",
  section: "section",
  sectionTitle: "section-title",
  buttonGroup: "button-group",
  button: "button",
  buttonActive: "button-active",
  darkTheme: "dark-theme",
  sepiaTheme: "sepia-theme",
  lightTheme: "light-theme",
}));

vi.mock("../assets/popup.css", () => ({
  popupContainer: "popup-container",
  popupLight: "popup-light",
  popupDark: "popup-dark",
  popupSepia: "popup-sepia",
}));

// Reset fake browser before each test
beforeEach(() => {
  fakeBrowser.reset();
});
