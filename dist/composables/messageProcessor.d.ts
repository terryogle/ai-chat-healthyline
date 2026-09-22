import { Ref } from 'vue';
import { ChatMessage, ChatAction } from '../types';

export declare class MessageProcessor {
    private messages;
    private pendingCallbackValue;
    constructor(messages: Ref<ChatMessage[]>, pendingCallbackValue: Ref<string | null>);
    /**
     * Aggiunge un messaggio di errore alla chat
     */
    addErrorMessage(text: string): void;
    /**
     * Aggiunge un messaggio utente alla chat
     */
    addUserMessage(text: string, files?: File[]): void;
    /**
     * Estrae i testi di risposta dall'oggetto response
     */
    extractResponseTexts(response: any): string[];
    /**
     * Processa le azioni dalla risposta del server
     */
    processActions(actions: ChatAction[]): void;
    /**
     * Crea e aggiunge i messaggi di risposta del bot
     */
    addBotMessages(responseTexts: string[], actions?: ChatAction[]): void;
}
