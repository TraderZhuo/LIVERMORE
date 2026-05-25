export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Settings {
  apiEndpoint: string;
  apiKey: string;
  modelId: string;
  systemPrompt: string;
  language: 'zh' | 'en';
  theme: 'dark' | 'light';
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
