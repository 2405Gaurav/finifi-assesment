import api from '../api/axios';
import type { ProcessDocumentsResponse, MatchResultResponse } from '../types/match.types';

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
};
