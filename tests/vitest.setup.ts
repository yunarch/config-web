import { afterEach, vi } from 'vitest';

export const consoleMock = vi.spyOn(console, 'log').mockImplementation(vi.fn());

vi.mock('ora', () => {
  return {
    default: vi.fn(() => ({
      start: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
    })),
  };
});

afterEach(() => {
  consoleMock.mockClear();
});
