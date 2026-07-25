import { ChatOptions, LoadPreviousSessionResponse, SendMessageResponse } from '../types';

export declare const LOCAL_STORAGE_SESSION_KEY = "tt-chat-n8n-session-id";
/**
 * Funzione per caricare la sessione precedente
 */
export declare function loadPreviousSession(sessionId: string, options: ChatOptions): Promise<LoadPreviousSessionResponse>;
/**
 * Funzione per inviare un messaggio
 */
export declare function sendMessage(message: string, files: File[], sessionId: string, options: ChatOptions, privacy?: boolean, callback?: string | null): Promise<SendMessageResponse>;
