import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';

interface StyleProviderProps {
  children: React.ReactNode;
  container: HTMLElement;
  ctx?: ContentScriptContext;
}

const ShadowRootContext = createContext<ShadowRoot | null>(null);

export const useShadowRoot = () => {
  const context = useContext(ShadowRootContext);
  return context;
};

export const StyleProvider: React.FC<StyleProviderProps> = ({
  children,
  container,
  ctx,
}) => {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    // WXT Shadow DOMの場合、containerの親がShadowRoot
    const root = container.getRootNode();
    if (root instanceof ShadowRoot) {
      setShadowRoot(root);
    }

    // ContentScriptContextが提供された場合、無効化時のクリーンアップを設定
    if (ctx) {
      ctx.onInvalidated(() => {
        setShadowRoot(null);
      });
    }
  }, [container, ctx]);

  return (
    <ShadowRootContext.Provider value={shadowRoot}>
      {children}
    </ShadowRootContext.Provider>
  );
};
