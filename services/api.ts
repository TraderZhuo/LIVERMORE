import type { Message, Settings } from '../types';
import { normalizeApiEndpoint } from './endpoint';

const LOCAL_PROXY_PATH = '/api/livermore/chat';

const isLocalPreview = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

const validateModelId = (modelId: string) => {
  const trimmed = modelId.trim();

  if (!trimmed) {
    throw new Error('请先填写模型接入点 ID。');
  }

  if (trimmed.startsWith('cm-')) {
    throw new Error(
      '你填的是模型仓库 ID（cm-...），不能直接调用。请使用模型接入点 ID（通常是 ep-...）。'
    );
  }
};

const parseApiResponse = async (response: Response, targetEndpoint: string) => {
  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("Empty response received from the Oracle.");
  }

  return data.choices[0]?.message?.content || '...The ticker tape is silent...';
};

const buildError = async (response: Response, targetEndpoint: string) => {
  const errorData = await response.json().catch(() => ({}));
  const apiMessage = errorData.error?.message || errorData.message;

  if (response.status === 401) {
    return new Error(`401 Unauthorized: API Key Invalid.`);
  }

  if (response.status === 404) {
    return new Error(
      apiMessage ||
      `404 Not Found: Endpoint or ID not found. Request URL: ${targetEndpoint}`
    );
  }

  return new Error(
    apiMessage ||
    `API Error (${response.status}): ${response.statusText}`
  );
};

export const sendMessageToOracle = async (
  messages: Message[],
  settings: Settings
): Promise<string> => {
  const { apiEndpoint, apiKey, modelId, systemPrompt } = settings;
  validateModelId(modelId);

  // Prepare messages with system prompt at the start
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const targetEndpoint = normalizeApiEndpoint(apiEndpoint);

  try {
    if (isLocalPreview()) {
      const proxyResponse = await fetch(LOCAL_PROXY_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          apiEndpoint,
          modelId,
          systemPrompt,
          messages,
        }),
      });

      if (proxyResponse.ok) {
        return parseApiResponse(proxyResponse, targetEndpoint);
      }

      if (proxyResponse.status !== 501 || !apiKey.trim()) {
        throw await buildError(proxyResponse, targetEndpoint);
      }
    }

    const response = await fetch(targetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: apiMessages,
        stream: false 
      }),
    });

    if (!response.ok) {
      throw await buildError(response, targetEndpoint);
    }

    return parseApiResponse(response, targetEndpoint);
  } catch (error: any) {
    console.error("Transmission Failed:", error);
    
    // Explicitly handle "Failed to fetch" which is almost always CORS or Network
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(
        "CONNECTION FAILED: Likely CORS Issue.\n" +
        "1. The API blocked the browser request.\n" +
        "2. Try installing a 'Allow CORS' browser extension.\n" +
        "3. Or check your internet connection."
      );
    }

    throw error;
  }
};
