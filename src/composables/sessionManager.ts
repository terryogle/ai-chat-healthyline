// src/composables/sessionManager.ts
import type { Ref } from 'vue';
import { LOCAL_STORAGE_SESSION_KEY, loadPreviousSession } from '../utils/api';
import { generateId, extractActionTagsAndCleanText } from '../utils/helpers';
import type { ChatOptions, ChatMessage } from '../types';

export class SessionManager {
  constructor(
    private currentSessionId: Ref<string | null>,
    private messages: Ref<ChatMessage[]>,
    private options: ChatOptions,
    private initialMessages: ChatMessage[]
  ) {}

  /**
   * Inizializza una nuova sessione
   */
  async startNewSession(): Promise<string> {
    const newSessionId = generateId();
    this.currentSessionId.value = newSessionId;
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, newSessionId);

    // Aggiunge i messaggi iniziali o un saluto di default se non presenti
    const defaultGreeting = "Welcome to HealthyLine! How can I help you today?";
    const messagesToUse = this.initialMessages.length > 0 
      ? [...this.initialMessages] 
      : [{ id: generateId(), text: defaultGreeting, sender: 'bot' as const, createdAt: new Date().toISOString() }];
    
    this.messages.value = messagesToUse;

    console.log("Nuova sessione iniziata:", newSessionId);
    return newSessionId;
  }

  /**
   * Carica la sessione precedente o ne inizia una nuova
   */
  async loadPreviousSession(): Promise<string | undefined> {
    if (!this.options.loadPreviousSession) {
      return await this.startNewSession();
    }

    const sessionIdFromStorage = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (!sessionIdFromStorage) {
      console.log("Nessun ID di sessione in localStorage. Inizio una nuova sessione.");
      return await this.startNewSession();
    }
    
    console.log("Trovato sessionId in localStorage:", sessionIdFromStorage);
    this.currentSessionId.value = sessionIdFromStorage;

    try {
      const previousMessagesResponse = await loadPreviousSession(
        sessionIdFromStorage,
        this.options
      );

      console.log("Risposta caricamento sessione:", previousMessagesResponse);

      if (previousMessagesResponse?.data?.length > 0) {
        const timestamp = new Date().toISOString();
        const loadedMessages: ChatMessage[] = [];
        
        previousMessagesResponse.data.forEach((message, index) => {
          // MANTIENE LA LOGICA LEGACY ORIGINALE (formato kwargs.content)
          const messageContent = message.kwargs?.content || "Messaggio vuoto";
          const sender = Array.isArray(message.id)
            ? (message.id.some(id => String(id).includes('HumanMessage')) ? 'user' : 'bot')
            : (String(message.id).includes('HumanMessage') ? 'user' : 'bot');

          // Se content è un array, crea messaggi multipli
          if (Array.isArray(messageContent)) {
            messageContent.forEach((text: any, textIndex: number) => {
              if (typeof text === 'string' && text.trim() !== '') {
                const { cleanText, actions } = sender === 'bot' 
                  ? extractActionTagsAndCleanText(text) 
                  : { cleanText: text.trim(), actions: [] };

                if (cleanText !== '' || actions.length > 0) {
                  loadedMessages.push({
                    id: `${index}-${textIndex}-${generateId()}`,
                    text: cleanText,
                    sender: sender as 'user' | 'bot',
                    createdAt: timestamp,
                    actions: actions.length > 0 ? actions : undefined,
                  });
                }
              }
            });
          }
          // Se è una stringa, crea un singolo messaggio
          else if (typeof messageContent === 'string' && messageContent.trim() !== '') {
            const { cleanText, actions } = sender === 'bot' 
              ? extractActionTagsAndCleanText(messageContent) 
              : { cleanText: messageContent.trim(), actions: [] };

            if (cleanText !== '' || actions.length > 0) {
              loadedMessages.push({
                id: `${index}-${generateId()}`,
                text: cleanText,
                sender: sender as 'user' | 'bot',
                createdAt: timestamp,
                actions: actions.length > 0 ? actions : undefined,
              });
            }
          }
        });

        console.log("Messaggi caricati:", loadedMessages);
        this.messages.value = loadedMessages;
        
        // Se la cronologia è vuota, aggiunge i messaggi iniziali o il saluto di default
        if (this.messages.value.length === 0) {
          console.log("Sessione vuota, aggiunto messaggi iniziali o saluto di default");
          const defaultGreeting = "Welcome to HealthyLine! How can I help you today?";
          this.messages.value = this.initialMessages.length > 0 
            ? [...this.initialMessages] 
            : [{ id: generateId(), text: defaultGreeting, sender: 'bot' as const, createdAt: new Date().toISOString() }];
        }

        return sessionIdFromStorage;
      }

      // Sessione vuota - aggiunge messaggi iniziali o saluto di default
      console.log("Nessun messaggio precedente trovato per la sessione:", sessionIdFromStorage);
      const defaultGreeting = "Welcome to HealthyLine! How can I help you today?";
      this.messages.value = this.initialMessages.length > 0 
        ? [...this.initialMessages] 
        : [{ id: generateId(), text: defaultGreeting, sender: 'bot' as const, createdAt: new Date().toISOString() }];
      return sessionIdFromStorage;

    } catch (error) {
      console.error('Errore durante il caricamento della sessione precedente:', error);
      return await this.startNewSession();
    }
  }

  /**
   * Assicura che esista un ID di sessione valido
   */
  async ensureSessionId(): Promise<string> {
    if (!this.currentSessionId.value) {
      const sessionId = this.options.loadPreviousSession 
        ? await this.loadPreviousSession() 
        : await this.startNewSession();
      
      if (!sessionId) {
        throw new Error("Impossibile stabilire un ID di sessione");
      }
      return sessionId;
    }
    return this.currentSessionId.value;
  }
}