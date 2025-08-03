import '@testing-library/jest-dom';
import { JSDOM } from 'jsdom';

// Set up JSDOM for Node environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

// Set up DOM globals
Object.defineProperty(globalThis, 'document', {
  value: dom.window.document,
  writable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: dom.window,
  writable: true,
});

Object.defineProperty(globalThis, 'HTMLElement', {
  value: dom.window.HTMLElement,
  writable: true,
});

Object.defineProperty(globalThis, 'Event', {
  value: dom.window.Event,
  writable: true,
});

Object.defineProperty(globalThis, 'DOMParser', {
  value: dom.window.DOMParser,
  writable: true,
});

Object.defineProperty(globalThis, 'location', {
  value: dom.window.location,
  writable: true,
});

Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  writable: true,
});

// Ensure TextEncoder/TextDecoder are available
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}
