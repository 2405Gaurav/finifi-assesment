import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, Clock } from 'lucide-react';
import type { MatchStatus } from '../types/match.types';
import { cn } from '../utils/cn';

interface MatchStatusCardProps {
  status: MatchStatus;
  poNumber: string;
  lastMatchedAt: string;
}

const statusConfig = {
  matched: {
    label: 'Fully Matched',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
  },
  partially_matched: {
    label: 'Partially Matched',
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
  },
  mismatch: {
    label: 'Mismatch Detected',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100',
  },
  insufficient_documents: {
    label: 'Insufficient Documents',
    icon: HelpCircle,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-100',
  },
};

const MatchStatusCard: React.FC<MatchStatusCardProps> = ({ status, poNumber, lastMatchedAt }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-2xl border p-6 shadow-sm", config.bgColor, config.borderColor)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm", config.color)}>
            <Icon size={24} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Matching Status</p>
            <h2 className={cn("text-xl font-bold", config.color)}>{config.label}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">PO Number</p>
          <p className="text-lg font-bold text-slate-900">{poNumber}</p>
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-400">
        <Clock size={14} />
        Last recomputed on {new Date(lastMatchedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default MatchStatusCard;
