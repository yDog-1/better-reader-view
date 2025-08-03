/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { WXTResourceManager } from '@/utils/WXTResourceManager';
import { WXTUIStateManager } from '@/utils/WXTUIStateManager';

// シンプルなContentScriptContextモック
const createMockContext = () => ({
  addEventListener: vi.fn(),
  setTimeout: vi.fn(() => 1),
  setInterval: vi.fn(() => 1),
  onInvalidated: vi.fn(),
});

describe('WXT統合テスト', () => {
  afterEach(() => {
    // 各テスト後にインスタンスをクリア
    WXTUIStateManager.clearAll();
  });

  describe('WXTResourceManager', () => {
    it('正常にインスタンスが作成される', () => {
      const mockContext = createMockContext();
      const manager = new WXTResourceManager(mockContext as any);

      expect(manager).toBeInstanceOf(WXTResourceManager);
    });

    it('イベントリスナーを追加できる', () => {
      const mockContext = createMockContext();
      const manager = new WXTResourceManager(mockContext as any);
      const mockElement = { addEventListener: vi.fn() } as any;
      const listener = vi.fn();

      manager.addEventListeners(mockElement, 'click', listener);

      expect(mockContext.addEventListener).toHaveBeenCalledWith(
        mockElement,
        'click',
        listener,
        undefined
      );
    });

    it('タイマーを追加できる', () => {
      const mockContext = createMockContext();
      const manager = new WXTResourceManager(mockContext as any);
      const callback = vi.fn();

      const timerId = manager.addTimer(callback, 1000);

      expect(mockContext.setTimeout).toHaveBeenCalledWith(callback, 1000);
      expect(timerId).toBe(1);
    });

    it('インターバルを追加できる', () => {
      const mockContext = createMockContext();
      const manager = new WXTResourceManager(mockContext as any);
      const callback = vi.fn();

      const intervalId = manager.addInterval(callback, 500);

      expect(mockContext.setInterval).toHaveBeenCalledWith(callback, 500);
      expect(intervalId).toBe(1);
    });

    it('クリーンアップハンドラーを追加できる', () => {
      const mockContext = createMockContext();
      const manager = new WXTResourceManager(mockContext as any);
      const cleanup = vi.fn();

      expect(() => manager.addCleanupHandler(cleanup)).not.toThrow();
      expect(manager.isValid()).toBe(true);
    });

    it('コンテキストを取得できる', () => {
      const mockContext = createMockContext();
      const manager = new WXTResourceManager(mockContext as any);

      expect(manager.getContext()).toBe(mockContext);
    });

    it('registerCleanupエイリアスが動作する', () => {
      const mockContext = createMockContext();
      const manager = new WXTResourceManager(mockContext as any);
      const cleanup = vi.fn();

      expect(() => manager.registerCleanup(cleanup)).not.toThrow();
    });
  });

  describe('WXTUIStateManager', () => {
    it('インスタンスを作成できる', () => {
      const mockContext = createMockContext();
      const factory = vi.fn(() => ({ test: 'value' }));

      const instance = WXTUIStateManager.createInstance(
        'test',
        mockContext as any,
        factory
      );

      expect(factory).toHaveBeenCalledOnce();
      expect(instance).toEqual({ test: 'value' });
      expect(mockContext.onInvalidated).toHaveBeenCalled();
    });

    it('同じ名前で呼び出すと同じインスタンスが返される', () => {
      const mockContext = createMockContext();
      const factory = vi.fn(() => ({ test: 'value' }));

      const instance1 = WXTUIStateManager.createInstance(
        'test',
        mockContext as any,
        factory
      );
      const instance2 = WXTUIStateManager.createInstance(
        'test',
        mockContext as any,
        factory
      );

      expect(factory).toHaveBeenCalledOnce();
      expect(instance1).toBe(instance2);
    });

    it('インスタンスの存在を確認できる', () => {
      const mockContext = createMockContext();

      expect(WXTUIStateManager.hasInstance('test')).toBe(false);

      WXTUIStateManager.createInstance('test', mockContext as any, () => ({
        test: 'value',
      }));

      expect(WXTUIStateManager.hasInstance('test')).toBe(true);
    });

    it('インスタンスを削除できる', () => {
      const mockContext = createMockContext();

      WXTUIStateManager.createInstance('test', mockContext as any, () => ({
        test: 'value',
      }));

      expect(WXTUIStateManager.hasInstance('test')).toBe(true);

      WXTUIStateManager.removeInstance('test');

      expect(WXTUIStateManager.hasInstance('test')).toBe(false);
    });

    it('全てのインスタンスをクリアできる', () => {
      const mockContext = createMockContext();

      WXTUIStateManager.createInstance('test1', mockContext as any, () => ({
        test: 'value1',
      }));
      WXTUIStateManager.createInstance('test2', mockContext as any, () => ({
        test: 'value2',
      }));

      expect(WXTUIStateManager.hasInstance('test1')).toBe(true);
      expect(WXTUIStateManager.hasInstance('test2')).toBe(true);

      WXTUIStateManager.clearAll();

      expect(WXTUIStateManager.hasInstance('test1')).toBe(false);
      expect(WXTUIStateManager.hasInstance('test2')).toBe(false);
    });
  });
});
