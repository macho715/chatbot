import '@testing-library/jest-dom';

// React Hook 테스트를 위한 설정
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // React Hook 관련 경고 무시
    if (
      /Warning.*not wrapped in act/.test(args[0]) ||
      /Warning.*ReactDOM.render is deprecated/.test(args[0]) ||
      /Warning.*componentWillReceiveProps has been renamed/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// React 17 Hook 테스트를 위한 설정
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

afterAll(() => {
  console.error = originalError;
});
