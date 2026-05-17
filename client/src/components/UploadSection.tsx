import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';
import { cn } from '../utils/cn';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const FileUploadBox: React.FC<FileUploadProps> = ({ label, onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer",
        selectedFile 
          ? "border-blue-200 bg-blue-50/50" 
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="application/pdf"
        onChange={handleFileChange}
      />
      
      {selectedFile ? (
        <>
          <CheckCircle2 className="h-8 w-8 text-blue-500" />
          <p className="mt-2 text-sm font-medium text-slate-900 truncate max-w-full px-2">
            {selectedFile.name}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="mt-2 text-xs font-medium text-slate-500 hover:text-red-500 flex items-center gap-1"
          >
            <X size={12} /> Remove
          </button>
        </>
      ) : (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Upload size={20} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-xs text-slate-500">Click to upload PDF</p>
        </>
      )}
    </div>
  );
};

const UploadSection: React.FC = () => {
  const [poFile, setPoFile] = useState<File | null>(null);
  const [grnFile, setGrnFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  
  const { processDocuments, loading } = useMatchStore();

  const handleProcess = async () => {
    if (!poFile || !grnFile || !invoiceFile) return;

    const formData = new FormData();
    formData.append('poFile', poFile);
    formData.append('grnFile', grnFile);
    formData.append('invoiceFile', invoiceFile);

    await processDocuments(formData);
  };

  const isReady = poFile && grnFile && invoiceFile;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FileUploadBox 
          label="Purchase Order (PO)" 
          selectedFile={poFile} 
          onFileSelect={setPoFile} 
        />
        <FileUploadBox 
          label="Goods Receipt (GRN)" 
          selectedFile={grnFile} 
          onFileSelect={setGrnFile} 
        />
        <FileUploadBox 
          label="Invoice" 
          selectedFile={invoiceFile} 
          onFileSelect={setInvoiceFile} 
        />
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleProcess}
          disabled={!isReady || loading}
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-8 py-3 text-sm font-semibold text-white transition-all shadow-md active:scale-95",
            isReady && !loading
              ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              : "bg-slate-300 cursor-not-allowed"
          )}
        >
          {loading ? "Processing..." : "Process Documents"}
        </button>
      </div>
    </div>
  );
};

export default UploadSection;
