import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { StyleController } from '@/utils/StyleController';
import { StyleSheetManager } from '@/utils/StyleSheetManager';
import {
  StyleProviderError,
  ShadowDOMError,
  StyleSystemInitializationError,
  ErrorHandler,
  withErrorHandling,
} from '@/utils/errors';
import type { WXTResourceManager } from '@/utils/WXTResourceManager';

/**
 * StyleProviderのコンテキスト型定義
 */
interface StyleContextValue {
  styleController: StyleController;
  shadowRoot: RefObject<ShadowRoot | null>;
  styleSheetManager: StyleSheetManager | null;
}

/**
 * StyleProviderのProps型定義
 */
interface StyleProviderProps {
  children: ReactNode;
  styleController: StyleController;
  shadowRoot: ShadowRoot;
  resourceManager?: WXTResourceManager;
}

// React Context作成
const StyleContext = createContext<StyleContextValue | null>(null);

/**
 * WXT Shadow DOM対応のStyleProvider
 * Shadow DOM環境でのスタイル管理とReactコンポーネント統合を提供
 */
export function StyleProvider({
  children,
  styleController,
  shadowRoot,
  resourceManager,
}: StyleProviderProps): React.ReactElement {
  const shadowRootRef = useRef<ShadowRoot | null>(shadowRoot);
  const styleSheetManagerRef = useRef<StyleSheetManager | null>(null);

  // StyleSheetManagerの初期化
  useEffect(() => {
    const initializeStyleSheetManager = withErrorHandling(
      () => {
        if (!shadowRootRef.current) {
          throw new ShadowDOMError('Shadow DOMが利用できません');
        }

        // StyleSheetManagerを作成
        const manager = new StyleSheetManager(shadowRootRef.current);
        styleSheetManagerRef.current = manager;

        // StyleControllerとの連携
        styleController.updateStyleSheetManager(manager);

        // リソースクリーンアップの登録
        if (resourceManager) {
          resourceManager.registerCleanup(() => {
            try {
              manager.cleanup();
              styleSheetManagerRef.current = null;
            } catch (error) {
              console.error('StyleSheetManagerクリーンアップエラー:', error);
            }
          });
        }

        return manager;
      },
      (cause) =>
        new StyleSystemInitializationError('StyleSheetManagerの初期化', cause)
    );

    if (!initializeStyleSheetManager) {
      ErrorHandler.handle(
        new StyleSystemInitializationError(
          'StyleSheetManagerの初期化に失敗しました'
        )
      );
      return;
    }

    // クリーンアップ関数
    return () => {
      if (styleSheetManagerRef.current) {
        try {
          styleSheetManagerRef.current.cleanup();
          styleSheetManagerRef.current = null;
        } catch (error) {
          console.error(
            'StyleProvider unmount時のクリーンアップエラー:',
            error
          );
        }
      }
    };
  }, [styleController, resourceManager]);

  // スタイルの初期適用
  useEffect(() => {
    const applyInitialStyles = withErrorHandling(
      () => {
        if (!styleSheetManagerRef.current) {
          return false;
        }

        // 現在のテーマとフォント設定を適用
        styleController.applyCurrentStyle();
        return true;
      },
      (cause) => new StyleProviderError('初期スタイル適用', cause)
    );

    if (!applyInitialStyles) {
      ErrorHandler.handle(
        new StyleProviderError('初期スタイルの適用に失敗しました')
      );
    }
  }, [styleController]);

  // コンテキスト値の作成
  const contextValue: StyleContextValue = {
    styleController,
    shadowRoot: shadowRootRef,
    styleSheetManager: styleSheetManagerRef.current,
  };

  return (
    <StyleContext.Provider value={contextValue}>
      {children}
    </StyleContext.Provider>
  );
}

/**
 * StyleContextを使用するためのカスタムフック
 */
export function useStyleContext(): StyleContextValue {
  const context = useContext(StyleContext);

  if (!context) {
    const error = new StyleProviderError(
      'useStyleContextはStyleProvider内で使用する必要があります'
    );
    ErrorHandler.handle(error);
    throw error;
  }

  return context;
}

/**
 * StyleControllerのみを取得するカスタムフック
 */
export function useStyleController(): StyleController {
  const { styleController } = useStyleContext();
  return styleController;
}

/**
 * Shadow Rootのみを取得するカスタムフック
 */
export function useShadowRoot(): ShadowRoot | null {
  const { shadowRoot } = useStyleContext();
  return shadowRoot.current;
}

/**
 * StyleSheetManagerのみを取得するカスタムフック
 */
export function useStyleSheetManager(): StyleSheetManager | null {
  const { styleSheetManager } = useStyleContext();
  return styleSheetManager;
}

export default StyleProvider;
