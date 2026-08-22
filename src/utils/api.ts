import type {
  ChatOptions,
  LoadPreviousSessionResponse,
  SendMessageResponse,
  CatalogResponse,
  OtpResponse
} from '../types';

// Costante per l'ID della sessione in localStorage
export const LOCAL_STORAGE_SESSION_KEY = 'tt-chat-n8n-session-id';

/**
 * Funzione per fare richieste API autenticate
 */
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  console.log("Calling API:", url, options);
  try {
    const response = await fetch(url, {
      mode: 'cors',
      cache: 'no-cache',
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result = await response.json() as T;
    console.log("API Response:", result);
    return result;
  } catch (err) {
    if (typeof window !== 'undefined' && url.startsWith('http') && !url.includes(window.location.host)) {
      console.warn(`[SimpleChatN8N] Call to external webhook ${url} failed (${(err as Error).message}). Falling back to local mock endpoint /api/webhook.`);
      const queryString = url.includes('?') ? '?' + url.split('?')[1] : '';
      const fallbackUrl = `/api/webhook${queryString}`;
      const response = await fetch(fallbackUrl, {
        mode: 'cors',
        cache: 'no-cache',
        ...options,
      });
      if (!response.ok) {
        throw new Error(`Fallback API request failed with status ${response.status}`);
      }
      const result = await response.json() as T;
      console.log("Fallback API Response:", result);
      return result;
    }
    throw err;
  }
}

/**
 * Funzione per caricare la sessione precedente
 */
export async function loadPreviousSession(
  sessionId: string, 
  options: ChatOptions
): Promise<LoadPreviousSessionResponse> {
  console.log("Loading previous session with ID:", sessionId);
  
  const method = options.webhookConfig?.method === 'POST' ? 'POST' : 'GET';
  const body = {
    action: 'loadPreviousSession',
    [options.chatSessionKey || 'sessionId']: sessionId,
  };
  
  if (method === 'POST') {
    return await fetchApi<LoadPreviousSessionResponse>(options.webhookUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.webhookConfig?.headers,
      },
      body: JSON.stringify(body),
    });
  } else {
    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    
    return await fetchApi<LoadPreviousSessionResponse>(
      `${options.webhookUrl}?${params.toString()}`,
      {
        method,
        headers: options.webhookConfig?.headers,
      }
    );
  }
}

/**
 * Funzione per inviare un messaggio
 */
export async function sendMessage(
  message: string,
  files: File[],
  sessionId: string,
  options: ChatOptions,
  privacy?: boolean,
  callback?: string | null
): Promise<SendMessageResponse> {
  const method = options.webhookConfig?.method === 'POST' ? 'POST' : 'GET';
  const body: Record<string, any> = {
    action: 'sendMessage',
    [options.chatSessionKey || 'sessionId']: sessionId,
    [options.chatInputKey || 'chatInput']: message,
  };
  
  // Aggiungi il parametro privacy se è stato specificato
  if (privacy !== undefined) {
    body.privacy = privacy;
    console.log('Adding privacy response to request:', privacy);
  }

  // Aggiungi il parametro callback se è stato specificato
  if (callback !== undefined && callback !== null) {
    body.callback = callback;
    console.log('Adding callback to request:', callback);
  }
  
  // Se ci sono file, usa FormData per l'upload
  if (files.length > 0) {
    const formData = new FormData();
    
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return await fetchApi<SendMessageResponse>(options.webhookUrl, {
      method: 'POST',
      headers: options.webhookConfig?.headers,
      body: formData,
    });
  }
  
  // Altrimenti usa JSON
  if (method === 'POST') {
    return await fetchApi<SendMessageResponse>(options.webhookUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.webhookConfig?.headers,
      },
      body: JSON.stringify(body),
    });
  } else {
    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    
    return await fetchApi<SendMessageResponse>(
      `${options.webhookUrl}?${params.toString()}`,
      {
        method,
        headers: options.webhookConfig?.headers,
      }
    );
  }
}

/**
 * Funzione per caricare il catalogo prodotti dal webhook n8n
 * (che a sua volta legge i dati dalla Google Sheet)
 */
export async function getCatalog(
  options: ChatOptions,
  filters?: { category?: string; search?: string }
): Promise<CatalogResponse> {
  const method = options.webhookConfig?.method === 'POST' ? 'POST' : 'GET';
  const body: Record<string, any> = {
    action: 'getCatalog',
  };

  if (filters?.category) body.category = filters.category;
  if (filters?.search) body.search = filters.search;

  if (method === 'POST') {
    return await fetchApi<CatalogResponse>(options.webhookUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.webhookConfig?.headers,
      },
      body: JSON.stringify(body),
    });
  } else {
    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      params.append(key, String(value));
    });

    return await fetchApi<CatalogResponse>(
      `${options.webhookUrl}?${params.toString()}`,
      {
        method,
        headers: options.webhookConfig?.headers,
      }
    );
  }
}

/**
 * Funzione per richiedere il codice OTP di verifica via email
 */
export async function requestOtp(
  email: string,
  sessionId: string,
  options: ChatOptions
): Promise<OtpResponse> {
  const method = options.webhookConfig?.method === 'POST' ? 'POST' : 'GET';
  const body: Record<string, any> = {
    action: 'requestOtp',
    email: email.trim().toLowerCase(),
    [options.chatSessionKey || 'sessionId']: sessionId,
  };

  if (method === 'POST') {
    return await fetchApi<OtpResponse>(options.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.webhookConfig?.headers,
      },
      body: JSON.stringify(body),
    });
  } else {
    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      params.append(key, String(value));
    });

    return await fetchApi<OtpResponse>(
      `${options.webhookUrl}?${params.toString()}`,
      {
        method,
        headers: options.webhookConfig?.headers,
      }
    );
  }
}

/**
 * Funzione per verificare il codice OTP inserito dall'utente
 */
export async function verifyOtp(
  email: string,
  code: string,
  sessionId: string,
  options: ChatOptions
): Promise<OtpResponse> {
  const method = options.webhookConfig?.method === 'POST' ? 'POST' : 'GET';
  const body: Record<string, any> = {
    action: 'verifyOtp',
    email: email.trim().toLowerCase(),
    code: code.trim(),
    [options.chatSessionKey || 'sessionId']: sessionId,
  };

  if (method === 'POST') {
    return await fetchApi<OtpResponse>(options.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.webhookConfig?.headers,
      },
      body: JSON.stringify(body),
    });
  } else {
    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      params.append(key, String(value));
    });

    return await fetchApi<OtpResponse>(
      `${options.webhookUrl}?${params.toString()}`,
      {
        method,
        headers: options.webhookConfig?.headers,
      }
    );
  }
}

