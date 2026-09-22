import { ChatOptions, LoadPreviousSessionResponse, SendMessageResponse, CatalogResponse, OtpResponse } from '../types';

export declare const LOCAL_STORAGE_SESSION_KEY = "tt-chat-n8n-session-id";
/**
 * Funzione per caricare la sessione precedente
 */
export declare function loadPreviousSession(sessionId: string, options: ChatOptions): Promise<LoadPreviousSessionResponse>;
/**
 * Funzione per inviare un messaggio
 */
export declare function sendMessage(message: string, files: File[], sessionId: string, options: ChatOptions, privacy?: boolean, callback?: string | null): Promise<SendMessageResponse>;
/**
 * Funzione per caricare il catalogo prodotti dal webhook n8n
 * (che a sua volta legge i dati dalla Google Sheet)
 */
export declare function getCatalog(options: ChatOptions, filters?: {
    category?: string;
    search?: string;
}): Promise<CatalogResponse>;
/**
 * Funzione per richiedere il codice OTP di verifica via email
 */
export declare function requestOtp(email: string, sessionId: string, options: ChatOptions): Promise<OtpResponse>;
/**
 * Funzione per verificare il codice OTP inserito dall'utente
 */
export declare function verifyOtp(email: string, code: string, sessionId: string, options: ChatOptions): Promise<OtpResponse>;
