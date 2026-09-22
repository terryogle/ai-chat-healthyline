/**
 * Genera un ID univoco semplice
 * Versione semplificata, in produzione usare UUID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Crea l'elemento di montaggio se non esiste
 */
export function createMountingElement(target: string): HTMLElement {
  let element = document.querySelector(target) as HTMLElement;
  
  if (!element) {
    element = document.createElement('div');
    
    if (target.startsWith('#')) {
      element.id = target.substring(1);
    } else if (target.startsWith('.')) {
      element.className = target.substring(1);
    }
    
    document.body.appendChild(element);
  }
  
  return element;
}

/**
 * Applica il tema dinamicamente
 */
export function applyTheme(theme: Record<string, string> = {}): void {
  const themeVars = {
    '--tt-chat-primary-color': theme.primaryColor || '#044273',
    '--tt-chat-bg': theme.backgroundColor || '#ffffff',
    '--tt-chat-user-bg': theme.userMessageColor || '#e0f7fa',
    '--tt-chat-bot-bg': theme.botMessageColor || '#f5f5f5',
    '--tt-chat-user-color': theme.userTextColor || '#000000',
    '--tt-chat-bot-color': theme.botTextColor || '#000000',
    '--tt-chat-header-bg': theme.headerColor || '#f5f5f5',
    '--tt-chat-header-color': theme.headerTextColor || '#333333',
    '--tt-chat-subheader-color': theme.subHeaderTextColor || '#FEBB2E',
    '--tt-chat-toggle-background': theme.toggleBackground || theme.primaryColor || '#044273',
    '--tt-chat-font-family': theme.fontFamily || theme.fontFamily || '"Plus Jakarta Sans", sans-serif',
  };
  
  const style = document.createElement('style');
  style.setAttribute('id', 'tt-chat-theme');
  
  const cssVariables = Object.entries(themeVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');
    
  style.textContent = `:root {\n${cssVariables}\n}`;
  
  // Rimuove lo stile precedente se esiste
  const existingStyle = document.getElementById('tt-chat-theme');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  document.head.appendChild(style);
}

/**
 * Estrae i tag [ACTION:nome_azione] dal testo del messaggio,
 * ripulisce il testo rimuovendo i tag e restituisce le azioni corrispondenti
 */
export function extractActionTagsAndCleanText(rawText: string): { cleanText: string; actions: import('../types').ChatAction[] } {
  if (!rawText || typeof rawText !== 'string') {
    return { cleanText: rawText || '', actions: [] };
  }

  const actions: import('../types').ChatAction[] = [];
  // Regex per catturare [ACTION:nome_azione] (case-insensitive e supporta spazi interni)
  const tagRegex = /\[ACTION:\s*([a-zA-Z0-9_-]+)\s*\]/gi;

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(rawText)) !== null) {
    const actionName = (match[1] || '').trim().toLowerCase();
    if (actionName) {
      if (actionName === 'customer_auth' || actionName === 'customerauth' || actionName === 'account_auth') {
        actions.push({
          type: 'customer_auth',
          label: 'Verify Account',
          action: 'customer_auth',
        });
      } else {
        actions.push({
          type: actionName,
          label: actionName,
          action: actionName,
        });
      }
    }
  }

  // Rimuove i tag dal testo del messaggio visibile all'utente
  const cleanText = rawText
    .replace(tagRegex, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { cleanText, actions };
}
