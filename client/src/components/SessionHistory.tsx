import React from 'react';
import { Clock3, FileSearch, FolderClock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MatchStatus, UploadSession } from '../types/match.types';
import { cn } from '../utils/cn';

interface SessionHistoryProps {
  sessions: UploadSession[];
  currentPage: number;
  totalPages: number;
  totalSessions: number;
  activeSessionId: string | null;
  onOpenSession: (sessionId: string) => void;
  onPageChange: (page: number) => void;
}

const statusStyles: Record<MatchStatus, string> = {
  matched: 'bg-green-100 text-green-700',
  partially_matched: 'bg-amber-100 text-amber-700',
  mismatch: 'bg-red-100 text-red-700',
  insufficient_documents: 'bg-slate-100 text-slate-700',
};

const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  currentPage,
  totalPages,
  totalSessions,
  activeSessionId,
  onOpenSession,
  onPageChange,
}) => {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">Saved Sessions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Reopen previous extracted values without uploading the PDFs again.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {totalSessions} total
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
          <FolderClock className="h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-700">No saved sessions yet</p>
          <p className="mt-1 text-sm text-slate-500">Process documents once and the values will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sessions.map((session) => (
            <div
              key={session._id}
              className={cn(
                'flex flex-col gap-4 rounded-xl border p-4 transition-colors md:flex-row md:items-center md:justify-between',
                activeSessionId === session._id ? 'border-blue-200 bg-blue-50/60' : 'border-slate-100 bg-slate-50/50',
              )}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{session.title}</p>
                  <span className={cn('rounded-full px-2 py-1 text-[10px] font-bold uppercase', statusStyles[session.matchResult.status])}>
                    {session.matchResult.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileSearch size={13} />
                    PO {session.poNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={13} />
                    {new Date(session.createdAt).toLocaleString()}
                  </span>
                  <span>{session.matchResult.itemResults.length} item checks</span>
                </div>
              </div>

              <button
                onClick={() => onOpenSession(session._id)}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Open Session
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <p className="text-sm text-slate-500">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </p>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
};

export default SessionHistory;
