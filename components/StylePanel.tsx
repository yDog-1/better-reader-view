import React, { useState } from 'react';
import {
  StyleController,
  ThemeType,
  FontSize,
  FontFamily,
} from '../utils/StyleController';

// Z-index constant for style panel to ensure it appears above other content
const STYLE_PANEL_Z_INDEX = 2147483649;

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

  // Inline styles for Shadow DOM compatibility
  const panelStyles: React.CSSProperties = {
    position: 'fixed',
    top: '60px',
    right: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    minWidth: '200px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: STYLE_PANEL_Z_INDEX,
    fontFamily: '"Hiragino Sans", "Yu Gothic UI", sans-serif',
    fontSize: '14px',
    color: '#333333',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '8px',
  };

  const controlGroupStyles: React.CSSProperties = {
    marginBottom: '12px',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '500',
  };

  const selectStyles: React.CSSProperties = {
    width: '100%',
    padding: '4px 8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
  };

  const buttonStyles: React.CSSProperties = {
    padding: '6px 12px',
    marginRight: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    fontSize: '14px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  };

  const closeButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: '#0066cc',
    color: '#ffffff',
    border: '1px solid #0066cc',
  };

  return (
    <div style={panelStyles}>
      <div style={titleStyles}>スタイル設定</div>

      <div style={controlGroupStyles}>
        <label style={labelStyles}>テーマ</label>
        <select
          style={selectStyles}
          value={config.theme}
          onChange={(e) => handleThemeChange(e.target.value as ThemeType)}
        >
          <option value="light">ライト</option>
          <option value="dark">ダーク</option>
          <option value="sepia">セピア</option>
        </select>
      </div>

      <div style={controlGroupStyles}>
        <label style={labelStyles}>フォントサイズ</label>
        <select
          style={selectStyles}
          value={config.fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value as FontSize)}
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
          <option value="xlarge">特大</option>
        </select>
      </div>

      <div style={controlGroupStyles}>
        <label style={labelStyles}>フォント種類</label>
        <select
          style={selectStyles}
          value={config.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value as FontFamily)}
        >
          <option value="sans-serif">ゴシック体</option>
          <option value="serif">明朝体</option>
          <option value="monospace">等幅フォント</option>
        </select>
      </div>

      <div>
        <button style={buttonStyles} onClick={handleReset}>
          リセット
        </button>
        <button style={closeButtonStyles} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
};

export default StylePanel;
