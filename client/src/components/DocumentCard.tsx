import React, { useState } from 'react';
import { FileText, Calendar, User, ChevronDown, ChevronUp, Package } from 'lucide-react';
import type { DocumentData } from '../types/match.types';

interface DocumentCardProps {
  document: DocumentData;
  title: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDate = document.documentDate ? new Date(document.documentDate).toLocaleDateString() : 'N/A';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-50 bg-slate-50/50 px-5 py-3 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <FileText size={16} className="text-slate-400" />
          {title}
        </h3>
        <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase">
          {document.documentType}
        </span>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Doc Number</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{document.documentNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Date</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Calendar size={12} className="text-slate-400" />
              {formattedDate}
            </div>
          </div>
        </div>

        {document.vendorName && (
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Vendor</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <User size={12} className="text-slate-400" />
              {document.vendorName}
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Package size={14} />
            {document.items.length} Items
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isExpanded && (
          <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {document.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start p-2 rounded-md bg-slate-50/50 border border-slate-100/50">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-[10px] font-bold text-slate-400 truncate">{item.itemCode}</p>
                  <p className="text-xs font-medium text-slate-700 truncate">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400">Qty</p>
                  <p className="text-xs font-bold text-slate-900">{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
