import { Message, Settings } from '../types';

export const sendMessageToOracle = async (
  messages: Message[],
  settings: Settings
): Promise<string> => {
  const { apiEndpoint, apiKey, modelId, systemPrompt } = settings;

  // Prepare messages with system prompt at the start
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Logic to normalize the endpoint URL
  let targetEndpoint = apiEndpoint.trim();
  
  // Remove trailing slash
  targetEndpoint = targetEndpoint.replace(/\/$/, '');

  if (!targetEndpoint) {
    targetEndpoint = 'https://api.openai.com/v1/chat/completions';
  } else if (!targetEndpoint.includes('/chat/completions')) {
    // Smart Append Logic
    if (targetEndpoint.endsWith('/v3')) {
      targetEndpoint += '/chat/completions';
    } else if (targetEndpoint.endsWith('/v1')) {
      targetEndpoint += '/chat/completions';
    } else {
      targetEndpoint += '/v1/chat/completions';
    }
  }

  try {
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
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error(`401 Unauthorized: API Key Invalid.`);
      }
      if (response.status === 404) {
        throw new Error(`404 Not Found: Endpoint path incorrect.`);
      }
      
      throw new Error(
        errorData.error?.message || 
        errorData.message || 
        `API Error (${response.status}): ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Empty response received from the Oracle.");
    }

    return data.choices[0]?.message?.content || '...The ticker tape is silent...';
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