import React, { useState } from 'react';
import {
  StyleController,
  ThemeType,
  FontSize,
  FontFamily,
} from '../utils/StyleController';
import {
  panel,
  panelTitle,
  controlGroup,
  label,
  select,
  button,
  closeButton,
} from './StylePanel.css';

export interface StylePanelProps {
  styleController: StyleController;
  onClose: () => void;
  onStyleChange: () => void;
}

const StylePanel: React.FC<StylePanelProps> = ({
  styleController,
  onClose,
  onStyleChange,
}) => {
  const [config, setConfig] = useState(styleController.getConfig());

  const handleThemeChange = (theme: ThemeType) => {
    styleController.setTheme(theme);
    setConfig(styleController.getConfig());
    styleController.saveToStorage();
    onStyleChange();
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    styleController.setFontSize(fontSize);
    setConfig(styleController.getConfig());
    styleController.saveToStorage();
    onStyleChange();
  };

  const handleFontFamilyChange = (fontFamily: FontFamily) => {
    styleController.setFontFamily(fontFamily);
    setConfig(styleController.getConfig());
    styleController.saveToStorage();
    onStyleChange();
  };

  const handleReset = () => {
    styleController.reset();
    setConfig(styleController.getConfig());
    onStyleChange();
  };

  return (
    <div className={panel}>
      <div className={panelTitle}>スタイル設定</div>

      <div className={controlGroup}>
        <label className={label} htmlFor="theme-select">
          テーマ
        </label>
        <select
          id="theme-select"
          className={select}
          value={config.theme}
          onChange={(e) => handleThemeChange(e.target.value as ThemeType)}
        >
          <option value="light">ライト</option>
          <option value="dark">ダーク</option>
          <option value="sepia">セピア</option>
        </select>
      </div>

      <div className={controlGroup}>
        <label className={label} htmlFor="font-size-select">
          フォントサイズ
        </label>
        <select
          id="font-size-select"
          className={select}
          value={config.fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value as FontSize)}
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
          <option value="xlarge">特大</option>
        </select>
      </div>

      <div className={controlGroup}>
        <label className={label} htmlFor="font-family-select">
          フォント種類
        </label>
        <select
          id="font-family-select"
          className={select}
          value={config.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value as FontFamily)}
        >
          <option value="sans-serif">ゴシック体</option>
          <option value="serif">明朝体</option>
          <option value="monospace">等幅フォント</option>
        </select>
      </div>

      <div>
        <button className={button} onClick={handleReset}>
          リセット
        </button>
        <button className={closeButton} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
};

export default StylePanel;
