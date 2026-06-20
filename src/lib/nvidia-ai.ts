import { GoogleGenAI } from '@google/genai';

const NVIDIA_API_KEY = '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';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export interface NVIDIAModel {
  id: string;
  name: string;
  type: 'llm' | 'vision' | 'embedding' | 'audio';
  contextLength: number;
  pricing: { input: number; output: number };
}

export const NVIDIA_MODELS: NVIDIAModel[] = [
  { id: 'nvidia/nemotron-3-ultra', name: 'Nemotron 3 Ultra', type: 'llm', contextLength: 4096, pricing: { input: 0.0008, output: 0.0016 } },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Llama 3.1 Nemotron 70B', type: 'llm', contextLength: 128000, pricing: { input: 0.0004, output: 0.0008 } },
  { id: 'nvidia/llama-3.1-nemotron-51b-instruct', name: 'Llama 3.1 Nemotron 51B', type: 'llm', contextLength: 128000, pricing: { input: 0.0002, output: 0.0004 } },
  { id: 'nvidia/nemotron-mini-4b-instruct', name: 'Nemotron Mini 4B', type: 'llm', contextLength: 4096, pricing: { input: 0.00005, output: 0.0001 } },
  { id: 'nvidia/cosmos-1.0-diffusion-7b', name: 'Cosmos Diffusion 7B', type: 'vision', contextLength: 4096, pricing: { input: 0.002, output: 0.004 } },
  { id: 'nvidia/embed-qa-4', name: 'Embed QA 4', type: 'embedding', contextLength: 8192, pricing: { input: 0.0001, output: 0 } },
  { id: 'nvidia/parakeet-rnnt-1.1b', name: 'Parakeet RNNT 1.1B', type: 'audio', contextLength: 4096, pricing: { input: 0.0004, output: 0.0008 } },
];

