import { ref } from 'vue';
import { ChatOptions } from '../types';

export declare const OptionsSymbol: unique symbol;
/**
 * Composable per accedere alle opzioni della chat
 * @returns Oggetto di opzioni della chat
 */
export declare function useOptions(): ReturnType<typeof ref<ChatOptions>>;
