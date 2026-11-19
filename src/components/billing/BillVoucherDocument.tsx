import React from 'react';
import { BillVoucherRecord } from '../../types';

interface BillVoucherDocumentProps {
  voucher: BillVoucherRecord;
}

export const BillVoucherDocument: React.FC<BillVoucherDocumentProps> = ({ voucher }) => {
  // Pad items to at least 6 rows so it matches the exact document height in the sample image
  const items = voucher.items || [];
  const minRows = Math.max(6, items.length);
  const paddedItems: (typeof items[0] | null)[] = [...items];
  while (paddedItems.length < minRows) {
    paddedItems.push(null);
  }

  // Format currency
  const formatTk = (val: number | string | undefined | null) => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bill-voucher-doc relative bg-white text-slate-900 font-sans mx-auto p-6 sm:p-8 max-w-[820px] min-h-[1050px] shadow-sm print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full">
      
      {/* Centered Watermark Logo in Background */}
      <div 
        className="watermark-container absolute pointer-events-none select-none z-0 flex items-center justify-center print:block"
        style={{
          top: '550px',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '540px',
          maxWidth: '85%',
        }}
      >
        <img
          src="/watermark.jpg"
          alt="Watermark"
          className="w-full h-auto object-contain"
          style={{
            opacity: 0.30,
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
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          
          {/* Top Organization Header */}
          <div className="text-center mb-2">
            <h1 className="text-2xl sm:text-[26px] font-black text-[#14532d] tracking-wide uppercase font-sans">
              1 SERVICE &amp; REPAIR TECHNOLOGY
            </h1>

            {/* Colorful badges subtitle */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold mt-1.5">
              <span className="bg-[#1e40af] text-white px-1.5 py-0.5 rounded-[2px] leading-none">
                Medical
              </span>
              <span className="text-slate-800">,</span>
              <span className="bg-[#eab308] text-slate-900 px-1.5 py-0.5 rounded-[2px] leading-none">
                Clinical
              </span>
              <span className="text-slate-800">,</span>
              <span className="bg-[#c026d3] text-white px-1.5 py-0.5 rounded-[2px] leading-none">
                Diagnostic
              </span>
              <span className="text-slate-800">,</span>
              <span className="bg-[#16a34a] text-white px-1.5 py-0.5 rounded-[2px] leading-none">
                Industrial
              </span>
              <span className="text-slate-800">,</span>
              <span className="bg-[#1e40af] text-white px-1.5 py-0.5 rounded-[2px] leading-none">
                Garments
              </span>
              <span className="text-slate-800">&amp;</span>
              <span className="bg-[#16a34a] text-white px-1.5 py-0.5 rounded-[2px] leading-none">
                University Lab
              </span>
              <span className="text-slate-800 font-semibold ml-0.5">
                Equipment Service Centre
              </span>
            </div>

            <p className="text-[12px] text-slate-800 mt-1">
              Plot No. 02, Road No. 12, (DIT Project), Middle Badda, Dhaka-1212
            </p>
            <p className="text-[12px] text-slate-800">
              Cell: <span className="font-semibold">01778-116244, 01540-081230</span> | Email: <span className="font-semibold">oneservice116244@gmail.com</span>
            </p>
          </div>

          {/* Solid Green Separator Bar */}
          <div className="w-full h-[2.5px] bg-[#166534] my-2"></div>

          {/* Document Title Banner */}
          <div className="text-center my-2">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-[#166534]">
              MACHINE REPAIR BILL / SERVICE VOUCHER
            </h2>
          </div>

          {/* Table 1: Customer & Voucher Details */}
          <div className="mb-3 border border-slate-400 bg-white/70 text-xs">
            <div className="grid grid-cols-12 border-b border-slate-400">
              <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                Voucher No.:
              </div>
              <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900 border-r border-slate-400 font-mono">
                {voucher.voucherNo}
              </div>
              <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                Date:
              </div>
              <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900">
                {voucher.date}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-slate-400">
              <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                Customer / Institution:
              </div>
              <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900 border-r border-slate-400">
                {voucher.customerName}
              </div>
              <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                Mobile:
              </div>
              <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900">
                {voucher.mobile || ''}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                Address:
              </div>
              <div className="col-span-4 px-2 py-1.5 border-r border-slate-400 text-slate-800">
                {voucher.address || ''}
              </div>
              <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                Bill Type:
              </div>
              <div className="col-span-4 px-2 py-1.5 flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-default">
                  <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold text-slate-900">
                    {voucher.billType === 'REPAIR' || voucher.billType === 'BOTH' ? '✓' : ''}
                  </span>
                  <span>Repair</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-default">
                  <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold text-slate-900">
                    {voucher.billType === 'SERVICE' || voucher.billType === 'BOTH' ? '✓' : ''}
                  </span>
                  <span>Service</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section: Machine Information */}
          <div className="mb-3">
            <h3 className="text-xs font-bold text-slate-800 mb-1">
              Machine Information
            </h3>
            
            <div className="border border-slate-400 bg-white/70 text-xs">
              <div className="grid grid-cols-12 border-b border-slate-400">
                <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                  Machine Name:
                </div>
                <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900 border-r border-slate-400">
                  {voucher.machineName || ''}
                </div>
                <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                  Brand / Model:
                </div>
                <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900">
                  {voucher.brandModel || ''}
                </div>
              </div>

              <div className="grid grid-cols-12 border-b border-slate-400">
                <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                  Serial No.:
                </div>
                <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900 border-r border-slate-400 font-mono">
                  {voucher.serialNo || ''}
                </div>
                <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                  Department:
                </div>
                <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900">
                  {voucher.department || ''}
                </div>
              </div>

              <div className="grid grid-cols-12">
                <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                  Problem / Complaint:
                </div>
                <div className="col-span-4 px-2 py-1.5 text-slate-800 border-r border-slate-400">
                  {voucher.problemComplaint || ''}
                </div>
                <div className="col-span-2 px-2 py-1.5 font-bold border-r border-slate-400 bg-slate-50/80">
                  Received Date:
                </div>
                <div className="col-span-4 px-2 py-1.5 font-semibold text-slate-900">
                  {voucher.receivedDate || ''}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Repair / Service Details & Charges */}
          <div className="mb-3">
            <h3 className="text-xs font-bold text-[#166534] mb-1">
              Repair / Service Details &amp; Charges
            </h3>

            <div className="border border-slate-400 overflow-hidden bg-white/70">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#166534] text-white font-bold uppercase text-[11px] print:bg-[#166534] print:text-white">
                    <th className="py-1.5 px-2 text-center border-r border-slate-400 w-10 font-bold">SL</th>
                    <th className="py-1.5 px-3 text-center border-r border-slate-400 font-bold">Parts / Work Description</th>
                    <th className="py-1.5 px-2 text-center border-r border-slate-400 w-14 font-bold">Qty</th>
                    <th className="py-1.5 px-3 text-center border-r border-slate-400 w-24 font-bold">Unit Price<br/>(TK)</th>
                    <th className="py-1.5 px-3 text-center border-r border-slate-400 w-28 font-bold">Amount<br/>(TK)</th>
                    <th className="py-1.5 px-3 text-center w-28 font-bold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {paddedItems.map((item, index) => {
                    const slNum = index + 1;
                    return (
                      <tr
                        key={index}
                        className="border-b border-slate-400"
                        style={{ height: '26px' }}
                      >
                        <td className="py-1 px-2 text-center border-r border-slate-400 font-medium">
                          {item ? item.sl || slNum : slNum}
                        </td>
                        <td className="py-1 px-3 text-left border-r border-slate-400 font-medium text-slate-900">
                          {item ? item.description : ''}
                        </td>
                        <td className="py-1 px-2 text-center border-r border-slate-400 font-mono">
                          {item ? item.qty : ''}
                        </td>
                        <td className="py-1 px-3 text-right border-r border-slate-400 font-mono">
                          {item ? formatTk(item.unitPrice) : ''}
                        </td>
                        <td className="py-1 px-3 text-right border-r border-slate-400 font-mono font-semibold">
                          {item ? formatTk(item.amount) : ''}
                        </td>
                        <td className="py-1 px-3 text-left text-slate-700 text-[11px]">
                          {item ? item.remarks || '' : ''}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Subtotal & Summary Rows */}
                  <tr className="border-b border-slate-400 font-medium">
                    <td colSpan={4} className="py-1 px-3 text-left font-bold border-r border-slate-400 pl-4">
                      Parts / Spare Parts Total (TK)
                    </td>
                    <td className="py-1 px-3 text-right font-bold border-r border-slate-400 font-mono">
                      {formatTk(voucher.partsTotal)}
                    </td>
                    <td className="py-1 px-3"></td>
                  </tr>

                  <tr className="border-b border-slate-400 font-medium">
                    <td colSpan={4} className="py-1 px-3 text-left font-bold border-r border-slate-400 pl-4">
                      Repair / Service Charge (TK)
                    </td>
                    <td className="py-1 px-3 text-right font-bold border-r border-slate-400 font-mono">
                      {formatTk(voucher.serviceCharge)}
                    </td>
                    <td className="py-1 px-3"></td>
                  </tr>

                  <tr className="border-b border-slate-400 font-medium">
                    <td colSpan={4} className="py-1 px-3 text-left font-bold border-r border-slate-400 pl-4">
                      Discount (TK)
                    </td>
                    <td className="py-1 px-3 text-right font-bold border-r border-slate-400 font-mono">
                      {Number(voucher.discount) > 0 ? `-${formatTk(voucher.discount)}` : '0.00'}
                    </td>
                    <td className="py-1 px-3"></td>
                  </tr>

                  {/* GRAND TOTAL Row (Highlighted Sage/Light Green) */}
                  <tr className="bg-[#e2e8f0]/80 print:bg-[#dcfce7] font-black text-xs sm:text-sm">
                    <td colSpan={4} className="py-1.5 px-3 text-center uppercase tracking-wide border-r border-slate-400">
                      GRAND TOTAL (TK)
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-black border-r border-slate-400">
                      {formatTk(voucher.grandTotal)}
                    </td>
                    <td className="py-1.5 px-3 text-center font-bold text-[11px] uppercase">
                      {voucher.paymentStatus}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words & Warranty Terms */}
          <div className="space-y-1 text-xs mb-4">
            <p className="text-slate-900">
              <span className="font-bold">Amount in Words: </span>
              <span className="font-semibold text-slate-800 italic">
                {voucher.amountInWords || 'Thirty-Three Thousand Only'}
              </span>
            </p>
            <p className="text-slate-900">
              <span className="font-bold">Service / Warranty Terms: </span>
              <span className="text-slate-800">
                {voucher.warrantyTerms || '1 year Panel Service Warranty'}
              </span>
            </p>
          </div>

          {/* Payment Status & Payment Method Checkboxes */}
          <div className="pt-2 text-xs font-medium text-slate-900 flex flex-wrap items-center gap-x-6 gap-y-2 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-bold">Payment Status:</span>
              <label className="flex items-center gap-1 cursor-default">
                <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold">
                  {voucher.paymentStatus === 'PAID' ? '✓' : ''}
                </span>
                <span>Paid</span>
              </label>
              <label className="flex items-center gap-1 cursor-default">
                <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold">
                  {voucher.paymentStatus === 'DUE' ? '✓' : ''}
                </span>
                <span>Due</span>
              </label>
              <label className="flex items-center gap-1 cursor-default">
                <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold">
                  {voucher.paymentStatus === 'PARTIAL' ? '✓' : ''}
                </span>
                <span>Partial</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-bold">Payment Method:</span>
              <label className="flex items-center gap-1 cursor-default">
                <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold">
                  {voucher.paymentMethod === 'CASH' ? '✓' : ''}
                </span>
                <span>Cash</span>
              </label>
              <label className="flex items-center gap-1 cursor-default">
                <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold">
                  {voucher.paymentMethod === 'BANK' ? '✓' : ''}
                </span>
                <span>Bank</span>
              </label>
              <label className="flex items-center gap-1 cursor-default">
                <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold">
                  {voucher.paymentMethod === 'BKASH' ? '✓' : ''}
                </span>
                <span>bKash</span>
              </label>
              <label className="flex items-center gap-1 cursor-default">
                <span className="w-3.5 h-3.5 border border-slate-700 rounded-[2px] inline-flex items-center justify-center text-[10px] font-bold">
                  {voucher.paymentMethod === 'OTHER' ? '✓' : ''}
                </span>
                <span>Other: {voucher.paymentMethod === 'OTHER' && voucher.paymentMethodOther ? voucher.paymentMethodOther : '_________'}</span>
              </label>
            </div>
          </div>

          {/* Three Signature Blocks */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs font-semibold text-slate-800">
            <div>
              <div className="border-t border-slate-800 pt-1.5 mx-auto w-40">
                <p className="font-bold text-slate-900">Prepared By</p>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-800 pt-1.5 mx-auto w-40">
                <p className="font-bold text-slate-900">Authorized Signature</p>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-800 pt-1.5 mx-auto w-44">
                <p className="font-bold text-slate-900">Customer Signature &amp; Seal</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Footer Note */}
        <div className="pt-8 pb-2 text-center text-xs font-semibold text-slate-800">
          <p>Thank you for choosing One Service &amp; Repair Technology.</p>
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
          .bill-voucher-doc {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            background: white !important;
          }
          .watermark-container {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .watermark-container img {
            display: block !important;
            visibility: visible !important;
            opacity: 0.30 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

