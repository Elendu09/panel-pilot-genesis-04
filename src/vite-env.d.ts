/// <reference types="vite/client" />

// requestIdleCallback types for browsers that support it
interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

interface IdleRequestOptions {
  timeout?: number;
}

interface Window {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadline) => void,
    options?: IdleRequestOptions
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
}
