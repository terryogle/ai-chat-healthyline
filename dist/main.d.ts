import { createApp } from 'vue';
import { ChatOptions } from './types';

/**
 * Crea il widget di chat
 */
export declare function createChat(options: ChatOptions): {
    unmount: () => void;
    _app: ReturnType<typeof createApp>;
    _container: Element;
};
export type { ChatOptions, ChatMessage } from './types';
export * from './components';
