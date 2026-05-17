import { create } from 'zustand';
import type { AxiosError } from 'axios';
import { matchService } from '../services/match.service';
import type { DocumentData, MatchResult } from '../types/match.types';

interface MatchState {
  loading: boolean;
  error: string | null;
  parsedDocuments: {
    po: DocumentData | null;
    grn: DocumentData | null;
    invoice: DocumentData | null;
  };
  matchResult: MatchResult | null;
  selectedPoNumber: string | null;

  processDocuments: (formData: FormData) => Promise<void>;
  fetchMatchResult: (poNumber: string) => Promise<void>;
  clearState: () => void;
}

interface ApiErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || fallback;
};

export const useMatchStore = create<MatchState>((set) => ({
  loading: false,
  error: null,
  parsedDocuments: {
    po: null,
    grn: null,
    invoice: null,
  },
  matchResult: null,
  selectedPoNumber: null,

  processDocuments: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await matchService.processDocuments(formData);
      if (response.success) {
        set({
          parsedDocuments: response.data,
          selectedPoNumber: response.data.po.poNumber,
        });
        // Automatically fetch match result after processing
        await useMatchStore.getState().fetchMatchResult(response.data.po.poNumber);
      }
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to process documents') });
    } finally {
      set({ loading: false });
    }
  },

  fetchMatchResult: async (poNumber: string) => {
    set({ loading: true, error: null });
    try {
      const response = await matchService.getMatchResult(poNumber);
      if (response.success) {
        set({ matchResult: response.data });
      }
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch match result') });
    } finally {
      set({ loading: false });
    }
  },

  clearState: () => set({
    loading: false,
    error: null,
    parsedDocuments: { po: null, grn: null, invoice: null },
    matchResult: null,
    selectedPoNumber: null,
  }),
}));
