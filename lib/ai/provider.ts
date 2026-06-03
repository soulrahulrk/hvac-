import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIProviderOptions {
  model?: string;
  temperature?: number;
}

export abstract class AIProvider {
  abstract generateText(prompt: string, options?: AIProviderOptions): Promise<string>;
}

export class GeminiProvider extends AIProvider {
  private ai: GoogleGenerativeAI;
  private defaultModel: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    super();
    this.ai = new GoogleGenerativeAI(apiKey);
    this.defaultModel = model;
  }

  async generateText(prompt: string, options?: AIProviderOptions): Promise<string> {
    const model = this.ai.getGenerativeModel({ model: options?.model || this.defaultModel });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
      }
    });
    
    return result.response.text();
  }
}

export class NvidiaKimiProvider extends AIProvider {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, model: string = 'moonshotai/kimi-k2.6') {
    super();
    this.apiKey = apiKey;
    this.defaultModel = model;
  }

  async generateText(prompt: string, options?: AIProviderOptions): Promise<string> {
    const url = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    const payload = {
      model: options?.model || this.defaultModel,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: options?.temperature ?? 0.7,
      stream: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export function getAIProvider(providerName: string, apiKey: string, model?: string): AIProvider {
  switch (providerName.toLowerCase()) {
    case 'gemini':
      return new GeminiProvider(apiKey, model);
    case 'nvidia':
    case 'kimi':
      return new NvidiaKimiProvider(apiKey, model);
    default:
      // Fallback to Gemini if valid key exists, otherwise throw
      if (apiKey.startsWith('AIza')) {
        return new GeminiProvider(apiKey, model);
      }
      throw new Error(`Unsupported AI provider: ${providerName}`);
  }
}
