import { Ref } from 'vue';
import { ChatOptions, ChatMessage } from '../types';

export declare class SessionManager {
    private currentSessionId;
    private messages;
    private options;
    private initialMessages;
    constructor(currentSessionId: Ref<string | null>, messages: Ref<ChatMessage[]>, options: ChatOptions, initialMessages: ChatMessage[]);
    /**
     * Inizializza una nuova sessione
     */
    startNewSession(): Promise<string>;
    /**
     * Carica la sessione precedente o ne inizia una nuova
     */
    loadPreviousSession(): Promise<string | undefined>;
    /**
     * Assicura che esista un ID di sessione valido
     */
    ensureSessionId(): Promise<string>;
}
