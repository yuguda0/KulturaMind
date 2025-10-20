/**
 * API Client Service for KulturaMind Backend
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<{ status: string; rag_pipeline_ready: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/api/info`);
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
      const response = await fetch(`${this.baseUrl}/api/search`, {
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
      const response = await fetch(`${this.baseUrl}/api/query`, {
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
      const response = await fetch(`${this.baseUrl}/api/artifacts`);
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
      const response = await fetch(`${this.baseUrl}/api/artifacts/${artifactId}`);
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
      const response = await fetch(`${this.baseUrl}/api/artifacts/culture/${culture}`);
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
      const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
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
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

export default apiClient;

