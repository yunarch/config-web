import { afterEach, vi } from 'vitest';

// Mocking console.log
export const consoleMock = vi.spyOn(console, 'log').mockImplementation(vi.fn());

// Mocking ora functions
export const oraSucceedMock = vi.fn();
export const oraFailMock = vi.fn();
vi.mock('ora', () => {
  return {
    default: vi.fn(() => ({
      start: vi.fn(),
      succeed: oraSucceedMock,
      fail: oraFailMock,
    })),
  };
});

// After each test
afterEach(() => {
  consoleMock.mockClear();
  oraSucceedMock.mockClear();
  oraFailMock.mockClear();
});
