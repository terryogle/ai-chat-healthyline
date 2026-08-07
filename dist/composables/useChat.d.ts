import { Chat } from '../types';

export declare const ChatSymbol: unique symbol;
/**
 * Composable per accedere allo stato della chat
 * @returns Stato globale della chat
 */
export declare function useChat(): Chat;
