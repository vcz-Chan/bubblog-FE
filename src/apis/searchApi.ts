import { aiFetch } from '@/apis/apiClient';

export interface HybridSearchQuery {
  question: string;
  limit: number;
  offset: number;
  category_id?: number;
}

export interface HybridSearchPlan {
  mode?: string;
  top_k?: number;
  threshold?: number;
  weights?: { chunk?: number; title?: number };
  sort?: string;
  limit?: number;
  hybrid?: {
    enabled?: boolean;
    retrieval_bias?: 'lexical' | 'balanced' | 'semantic';
    alpha?: number;
  };
  time?: { type?: string; from?: string | null; to?: string | null };
  rewrites_len?: number;
  keywords_len?: number;
  [key: string]: unknown;
}

export interface HybridSearchPost {
  postId: string;
  postTitle: string;
  score: number;
  createdAt: string;
  best?: {
    chunkIndex?: number;
    snippet?: string;
    score?: number;
  };
}

export interface HybridSearchResponse {
  query: HybridSearchQuery;
  plan?: HybridSearchPlan | null;
  total_posts: number;
  posts: HybridSearchPost[];
}

export async function searchHybrid(options: {
  question: string;
  limit?: number;
  offset?: number;
  categoryId?: number;
  signal?: AbortSignal;
}): Promise<HybridSearchResponse> {
  const { question, limit = 10, offset = 0, categoryId, signal } = options;

  const params: Record<string, string> = {
    question,
    limit: String(limit),
    offset: String(offset),
  };
  if (categoryId != null) {
    params.category_id = String(categoryId);
  }

  const res = await aiFetch('/ai/search/hybrid', {
    method: 'GET',
    params,
    signal,
  });

  if (!res.ok) {
    let message = '검색 요청 실패';
    try {
      const error = await res.json();
      message = error?.error?.message || message;
    } catch {
      // ignore json parse errors
    }
    throw new Error(message);
  }

  return res.json();
}
