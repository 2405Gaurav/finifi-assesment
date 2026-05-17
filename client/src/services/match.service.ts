import api from '../api/axios';
import type {
  MatchResultResponse,
  ProcessDocumentsResponse,
  SessionListResponse,
  SessionResponse,
} from '../types/match.types';

export const matchService = {
  processDocuments: async (formData: FormData): Promise<ProcessDocumentsResponse> => {
    const response = await api.post<ProcessDocumentsResponse>('/documents/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMatchResult: async (poNumber: string): Promise<MatchResultResponse> => {
    const response = await api.get<MatchResultResponse>(`/match/${poNumber}`);
    return response.data;
  },

  getSessions: async (page = 1, limit = 5): Promise<SessionListResponse> => {
    const response = await api.get<SessionListResponse>(`/sessions?page=${page}&limit=${limit}`);
    return response.data;
  },

  getSession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await api.get<SessionResponse>(`/sessions/${sessionId}`);
    return response.data;
  },
};
