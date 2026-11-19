import React from 'react';
import { Printer, X, ExternalLink } from 'lucide-react';
import { Button } from '../common';
import { BillVoucherRecord } from '../../types';
import { BillVoucherDocument } from './BillVoucherDocument';

interface BillVoucherPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: BillVoucherRecord | null;
}

export const BillVoucherPrintModal: React.FC<BillVoucherPrintModalProps> = ({
  isOpen,
  onClose,
  voucher,
}) => {
  if (!isOpen || !voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenNewTab = () => {
    window.open(`/billing/vouchers/${voucher.id}/print`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Top Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-slate-300">
              INVOICE PREVIEW:
            </span>
            <span className="font-mono bg-emerald-600/30 text-emerald-300 px-2.5 py-0.5 rounded text-xs font-bold border border-emerald-500/30">
              {voucher.voucherNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={ExternalLink}
              onClick={handleOpenNewTab}
            >
              Open in New Tab
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Printer}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Same-To-Same Printable Voucher Component */}
        <div className="p-4 sm:p-6 bg-slate-100 overflow-y-auto max-h-[85vh] print:max-h-none print:p-0 print:bg-white">
          <BillVoucherDocument voucher={voucher} />
        </div>

      </div>
    </div>
  );
};
