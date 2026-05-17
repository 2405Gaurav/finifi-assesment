import React, { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, TriangleAlert, X } from 'lucide-react';
import type { AppError } from '../types/match.types';

interface ErrorAlertProps {
  error: AppError;
  onClose: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
  const [showDetails, setShowDetails] = useState(true);
  const hasDetails = Boolean(error.details?.trim());

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-white p-2 text-red-500 shadow-sm">
            <Bot size={18} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-700">
              <TriangleAlert size={16} />
              <span className="font-semibold">AI is resting in a funny way.</span>
            </div>
            <p className="font-medium text-red-700">{error.message}</p>
            {typeof error.code === 'number' && (
              <p className="text-xs text-red-500">HTTP {error.code}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      </div>

      {hasDetails && (
        <div className="mt-4 rounded-xl border border-red-100 bg-white/70">
          <button
            onClick={() => setShowDetails((value) => !value)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-red-600"
          >
            <span>Gemini full error details</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showDetails && (
            <pre className="overflow-x-auto border-t border-red-100 px-4 py-3 text-xs whitespace-pre-wrap break-words text-red-700">
              {error.details}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorAlert;
