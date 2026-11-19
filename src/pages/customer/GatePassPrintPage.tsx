import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, X, Loader2 } from 'lucide-react';
import { GatePassRecord } from '../../types';
import { fetchGatePassById } from '../../services/gatePassService';
import { GatePassDocument } from '../../components/gatepass/GatePassDocument';

export const GatePassPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [gatePass, setGatePass] = useState<GatePassRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetchGatePassById(id)
      .then((data) => {
        setGatePass(data);
        setError(null);
        setTimeout(() => {
          window.print();
        }, 500);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load gate pass document');
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
        <p className="text-slate-600 font-medium text-sm">Preparing gate pass print document...</p>
      </div>
    );
  }

  if (error || !gatePass) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md text-center">
          <p className="text-rose-600 font-semibold mb-2">Error Loading Gate Pass</p>
          <p className="text-slate-600 text-sm mb-4">{error || 'Gate pass not found'}</p>
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
    <div className="min-h-screen bg-slate-200/60 py-6 print:py-0 print:min-h-0 print:h-auto print:bg-white print:m-0 print:p-0">
      {/* Floating Control Bar (Hidden on Print) */}
      <header className="no-print sticky top-2 z-50 max-w-[820px] mx-auto mb-4 px-4 py-2.5 bg-slate-900/95 backdrop-blur text-white rounded-xl shadow-lg flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            GATE PASS DOCUMENT:
          </span>
          <span className="font-mono bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded text-xs font-bold border border-blue-500/30">
            {gatePass.passNo}
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

      {/* Printable Document */}
      <main className="max-w-[820px] mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
        <GatePassDocument gatePass={gatePass} />
      </main>
    </div>
  );
};

