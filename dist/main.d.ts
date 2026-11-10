import { ChatOptions } from './types';

export declare function ensureWidgetCssLoaded(): void;
export declare function createChat(_options: ChatOptions): {
    unmount: () => void;
    _app: any;
    _container: Element;
};
export type { ChatOptions, ChatMessage } from './types';
export * from './components';
