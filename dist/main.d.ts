import { createApp } from 'vue';
import { ChatOptions } from './types';

/**
 * Automatically injects the widget stylesheet (widget.css) if not already
 * loaded into the host page.
 */
export declare function ensureWidgetCssLoaded(): void;
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
