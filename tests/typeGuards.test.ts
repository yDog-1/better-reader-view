import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import ReactDOM from 'react-dom/client';
import {
  isValidDocument,
  isReactRoot,
  hasShadowRoot,
  isValidHTMLElement,
  canAttachShadow,
} from '~/utils/typeGuards';

describe('typeGuards', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.ShadowRoot = dom.window.ShadowRoot;
  });

  describe('isValidDocument', () => {
    it('有効なDocumentの場合はtrueを返す', () => {
      expect(isValidDocument(document)).toBe(true);
    });

    it('nullの場合はfalseを返す', () => {
      expect(isValidDocument(null)).toBe(false);
    });

    it('undefinedの場合はfalseを返す', () => {
      expect(isValidDocument(undefined)).toBe(false);
    });

    it('bodyプロパティがないオブジェクトの場合はfalseを返す', () => {
      const invalidDoc = { notBody: null };
      expect(isValidDocument(invalidDoc)).toBe(false);
    });

    it('bodyがHTMLElementでない場合はfalseを返す', () => {
      const invalidDoc = { body: 'not an element' };
      expect(isValidDocument(invalidDoc)).toBe(false);
    });

    it('createElementメソッドがない場合はfalseを返す', () => {
      const invalidDoc = { body: document.body };
      expect(isValidDocument(invalidDoc)).toBe(false);
    });
  });

  describe('isReactRoot', () => {
    it('有効なReactRootの場合はtrueを返す', () => {
      const div = document.createElement('div');
      const root = ReactDOM.createRoot(div);
      expect(isReactRoot(root)).toBe(true);
    });

    it('nullの場合はfalseを返す', () => {
      expect(isReactRoot(null)).toBe(false);
    });

    it('undefinedの場合はfalseを返す', () => {
      expect(isReactRoot(undefined)).toBe(false);
    });

    it('unmountメソッドがないオブジェクトの場合はfalseを返す', () => {
      const invalidRoot = { render: () => {} };
      expect(isReactRoot(invalidRoot)).toBe(false);
    });

    it('renderメソッドがないオブジェクトの場合はfalseを返す', () => {
      const invalidRoot = { unmount: () => {} };
      expect(isReactRoot(invalidRoot)).toBe(false);
    });

    it('メソッドが関数でない場合はfalseを返す', () => {
      const invalidRoot = {
        unmount: 'not a function',
        render: 'not a function',
      };
      expect(isReactRoot(invalidRoot)).toBe(false);
    });
  });

  describe('hasShadowRoot', () => {
    it('shadowRootを持つHTMLElementの場合はtrueを返す', () => {
      const div = document.createElement('div');
      div.attachShadow({ mode: 'open' });
      expect(hasShadowRoot(div)).toBe(true);
    });

    it('shadowRootを持たないHTMLElementの場合はfalseを返す', () => {
      const div = document.createElement('div');
      expect(hasShadowRoot(div)).toBe(false);
    });
  });

  describe('isValidHTMLElement', () => {
    it('HTMLElementの場合はtrueを返す', () => {
      const div = document.createElement('div');
      expect(isValidHTMLElement(div)).toBe(true);
    });

    it('nullの場合はfalseを返す', () => {
      expect(isValidHTMLElement(null)).toBe(false);
    });

    it('undefinedの場合はfalseを返す', () => {
      expect(isValidHTMLElement(undefined)).toBe(false);
    });

    it('文字列の場合はfalseを返す', () => {
      expect(isValidHTMLElement('not an element')).toBe(false);
    });
  });

  describe('canAttachShadow', () => {
    it('attachShadowメソッドを持つHTMLElementの場合はtrueを返す', () => {
      const div = document.createElement('div');
      expect(canAttachShadow(div)).toBe(true);
    });

    it('HTMLElementでない場合はfalseを返す', () => {
      expect(canAttachShadow(null)).toBe(false);
      expect(canAttachShadow('not an element')).toBe(false);
    });
  });
});
