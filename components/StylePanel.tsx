import React, { useState } from 'react';
import {
  StyleController,
  FontSize,
  FontFamily,
} from '../utils/StyleController';
import { ThemeDefinition } from '../utils/types';
import './StylePanel.css';

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

  const handleThemeChange = (themeId: string) => {
    void (async () => {
      styleController.setTheme(themeId);
      setConfig(styleController.getConfig());
      try {
        await styleController.saveToStorage();
      } catch (error) {
        console.warn('テーマ設定の保存に失敗しました:', error);
      }
      onStyleChange();
    })();
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    void (async () => {
      styleController.setFontSize(fontSize);
      setConfig(styleController.getConfig());
      try {
        await styleController.saveToStorage();
      } catch (error) {
        console.warn('フォントサイズ設定の保存に失敗しました:', error);
      }
      onStyleChange();
    })();
  };

  const handleFontFamilyChange = (fontFamily: FontFamily) => {
    void (async () => {
      styleController.setFontFamily(fontFamily);
      setConfig(styleController.getConfig());
      try {
        await styleController.saveToStorage();
      } catch (error) {
        console.warn('フォント種類設定の保存に失敗しました:', error);
      }
      onStyleChange();
    })();
  };

  const handleReset = () => {
    void (async () => {
      try {
        await styleController.reset();
      } catch (error) {
        console.warn('設定のリセットに失敗しました:', error);
      }
      setConfig(styleController.getConfig());
      onStyleChange();
    })();
  };

  return (
    <div className="style-panel">
      <div className="panel-title">スタイル設定</div>

      <div className="control-group">
        <label className="control-label">テーマ</label>
        <select
          className="control-select"
          value={config.theme}
          onChange={(e) => handleThemeChange(e.target.value)}
        >
          {styleController
            .getAvailableThemes()
            .map((theme: ThemeDefinition) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
        </select>
      </div>

      <div className="control-group">
        <label className="control-label">フォントサイズ</label>
        <select
          className="control-select"
          value={config.fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value as FontSize)}
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
          <option value="xlarge">特大</option>
        </select>
      </div>

      <div className="control-group">
        <label className="control-label">フォント種類</label>
        <select
          className="control-select"
          value={config.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value as FontFamily)}
        >
          <option value="sans-serif">ゴシック体</option>
          <option value="serif">明朝体</option>
          <option value="monospace">等幅フォント</option>
        </select>
      </div>

      <div>
        <button className="control-button" onClick={handleReset}>
          リセット
        </button>
        <button className="close-button" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
};

export default StylePanel;
