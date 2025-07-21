import React, { useState } from 'react';
import {
  StyleController,
  FontSize,
  FontFamily,
} from '../utils/StyleController';
import { ThemeDefinition } from '../utils/types';
import {
  StorageError,
  RenderingError,
  withErrorHandling,
} from '../utils/errors';
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
      withErrorHandling(
        () => {
          styleController.setTheme(themeId);
          setConfig(styleController.getConfig());
          return true;
        },
        (cause) => new RenderingError('StylePanel theme change', cause)
      );

      await withErrorHandling(
        () => styleController.saveToStorage(),
        (cause) => new StorageError('save theme setting', cause)
      );

      onStyleChange();
    })();
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    void (async () => {
      withErrorHandling(
        () => {
          styleController.setFontSize(fontSize);
          setConfig(styleController.getConfig());
          return true;
        },
        (cause) => new RenderingError('StylePanel font size change', cause)
      );

      await withErrorHandling(
        () => styleController.saveToStorage(),
        (cause) => new StorageError('save font size setting', cause)
      );

      onStyleChange();
    })();
  };

  const handleFontFamilyChange = (fontFamily: FontFamily) => {
    void (async () => {
      withErrorHandling(
        () => {
          styleController.setFontFamily(fontFamily);
          setConfig(styleController.getConfig());
          return true;
        },
        (cause) => new RenderingError('StylePanel font family change', cause)
      );

      await withErrorHandling(
        () => styleController.saveToStorage(),
        (cause) => new StorageError('save font family setting', cause)
      );

      onStyleChange();
    })();
  };

  const handleReset = () => {
    void (async () => {
      await withErrorHandling(
        () => styleController.reset(),
        (cause) => new StorageError('reset settings', cause)
      );

      withErrorHandling(
        () => {
          setConfig(styleController.getConfig());
          return true;
        },
        (cause) => new RenderingError('StylePanel reset', cause)
      );

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
          {withErrorHandling(
            () => styleController.getAvailableThemes(),
            (cause) =>
              new RenderingError('StylePanel get available themes', cause)
          )?.map((theme: ThemeDefinition) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          )) || []}
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
          <option value="extra-large">特大</option>
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
