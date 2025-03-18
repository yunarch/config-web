import '@total-typescript/ts-reset/dom';

declare module 'react' {
  // support css variables
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