class NVIDIAClient {
  private baseUrl: string;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string = NVIDIA_API_KEY, baseUrl: string = NVIDIA_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModel = 'nvidia/llama-3.1-nemotron-70b-instruct';
  }

  async chatCompletion(params: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' | 'text' };
    stream?: boolean;
    tools?: any[];
    toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': params.stream ? 'text/event-stream' : 'application/json',
      },
      body: JSON.stringify({
        model: params.model || this.defaultModel,
        messages: params.messages,
        temperature: params.temperature ?? 0.2,
        max_tokens: params.maxTokens ?? 4096,
        response_format: params.responseFormat ? { type: params.responseFormat.type } : undefined,
        stream: params.stream ?? false,
        tools: params.tools,
        tool_choice: params.toolChoice,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} - ${error}`);
    }

    if (params.stream) {
      return response.body;
    }

    return response.json();
  }

  async visionCompletion(params: {
    messages: Array<{
      role: 'user';
      content: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
    }>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<any> {
    return this.chatCompletion({
      messages: params.messages as any,
      model: params.model || 'nvidia/cosmos-1.0-diffusion-7b',
      temperature: params.temperature ?? 0.1,
      maxTokens: params.maxTokens ?? 4096,
    });
  }

  async structuredOutput<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    schema: any;
    model?: string;
    temperature?: number;
  }): Promise<T> {
    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      model: params.model || this.defaultModel,
      temperature: params.temperature ?? 0.1,
      responseFormat: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from NVIDIA API');
    
    try {
      return JSON.parse(content) as T;
    } catch (e) {
      console.error('Failed to parse JSON:', content);
      throw new Error('Invalid JSON response from AI');
    }
  }

  async *streamChat(params: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    model?: string;
    temperature?: number;
  }): AsyncGenerator<string, void, unknown> {
    const response = await this.chatCompletion({
      ...params,
      stream: true,
    });

    const reader = response.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch {}
        }
      }
    }
  }

  async getEmbeddings(texts: string[], model: string = 'nvidia/embed-qa-4'): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: texts,
      }),
    });

    if (!response.ok) throw new Error('Embedding failed');
    
    const data = await response.json();
    return data.data.map((d: any) => d.embedding);
  }

  async transcribeAudio(audioBase64: string, model: string = 'nvidia/parakeet-rnnt-1.1b'): Promise<string> {
    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        file: audioBase64,
        language: 'pt',
      }),
    });

    if (!response.ok) throw new Error('Transcription failed');
    const data = await response.json();
    return data.text;
  }
}

export const nvidiaAI = new NVIDIAClient();

// Specialized prompts for restaurant operations
export const NVIDIA_PROMPTS = {
  MENU_GENESIS: {
    system: `Você é um especialista em cardápios de restaurantes. Extraia TODOS os itens do texto OCR fornecido.
Retorne APENAS JSON válido no formato:
{
  "items": [
    {"name": "string", "description": "string", "price": number, "category": "string", "allergens": ["string"], "dietaryTags": ["string"], "prepTimeMinutes": number, "station": "string"}
  ],
  "categories": ["string"]
}

REGRAS:
- Preços em centavos (ex: 29.90 = 2990)
- Categorize: Entradas, Pratos Principais, Sobremesas, Bebidas, Acompanhamentos
- Alérgenos: glúten, lactose, nozes, frutos_do_mar, ovo, soja, amendoim, sesamo
- Tags: vegetariano, vegano, sem_gluten, low_carb, keto, apimentado, saudavel
- Station: grill, fryer, salad, bar, dessert, cold_prep`,
    user: (ocrText: string) => `TEXTO OCR DO CARDÁPIO:\n${ocrText}\n\nExtraia todos os itens estruturados.`
  },

  VOICE_INTENT: {
    system: `Classifique comandos de voz para operações de restaurante. Retorne JSON:
{
  "intent": "string",
  "entities": {},
  "confidence": 0.0-1.0
}

INTENÇÕES:
- create_order, add_item, remove_item, modify_item, set_table, set_customer
- apply_discount, complete_order, pay_order, print_receipt
- check_inventory, reorder_stock, log_waste
- get_report, ask_question, call_server, kitchen_bump, kitchen_hold, kitchen_recall

ENTIDADES: itemName, quantity, modifiers, tableNumber, customerName, customerPhone, paymentMethod, discountType, discountValue, wasteReason, ingredientName, wasteQuantity, station, orderId`,
    user: (text: string) => `COMANDO: "${text}"`
  },

  PREDICTIVE_DEMAND: {
    system: `Você é um engine de previsão de demanda para restaurantes. Analise dados históricos e contexto.
Retorne JSON:
{
  "predictions": [{"date": "YYYY-MM-DD", "hour": 0-23, "covers": number, "revenue": number, "confidence": 0-1}],
  "recommendations": [{"type": "staffing"|"inventory"|"menu", "action": "string", "impact": "string", "priority": "high"|"medium"|"low"}]
}`,
    user: (data: any) => `DADOS HISTÓRICOS: ${JSON.stringify(data)}`
  },

  MENU_ENGINEERING: {
    system: `Analise performance do cardápio e recomende otimizações. Retorne JSON:
{
  "stars": [{"itemId": "string", "name": "string", "reason": "string"}],
  "plowhorses": [{"itemId": "string", "name": "string", "action": "increase_price"|"reduce_cost"|"promote", "newPrice": number}],
  "puzzles": [{"itemId": "string", "name": "string", "action": "reposition"|"remarket"|"remove"}],
  "dogs": [{"itemId": "string", "name": "string", "action": "remove"|"replace"}],
  "newOpportunities": [{"name": "string", "category": "string", "estimatedMargin": number, "estimatedDemand": number}]
}`,
    user: (menuData: any) => `DADOS DO CARDÁPIO: ${JSON.stringify(menuData)}`
  },

  INVENTORY_OPTIMIZATION: {
    system: `Otimize compras e estoque. Retorne JSON:
{
  "purchaseOrders": [{"supplierId": "string", "items": [{"ingredientId": "string", "quantity": number, "estimatedCost": number}], "priority": "high"|"medium"|"low"}],
  "stockAlerts": [{"ingredientId": "string", "currentStock": number, "daysUntilStockout": number, "recommendedOrder": number}],
  "wasteReduction": [{"ingredientId": "string", "action": "string", "estimatedSavings": number}]
}`,
    user: (inventoryData: any) => `DADOS DE ESTOQUE: ${JSON.stringify(inventoryData)}`
  },
};