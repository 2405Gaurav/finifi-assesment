import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MismatchReason } from '../types/match.types';

interface MismatchReasonsProps {
  reasons: MismatchReason[];
}

const reasonLabels: Record<MismatchReason, string> = {
  grn_qty_exceeds_po_qty: 'GRN quantity exceeds PO quantity',
  invoice_qty_exceeds_po_qty: 'Invoice quantity exceeds PO quantity',
  invoice_qty_exceeds_grn_qty: 'Invoice quantity exceeds total GRN quantity',
  invoice_date_after_po_date: 'Invoice date is after PO date',
  duplicate_po: 'Duplicate PO detected',
  item_missing_in_po: 'Item found in GRN/Invoice but missing in PO',
};

const MismatchReasons: React.FC<MismatchReasonsProps> = ({ reasons }) => {
  if (reasons.length === 0) return null;

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 shadow-sm">
      <div className="flex items-center gap-2 text-red-600 mb-4">
        <AlertTriangle size={20} />
        <h3 className="text-sm font-bold uppercase tracking-tight">Validation Failures</h3>
      </div>
      <ul className="space-y-2">
        {reasons.map((reason, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm font-medium text-red-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
            {reasonLabels[reason] || reason}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MismatchReasons;
