// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// react-router v7 references TextEncoder/TextDecoder, which the jsdom test
// environment bundled with react-scripts 5 doesn't provide globally.
import { TextEncoder, TextDecoder } from 'util';
if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
  (global as any).TextDecoder = TextDecoder;
}

// jsdom doesn't implement IntersectionObserver (used by the landing page's
// scroll-reveal animations) — stub it out so components that create one
// during mount don't throw in tests.
if (typeof (global as any).IntersectionObserver === 'undefined') {
  (global as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
