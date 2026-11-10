import type { ChatOptions } from './types';

export function ensureWidgetCssLoaded(): void {
  // disabled
}

export function createChat(_options: ChatOptions): {
  unmount: () => void;
  _app: any;
  _container: Element;
} {
  return {
    unmount: () => {},
    _app: null,
    _container: typeof document !== 'undefined' ? document.createElement('div') : ({} as Element),
  };
}

if (typeof window !== 'undefined') {
  (window as any).SimpleChatN8N = {
    createChat,
    ensureWidgetCssLoaded,
  };
}

export type { ChatOptions, ChatMessage } from './types';
export * from './components';
