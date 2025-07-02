import { describe, it, expect } from 'vitest';

describe('Basic Test Environment', () => {
  describe('テスト環境の基本動作確認', () => {
    it('基本的なアサーションが動作する', () => {
      expect(1 + 1).toBe(2);
      expect('hello').toBe('hello');
      expect([1, 2, 3]).toEqual([1, 2, 3]);
      expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
    });

    it('非同期テストが動作する', async () => {
      const promise = Promise.resolve('success');
      await expect(promise).resolves.toBe('success');
    });

    it('配列操作が正しく動作する', () => {
      const array = [1, 2, 3];
      expect(array).toHaveLength(3);
      expect(array).toContain(2);
      expect(array[1]).toBe(2);
    });

    it('オブジェクト操作が正しく動作する', () => {
      const obj = { name: 'test', value: 42 };
      expect(obj).toHaveProperty('name');
      expect(obj.name).toBe('test');
      expect(obj.value).toBe(42);
    });
  });

  describe('DOM環境の確認', () => {
    it('documentオブジェクトが利用可能', () => {
      expect(document).toBeDefined();
      expect(document.createElement).toBeDefined();
    });

    it('DOM要素の作成と操作が可能', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello World';
      div.className = 'test-class';

      expect(div.tagName).toBe('DIV');
      expect(div.textContent).toBe('Hello World');
      expect(div.className).toBe('test-class');
    });

    it('DOM要素のクエリが可能', () => {
      document.body.innerHTML = '<div id="test">Test Content</div>';

      const element = document.getElementById('test');
      expect(element).toBeTruthy();
      expect(element?.textContent).toBe('Test Content');

      // クリーンアップ
      document.body.innerHTML = '';
    });
  });

  describe('JavaScript基本機能の確認', () => {
    it('JSON操作が正しく動作する', () => {
      const obj = { test: 'value', number: 123 };
      const jsonString = JSON.stringify(obj);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(obj);
      expect(parsed.test).toBe('value');
      expect(parsed.number).toBe(123);
    });

    it('正規表現が正しく動作する', () => {
      const text = 'Hello World 123';
      const pattern = /\d+/;

      expect(pattern.test(text)).toBe(true);
      expect(text.match(pattern)?.[0]).toBe('123');
    });

    it('エラーハンドリングが正しく動作する', () => {
      expect(() => {
        throw new Error('Test error');
      }).toThrow('Test error');

      expect(() => {
        JSON.parse('invalid json');
      }).toThrow();
    });
  });
});
