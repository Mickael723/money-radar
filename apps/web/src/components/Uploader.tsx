import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';

export function Uploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { fetchTransactions } = useTransactionStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setMessage(null);

    try {
      const token = "mock_token"; // Real app grabs from context
      const res = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setMessage({ type: 'success', text: `Successfully processed ${res.data.insertedCount} transactions.` });
      
      await fetchTransactions(token);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to upload file' });
    } finally {
      setIsUploading(false);
      
      setTimeout(() => {
        setMessage(prev => prev?.type === 'success' ? null : prev);
      }, 5000);
    }
  }, [fetchTransactions]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  return (
    <div className="w-full mb-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
              <p className="text-emerald-700 font-medium">Parsing and categorizing...</p>
            </>
          ) : (
            <>
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-700 font-medium">Click or drag a PDF/CSV statement to upload</p>
                <p className="text-sm text-slate-500 mt-1">Maximum file size 10MB</p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {message && (
        <div className={`mt-4 p-4 rounded-lg font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
