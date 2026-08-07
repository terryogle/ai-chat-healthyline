import { Ref } from 'vue';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    createdAt: string;
    files?: File[];
    actions?: ChatAction[];
}
export interface ChatOptions {
    webhookUrl: string;
    webhookConfig?: {
        method?: 'GET' | 'POST';
        headers?: Record<string, string>;
    };
    target?: string | Element;
    mode?: 'window' | 'fullscreen';
    initialMessages?: string[];
    chatInputKey?: string;
    chatSessionKey?: string;
    loadPreviousSession?: boolean;
    showTooltip?: boolean;
    tooltipText?: string;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        userMessageColor?: string;
        botMessageColor?: string;
        userTextColor?: string;
        botTextColor?: string;
        headerColor?: string;
        headerTextColor?: string;
        toggleBackground?: string;
    };
    icons?: {
        openChat?: string;
        closeChat?: string;
        send?: string;
        headerLogo?: string;
    };
    placeholder?: string;
    title?: string;
    subtitle?: string;
    allowFileUploads?: boolean;
}
export interface Chat {
    messages: Ref<ChatMessage[]>;
    currentSessionId: Ref<string | null>;
    waitingForResponse: Ref<boolean>;
    pendingCallbackValue: Ref<string | null>;
    loadPreviousSession?: () => Promise<string | undefined>;
    startNewSession?: () => Promise<string>;
    sendMessage: (text: string, files: File[], privacy?: boolean) => Promise<void>;
}
export interface LoadPreviousSessionResponseItem {
    id: string | string[];
    kwargs: {
        content: string;
        additional_kwargs?: Record<string, unknown>;
    };
}
export interface LoadPreviousSessionResponse {
    data: LoadPreviousSessionResponseItem[];
}
export interface ChatAction {
    type: string;
    label: string;
    action: string;
    value?: string;
}
export interface SendMessageResponse {
    output?: string | string[];
    text?: string;
    actions?: ChatAction[];
}
