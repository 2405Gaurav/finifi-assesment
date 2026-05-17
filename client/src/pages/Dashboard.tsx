import React from 'react';
import { useMatchStore } from '../store/useMatchStore';
import UploadSection from '../components/UploadSection';
import MatchStatusCard from '../components/MatchStatusCard';
import DocumentCard from '../components/DocumentCard';
import ItemResultsTable from '../components/ItemResultsTable';
import MismatchReasons from '../components/MismatchReasons';
import LoadingOverlay from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';
import { RefreshCcw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { loading, parsedDocuments, matchResult, clearState, error } = useMatchStore();

  const hasData = matchResult !== null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {loading && <LoadingOverlay />}
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Three-Way Match Engine</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PO · GRN · Invoice Validation</p>
            </div>
            {hasData && (
              <button 
                onClick={clearState}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <RefreshCcw size={14} />
                New Match
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600 shadow-sm animate-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Upload Documents</h2>
          </div>
          <UploadSection />
        </section>

        {!hasData ? (
          <EmptyState />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Section */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MatchStatusCard 
                  status={matchResult.status} 
                  poNumber={matchResult.poNumber}
                  lastMatchedAt={matchResult.lastMatchedAt}
                />
              </div>
              <MismatchReasons reasons={matchResult.mismatchReasons} />
            </section>

            {/* Documents Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Source Documents</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {parsedDocuments.po && (
                  <DocumentCard title="Purchase Order" document={parsedDocuments.po} />
                )}
                {parsedDocuments.grn && (
                  <DocumentCard title="Goods Receipt" document={parsedDocuments.grn} />
                )}
                {parsedDocuments.invoice && (
                  <DocumentCard title="Supplier Invoice" document={parsedDocuments.invoice} />
                )}
              </div>
            </section>

            {/* Items Table Section */}
            <section>
              <ItemResultsTable items={matchResult.itemResults} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
