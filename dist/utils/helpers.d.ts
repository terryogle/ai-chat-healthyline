/**
 * Genera un ID univoco semplice
 * Versione semplificata, in produzione usare UUID
 */
export declare function generateId(): string;
/**
 * Crea l'elemento di montaggio se non esiste
 */
export declare function createMountingElement(target: string): HTMLElement;
/**
 * Applica il tema dinamicamente
 */
export declare function applyTheme(theme?: Record<string, string>): void;
