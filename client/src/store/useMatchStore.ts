import { create } from 'zustand';
import type { AxiosError } from 'axios';
import { matchService } from '../services/match.service';
import type { AppError, DocumentData, MatchResult, UploadSession } from '../types/match.types';

interface MatchState {
  loading: boolean;
  error: AppError | null;
  parsedDocuments: {
    po: DocumentData | null;
    grn: DocumentData | null;
    invoice: DocumentData | null;
  };
  matchResult: MatchResult | null;
  selectedPoNumber: string | null;
  sessions: UploadSession[];
  sessionsPage: number;
  sessionsLimit: number;
  sessionsTotalPages: number;
  sessionsTotal: number;
  activeSessionId: string | null;

  processDocuments: (formData: FormData) => Promise<void>;
  fetchMatchResult: (poNumber: string) => Promise<void>;
  fetchSessions: (page?: number) => Promise<void>;
  openSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
  clearState: () => void;
}

interface ApiErrorResponse {
  message?: string;
  details?: string;
  code?: number;
}

const getErrorMessage = (error: unknown, fallback: string): AppError => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const response = axiosError.response?.data;
  
  let details = undefined;
  if (response?.details) {
    details = typeof response.details === 'string' 
      ? response.details 
      : JSON.stringify(response.details, null, 2);
  }

  return {
    message: response?.message || fallback,
    details,
    code: response?.code,
  };
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
  sessions: [],
  sessionsPage: 1,
  sessionsLimit: 5,
  sessionsTotalPages: 1,
  sessionsTotal: 0,
  activeSessionId: null,

  processDocuments: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await matchService.processDocuments(formData);
      if (response.success) {
        set({
          parsedDocuments: response.data,
          selectedPoNumber: response.data.po.poNumber,
          activeSessionId: response.sessionId || null,
        });
        // Automatically fetch match result after processing
        await useMatchStore.getState().fetchMatchResult(response.data.po.poNumber);
        await useMatchStore.getState().fetchSessions(1);
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

  fetchSessions: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await matchService.getSessions(page, useMatchStore.getState().sessionsLimit);
      if (response.success) {
        set({
          sessions: response.data,
          sessionsPage: response.pagination.page,
          sessionsLimit: response.pagination.limit,
          sessionsTotalPages: response.pagination.totalPages,
          sessionsTotal: response.pagination.total,
        });
      }
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch previous sessions') });
    } finally {
      set({ loading: false });
    }
  },

  openSession: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await matchService.getSession(sessionId);
      if (response.success) {
        set({
          activeSessionId: response.data._id,
          selectedPoNumber: response.data.poNumber,
          parsedDocuments: {
            po: response.data.documents.po as DocumentData | null,
            grn: response.data.documents.grn as DocumentData | null,
            invoice: response.data.documents.invoice as DocumentData | null,
          },
          matchResult: {
            poNumber: response.data.poNumber,
            linkedDocuments: {
              po: null,
              grns: [],
              invoices: [],
            },
            status: response.data.matchResult.status,
            mismatchReasons: response.data.matchResult.mismatchReasons,
            itemResults: response.data.matchResult.itemResults,
            lastMatchedAt: response.data.matchResult.lastMatchedAt,
          },
        });
      }
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to open saved session') });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),

  clearState: () => set({
    loading: false,
    error: null,
    parsedDocuments: { po: null, grn: null, invoice: null },
    matchResult: null,
    selectedPoNumber: null,
    activeSessionId: null,
  }),
}));
