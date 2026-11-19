import React from 'react';
import { TaDaBillRecord } from '../../types';

interface TaDaDocumentProps {
  bill: TaDaBillRecord;
}

export const TaDaDocument: React.FC<TaDaDocumentProps> = ({ bill }) => {
  const items = bill.items || [];
  // Ensure exactly 30 rows to match official 30-row TA/DA voucher layout from Word template
  const targetRows = Math.max(30, items.length);
  const paddedItems: (typeof items[0] | null)[] = [...items];
  while (paddedItems.length < targetRows) {
    paddedItems.push(null);
  }

  const formatTk = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num) || num === 0) return '';
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const grandTotalTk = (bill.items || []).reduce((sum, it) => sum + (Number(it.totalTaka) || 0), 0);

  return (
    <div className="tada-doc-root relative bg-white text-slate-900 font-sans mx-auto p-6 sm:p-7 max-w-[840px] shadow-sm print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:min-h-0 print:h-auto overflow-hidden">
      
      {/* Centered Watermark Logo - Layered directly behind the table */}
      <div 
        className="watermark-container absolute pointer-events-none select-none z-0 flex items-center justify-center print:flex"
        style={{
          top: '52%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          maxWidth: '85%',
        }}
      >
        <img
          src="/watermark.jpg"
          alt="Watermark"
          className="w-full h-auto object-contain"
          style={{
            opacity: 0.22,
            filter: 'contrast(1.05)',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {/* Content Container (Layered above watermark) */}
      <div className="relative z-10 flex flex-col justify-between h-full bg-transparent">
        <div>
          {/* Header matching exact DOCX */}
          <div className="text-center pb-1.5 border-b border-slate-800">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              1service &amp; Repair Technology
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-700 font-medium mt-0.5">
              Plot No 02, Road No 12, DIT Project, Middle Badda, Dhaka-1212.
            </p>
          </div>

          {/* Meta line 1: Bill Submission Date on Left, TA/DA on Right */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mt-2.5 mb-1.5 px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800">Bill Submission Date:</span>
              <span className="font-mono text-slate-900 border-b border-dotted border-slate-700 px-1.5 min-w-[120px] inline-block">
                {bill.submissionDate}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300 print:border-slate-400">
                {bill.billNo}
              </span>
              <span className="text-base font-black tracking-wider uppercase text-[#002060]">
                TA/DA
              </span>
            </div>
          </div>

          {/* Meta line 2: Employee Name, Designation, ID with dotted baseline matching Word template */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-900 mb-2 px-1 py-1">
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-slate-800 whitespace-nowrap">Name of Employee:</span>
              <span className="font-bold text-slate-900 border-b border-dotted border-slate-700 flex-1 px-1 truncate">
                {bill.employeeName}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-slate-800 whitespace-nowrap">Designation:</span>
              <span className="text-slate-800 border-b border-dotted border-slate-700 flex-1 px-1 truncate">
                {bill.designation || '—'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-slate-800 whitespace-nowrap">ID:</span>
              <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-700 flex-1 px-1 truncate">
                {bill.employeeId || '—'}
              </span>
            </div>
          </div>

          {/* TA/DA Table (30 Rows style, matching exact DOCX layout) */}
          <div className="border border-slate-700 overflow-hidden mb-2 bg-transparent">
            <table className="w-full text-xs text-left border-collapse bg-transparent">
              <thead>
                <tr className="bg-slate-100/90 text-slate-900 font-bold border-b border-slate-700 text-[10.5px]">
                  <th className="py-1 px-1 border-r border-slate-600 text-center w-7">S/N</th>
                  <th className="py-1 px-1.5 border-r border-slate-600 text-center w-20">Date</th>
                  <th className="py-1 px-2 border-r border-slate-600">Particuiar</th>
                  <th className="py-1 px-2 border-r border-slate-600 w-28">Vehicle Name</th>
                  <th className="py-1 px-1 border-r border-slate-600 text-center w-9">Qty</th>
                  <th className="py-1 px-1.5 border-r border-slate-600 text-right w-18">Unit Tak</th>
                  <th className="py-1 px-2 border-r border-slate-600 text-right w-22">Total Taka</th>
                  <th className="py-1 px-1.5 text-center w-20">Checked by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[10px] font-medium text-slate-900 bg-transparent">
                {paddedItems.map((item, idx) => (
                  <tr key={idx} className="bg-transparent h-[21px]">
                    <td className="py-0 px-1 text-center border-r border-slate-300 font-bold bg-transparent">
                      {idx + 1}
                    </td>
                    <td className="py-0 px-1.5 text-center border-r border-slate-300 text-[9.5px] text-slate-700 whitespace-nowrap bg-transparent">
                      {item ? (item.date ? item.date.split('T')[0] : '') : ''}
                    </td>
                    <td className="py-0 px-2 border-r border-slate-300 font-medium bg-transparent leading-tight truncate max-w-[200px]">
                      {item ? item.particular : ''}
                    </td>
                    <td className="py-0 px-2 border-r border-slate-300 text-slate-800 bg-transparent truncate max-w-[100px]">
                      {item ? item.vehicleName || '—' : ''}
                    </td>
                    <td className="py-0 px-1 text-center border-r border-slate-300 bg-transparent">
                      {item ? item.qty : ''}
                    </td>
                    <td className="py-0 px-1.5 text-right font-mono border-r border-slate-300 bg-transparent">
                      {item ? formatTk(item.unitTaka) : ''}
                    </td>
                    <td className="py-0 px-2 text-right font-mono font-bold border-r border-slate-300 bg-transparent">
                      {item ? formatTk(item.totalTaka) : ''}
                    </td>
                    <td className="py-0 px-1 text-center border-slate-300 text-[9.5px] text-slate-600 bg-transparent">
                      {item ? item.checkedBy || 'Checked' : ''}
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="bg-slate-100/90 font-black border-t-2 border-slate-700 text-[11px]">
                  <td colSpan={6} className="py-1 px-3 text-right border-r border-slate-500 uppercase tracking-wider">
                    Total Taka (BDT):
                  </td>
                  <td className="py-1 px-2 text-right font-mono text-xs text-[#002060] border-r border-slate-500">
                    ৳ {grandTotalTk.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-1 text-center font-bold text-slate-700 text-[10px]">
                    {bill.status}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom 3-Signature Block matching exact docx */}
          <div className="pt-4 grid grid-cols-3 gap-6 text-center text-xs mt-2">
            <div>
              <div className="border-t border-dashed border-slate-700 pt-1 text-slate-800 font-bold text-[11px]">
                Received By:
              </div>
              <p className="text-[10px] text-slate-600 font-medium mt-0.5">{bill.receivedBy || '1 Service & Repair Technology'}</p>
            </div>

            <div>
              <div className="border-t border-dashed border-slate-700 pt-1 text-slate-800 font-bold text-[11px]">
                Checked By:
              </div>
              <p className="text-[10px] text-slate-600 font-medium mt-0.5">{bill.checkedBy || 'Accounts Department'}</p>
            </div>

            <div>
              <div className="border-t border-dashed border-slate-700 pt-1 text-slate-800 font-bold text-[11px]">
                Approved By:
              </div>
              <p className="text-[10px] text-slate-600 font-medium mt-0.5">{bill.approvedBy || 'Managing Authority'}</p>
            </div>
          </div>

          {/* Footer Line matching exact docx */}
          <div className="pt-3 text-[10px] font-medium text-slate-600 border-t border-slate-300 mt-4 flex items-center justify-between bg-transparent">
            <span>Form: TA/DA:</span>
            <span>Page 1 Of 1</span>
          </div>
        </div>
      </div>

      {/* Global CSS for Print */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .tada-doc-root {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            height: auto !important;
            background: white !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .watermark-container {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .watermark-container img {
            display: block !important;
            visibility: visible !important;
            opacity: 0.22 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};
