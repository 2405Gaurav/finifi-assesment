import React from 'react';
import { FileUp } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
        <FileUp size={32} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">No documents processed</h3>
      <p className="mt-2 text-sm text-slate-500">
        Upload PO, GRN and Invoice PDFs above to begin the matching process.
      </p>
    </div>
  );
};

export default EmptyState;
