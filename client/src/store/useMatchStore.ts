import { create } from 'zustand';
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
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to process documents' });
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
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch match result' });
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
