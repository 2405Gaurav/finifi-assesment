import React from 'react';
import type { ItemResult, MatchStatus } from '../types/match.types';
import { cn } from '../utils/cn';

interface ItemResultsTableProps {
  items: ItemResult[];
}

const statusColors: Record<MatchStatus, string> = {
  matched: 'bg-green-100 text-green-700',
  partially_matched: 'bg-amber-100 text-amber-700',
  mismatch: 'bg-red-100 text-red-700',
  insufficient_documents: 'bg-slate-100 text-slate-700',
};

const ItemResultsTable: React.FC<ItemResultsTableProps> = ({ items }) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-50 bg-slate-50/50 px-6 py-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Item-Level Analysis</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4">Item Code</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-center">PO Qty</th>
              <th className="px-6 py-4 text-center">Total GRN</th>
              <th className="px-6 py-4 text-center">Total Inv</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Reasons</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-slate-900">{item.itemCode}</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600 max-w-xs truncate">{item.description}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-900 text-center">{item.poQuantity}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-900 text-center">{item.totalGrnQuantity}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-900 text-center">{item.totalInvoiceQuantity}</td>
                <td className="px-6 py-4 text-center">
                  <span className={cn("inline-block px-2 py-1 rounded text-[10px] font-bold uppercase", statusColors[item.status])}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.reasons.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.reasons.map((r, rIdx) => (
                        <span key={rIdx} className="text-[10px] font-medium text-red-500 italic">
                          • {r.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemResultsTable;
