/**
 * API Client Service for KulturaMind Backend
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = 'https://kulturamind-api.onrender.com';

export interface SearchResult {
  id: string;
  text: string;
  type: string;
  metadata: Record<string, any>;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  count: number;
}

export interface QueryResponse {
  response: string;
  sources: Array<Record<string, any>>;
  reasoning: Array<Record<string, any>>;
}

export interface Artifact {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  era: string;
  year: string;
  description: string;
  significance: string;
  culturalContext: string;
  culture: string;
  imageUrl?: string;
  web_context?: Record<string, any>;
  related_items?: Array<Record<string, any>>;
}

export interface StreamChunk {
  type: 'content' | 'complete' | 'error';
  data?: string;
  sources?: Array<Record<string, any>>;
  reasoning?: Array<Record<string, any>>;
  error?: string;
  done: boolean;
}

export interface SystemInfo {
  system: string;
  version: string;
  components: Record<string, string>;
  data: {
    total_items: number;
    cultures: string[];
    categories: string[];
  };
}

class APIClient {
  private baseUrl: string;
  private requestTimeout: number = 60000; // 60 second timeout for slow backends
  private maxRetries: number = 3;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log('APIClient initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Health check endpoint with retry logic
   */
  async checkHealth(): Promise<{ status: string; rag_pipeline_ready: boolean }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Health check attempt ${attempt}/${this.maxRetries} at:`, `${this.baseUrl}/health`);
        const response = await this.fetchWithTimeout(`${this.baseUrl}/health`);
        if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
        const data = await response.json();
        console.log('Health check successful:', data);
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Health check attempt ${attempt} failed:`, lastError.message);

        if (attempt < this.maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('Health check failed after all retries:', lastError);
    throw lastError || new Error('Health check failed');
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/info`);
      if (!response.ok) throw new Error('Failed to fetch system info');
      return await response.json();
    } catch (error) {
      console.error('System info error:', error);
      throw error;
    }
  }

  /**
   * Semantic search
   */
  async search(query: string, topK: number = 5): Promise<SearchResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Intelligent query with RAG pipeline
   */
  async query(
    message: string,
    useReasoning: boolean = true,
    useLLM: boolean = true
  ): Promise<QueryResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          use_reasoning: useReasoning,
          use_llm: useLLM,
        }),
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  /**
   * Get all artifacts
   */
  async getArtifacts(): Promise<{ artifacts: Artifact[]; count: number }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/artifacts`);
      if (!response.ok) throw new Error('Failed to fetch artifacts');
      return await response.json();
    } catch (error) {
      console.error('Artifacts fetch error:', error);
      throw error;
    }
  }

  /**
   * Get specific artifact by ID
   */
  async getArtifact(artifactId: string): Promise<Artifact> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/artifacts/${artifactId}`);
      if (!response.ok) throw new Error('Failed to fetch artifact');
      return await response.json();
    } catch (error) {
      console.error('Artifact fetch error:', error);
      throw error;
    }
  }

  /**
   * Get artifacts by culture
   */
  async getArtifactsByCulture(culture: string): Promise<{ culture: string; artifacts: Artifact[]; count: number }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/artifacts/culture/${culture}`);
      if (!response.ok) throw new Error('Failed to fetch artifacts by culture');
      return await response.json();
    } catch (error) {
      console.error('Culture artifacts fetch error:', error);
      throw error;
    }
  }

  /**
   * Stream chat response
   */
  async *streamChat(
    message: string,
    useReasoning: boolean = true,
    useLLM: boolean = true
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          use_reasoning: useReasoning,
          use_llm: useLLM,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk: StreamChunk = JSON.parse(line);
              yield chunk;
            } catch (e) {
              console.error('Failed to parse stream chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }

  /**
   * Generic GET request
   */
  async get(endpoint: string): Promise<any> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) {
        throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Get impact metrics
   */
  async getImpactMetrics(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/metrics/impact`);
      if (!response.ok) throw new Error('Failed to fetch impact metrics');
      return await response.json();
    } catch (error) {
      console.error('Impact metrics fetch error:', error);
      throw error;
    }
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

export default apiClient;

