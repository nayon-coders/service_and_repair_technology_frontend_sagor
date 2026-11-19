import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, X, Loader2 } from 'lucide-react';
import { RequisitionRecord } from '../../types';
import { fetchRequisitionById } from '../../services/requisitionService';
import { RequisitionDocument } from '../../components/requisition/RequisitionDocument';

export const RequisitionPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [requisition, setRequisition] = useState<RequisitionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetchRequisitionById(id)
      .then((data) => {
        setRequisition(data);
        setError(null);
        setTimeout(() => {
          window.print();
        }, 500);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load requisition estimate');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#002060] animate-spin mb-3" />
        <p className="text-slate-600 font-medium text-sm">Preparing repair cost estimate print document...</p>
      </div>
    );
  }

  if (error || !requisition) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md text-center">
          <p className="text-rose-600 font-semibold mb-2">Error Loading Estimate</p>
          <p className="text-slate-600 text-sm mb-4">{error || 'Estimate not found'}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700"
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/60 py-6 print:py-0 print:bg-white">
      
      {/* Floating Control Bar (Hidden on Print) */}
      <header className="no-print sticky top-2 z-50 max-w-[820px] mx-auto mb-4 px-4 py-2.5 bg-slate-900/95 backdrop-blur text-white rounded-xl shadow-lg flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            REPAIR COST ESTIMATE PREVIEW:
          </span>
          <span className="font-mono bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded text-xs font-bold border border-blue-500/30">
            {requisition.estimateNo}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#002060] hover:bg-[#001745] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save as PDF
          </button>
          
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Close
          </button>
        </div>
      </header>

      {/* Printable Requisition Document */}
      <main>
        <RequisitionDocument requisition={requisition} />
      </main>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

