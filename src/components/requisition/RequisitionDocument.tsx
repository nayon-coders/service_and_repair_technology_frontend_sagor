import React from 'react';
import { RequisitionRecord } from '../../types';

interface RequisitionDocumentProps {
  requisition: RequisitionRecord;
}

export const RequisitionDocument: React.FC<RequisitionDocumentProps> = ({ requisition }) => {
  const spareParts = (requisition.items || []).filter((it) => it.category === 'SPARE_PARTS');
  const serviceItems = (requisition.items || []).filter((it) => it.category === 'SERVICE_LABOUR');

  // Pad spare parts to at least 4 rows to match docx
  const minSparePartsRows = Math.max(4, spareParts.length);
  const paddedSpareParts: (typeof spareParts[0] | null)[] = [...spareParts];
  while (paddedSpareParts.length < minSparePartsRows) {
    paddedSpareParts.push(null);
  }

  // Pad service items to at least 1 row
  const minServiceRows = Math.max(1, serviceItems.length);
  const paddedService: (typeof serviceItems[0] | null)[] = [...serviceItems];
  while (paddedService.length < minServiceRows) {
    paddedService.push(null);
  }

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
    <div className="requisition-doc relative bg-white text-slate-900 font-sans mx-auto p-6 sm:p-8 max-w-[820px] min-h-[1050px] shadow-sm print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full overflow-hidden">
      
      {/* Centered Watermark Logo - Positioned directly behind the Estimated Cost Breakdown Table */}
      <div 
        className="watermark-container absolute pointer-events-none select-none z-0 flex items-center justify-center print:block"
        style={{
          top: '560px',
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
            opacity: 0.32,
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
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            {/* Logo */}
            <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="1 Service & Repair Technology"
                className="max-h-24 max-w-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </div>

            {/* Organization Title */}
            <div className="flex-1 text-left pt-1">
              <h1 className="text-xl sm:text-[22px] font-black text-slate-900 tracking-tight leading-tight">
                1 service &amp; Repair Technology
              </h1>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 tracking-wide uppercase mt-0.5 leading-snug">
                MEDICAL, CLINICAL, GARMENTS, UNIVERSITY<br/>
                LAB &amp; DIAGNOSTICS SERVICE CENTRE
              </p>
            </div>

            {/* Contact details on right */}
            <div className="text-right text-[10px] sm:text-[11px] text-slate-800 font-medium leading-relaxed flex-shrink-0 max-w-[280px]">
              <p>Plot 02, Road 12, DIT Project, Middle Badda, Dhaka-1212.</p>
              <p>Cell: <span className="font-semibold">+8801778-116244, 01540-01230</span></p>
              <p>E-mail: <span className="font-semibold">oneservice116244@gmail.com</span></p>
              <p>Web: <span className="font-semibold">www.oneserviceandrepairtechnology.com</span></p>
            </div>
          </div>

          {/* Section: Title Banner & Estimate Meta */}
          <div className="flex items-stretch border-2 border-[#002060] mb-2.5 overflow-hidden bg-white">
            <div className="bg-[#002060] text-white flex-1 px-3 py-1 flex items-center print:bg-[#002060]">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                REPAIR COST ESTIMATE
              </h2>
            </div>

            <div className="w-60 bg-white px-2.5 py-1 text-[11px] border-l-2 border-[#002060] flex flex-col justify-center space-y-0.5">
              <div className="flex justify-between">
                <span className="font-bold text-slate-800">Estimate No :</span>
                <span className="font-semibold font-mono text-slate-900">{requisition.estimateNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-800">Date :</span>
                <span className="font-medium text-slate-900">{requisition.date}</span>
              </div>
              {requisition.validUpTo && (
                <div className="flex justify-between">
                  <span className="font-bold text-slate-800">Valid Up To :</span>
                  <span className="font-medium text-slate-900">{requisition.validUpTo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Customer Information & Equipment Details (2-Column Box) */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            
            {/* Customer Information Box */}
            <div className="border border-slate-400 bg-transparent overflow-hidden">
              <div className="bg-[#002060] text-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider print:bg-[#002060] print:text-white">
                CUSTOMER INFORMATION
              </div>
              <div className="p-2 text-xs space-y-1.5 bg-transparent">
                <div className="grid grid-cols-12">
                  <span className="col-span-5 font-bold text-slate-800">Organization Name :</span>
                  <span className="col-span-7 font-semibold text-slate-900">{requisition.organizationName}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 font-bold text-slate-800">Department/Ward :</span>
                  <span className="col-span-7 text-slate-800">{requisition.departmentWard || '—'}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 font-bold text-slate-800">Contact Person :</span>
                  <span className="col-span-7 text-slate-800">{requisition.contactPerson || '—'}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 font-bold text-slate-800">Contact No :</span>
                  <span className="col-span-7 text-slate-800 font-mono">{requisition.contactNo || '—'}</span>
                </div>
              </div>
            </div>

            {/* Equipment Details Box */}
            <div className="border border-slate-400 bg-transparent overflow-hidden">
              <div className="bg-[#002060] text-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider print:bg-[#002060] print:text-white">
                EQUIPMENT DETAILS
              </div>
              <div className="p-2 text-xs space-y-1.5 bg-transparent">
                <div className="grid grid-cols-12">
                  <span className="col-span-5 font-bold text-slate-800">Equipment Name :</span>
                  <span className="col-span-7 font-semibold text-slate-900">{requisition.equipmentName || '—'}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 font-bold text-slate-800">Brand :</span>
                  <span className="col-span-7 text-slate-800">{requisition.brand || '—'}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 font-bold text-slate-800">Model :</span>
                  <span className="col-span-7 text-slate-800">{requisition.model || '—'}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 font-bold text-slate-800">Serial No. :</span>
                  <span className="col-span-7 text-slate-800 font-mono">{requisition.serialNo || '—'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section: Fault Description / Problem */}
          <div className="border border-slate-400 bg-transparent overflow-hidden mb-3">
            <div className="bg-[#002060] text-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider print:bg-[#002060] print:text-white">
              FAULT DESCRIPTION / PROBLEM
            </div>
            <div className="p-2 text-xs text-slate-800 min-h-[34px] bg-transparent">
              {requisition.faultDescription || 'Inspection and diagnostic estimate as requested.'}
            </div>
          </div>

          {/* Section: Estimated Cost Breakdown Table (With Transparent Background to show Watermark) */}
          <div className="border border-slate-400 bg-transparent overflow-hidden mb-3">
            <div className="bg-[#002060] text-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider print:bg-[#002060] print:text-white">
              ESTIMATED COST BREAKDOWN
            </div>

            <table className="w-full border-collapse text-xs bg-transparent">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-400">
                  <th className="py-1 px-2 text-center border-r border-slate-400 w-12">SL. No.</th>
                  <th className="py-1 px-3 text-center border-r border-slate-400">DESCRIPTION</th>
                  <th className="py-1 px-2 text-center border-r border-slate-400 w-14">QTY</th>
                  <th className="py-1 px-3 text-center border-r border-slate-400 w-28">UNIT PRICE (BDT)</th>
                  <th className="py-1 px-3 text-center border-r border-slate-400 w-28">TOTAL PRICE (BDT)</th>
                  <th className="py-1 px-3 text-center w-28">REMARKS</th>
                </tr>
              </thead>
              <tbody className="bg-transparent">
                
                {/* Section A Banner: Spare Parts (Translucent Blue) */}
                <tr className="bg-[#bae6fd]/70 print:bg-[#bae6fd] text-[#002060] font-bold border-b border-slate-400">
                  <td colSpan={6} className="py-1 px-3 text-center tracking-wider text-xs uppercase">
                    A. SPARE PARTS
                  </td>
                </tr>

                {/* Spare parts items (Transparent rows to clearly display Watermark) */}
                {paddedSpareParts.map((item, index) => {
                  const slNum = index + 1;
                  return (
                    <tr key={`sp-${index}`} className="border-b border-slate-400 bg-transparent" style={{ height: '26px' }}>
                      <td className="py-1 px-2 text-center border-r border-slate-400 font-medium">
                        {item ? item.sl || slNum : slNum}
                      </td>
                      <td className="py-1 px-3 text-left border-r border-slate-400 text-slate-900 font-medium">
                        {item ? item.description : ''}
                      </td>
                      <td className="py-1 px-2 text-center border-r border-slate-400 font-mono">
                        {item ? item.qty : ''}
                      </td>
                      <td className="py-1 px-3 text-right border-r border-slate-400 font-mono">
                        {item ? formatTk(item.unitPrice) : ''}
                      </td>
                      <td className="py-1 px-3 text-right border-r border-slate-400 font-mono font-semibold">
                        {item ? formatTk(item.totalPrice) : ''}
                      </td>
                      <td className="py-1 px-3 text-center text-slate-700 text-[11px]">
                        {item ? item.remarks || '' : index === 3 ? 'Repairable / Not-Repairable' : ''}
                      </td>
                    </tr>
                  );
                })}

                {/* Section B Banner: Service & Labour (Translucent Blue) */}
                <tr className="bg-[#bae6fd]/70 print:bg-[#bae6fd] text-[#002060] font-bold border-b border-slate-400">
                  <td colSpan={6} className="py-1 px-3 text-center tracking-wider text-xs uppercase">
                    B. SERVICE &amp; LABOUR
                  </td>
                </tr>

                {/* Service & Labour items */}
                {paddedService.map((item, index) => {
                  const slNum = index + 1;
                  return (
                    <tr key={`srv-${index}`} className="border-b border-slate-400 bg-transparent" style={{ height: '26px' }}>
                      <td className="py-1 px-2 text-center border-r border-slate-400 font-medium">
                        {item ? item.sl || slNum : slNum}
                      </td>
                      <td className="py-1 px-3 text-left border-r border-slate-400 text-slate-900 font-medium">
                        {item ? item.description : 'Labour Service'}
                      </td>
                      <td className="py-1 px-2 text-center border-r border-slate-400 font-mono">
                        {item ? item.qty : '1'}
                      </td>
                      <td className="py-1 px-3 text-right border-r border-slate-400 font-mono">
                        {item ? formatTk(item.unitPrice) : ''}
                      </td>
                      <td className="py-1 px-3 text-right border-r border-slate-400 font-mono font-semibold">
                        {item ? formatTk(item.totalPrice) : ''}
                      </td>
                      <td className="py-1 px-3 text-center text-slate-700 text-[11px]">
                        {item ? item.remarks || '' : ''}
                      </td>
                    </tr>
                  );
                })}

                {/* SUB TOTAL */}
                <tr className="border-b border-slate-400 font-bold bg-transparent">
                  <td colSpan={4} className="py-1.5 px-3 text-right border-r border-slate-400 uppercase tracking-wide">
                    SUB TOTAL
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold border-r border-slate-400">
                    {formatTk(requisition.subTotal)}
                  </td>
                  <td className="py-1.5 px-3"></td>
                </tr>

                {/* DISCOUNT (if any) */}
                {Number(requisition.discount) > 0 && (
                  <tr className="border-b border-slate-400 font-bold text-rose-700 bg-transparent">
                    <td colSpan={4} className="py-1.5 px-3 text-right border-r border-slate-400 uppercase tracking-wide">
                      DISCOUNT
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold border-r border-slate-400">
                      -{formatTk(requisition.discount)}
                    </td>
                    <td className="py-1.5 px-3"></td>
                  </tr>
                )}

                {/* GRAND TOTAL */}
                <tr className="bg-slate-100/90 print:bg-slate-100 font-black text-xs sm:text-sm">
                  <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-400 uppercase tracking-wider text-slate-900">
                    GRAND TOTAL
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-black border-r border-slate-400 text-slate-900">
                    {formatTk(requisition.grandTotal)}
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-[11px] uppercase">
                    {requisition.status}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Client request paragraph */}
          <div className="text-xs text-slate-800 leading-relaxed mb-6 bg-transparent">
            <p>
              We kindly request your approval to proceed with the above-mentioned repair work. Upon approval, we will complete the service as soon as possible.
            </p>
            <p className="mt-0.5">Thank you for your cooperation.</p>
          </div>

          {/* Two-Column Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-12 text-xs bg-transparent">
            <div>
              <p className="font-bold text-slate-900">Prepared By:</p>
              <p className="text-slate-800 font-medium">1 Service &amp; Repair Technology.</p>
              <div className="mt-10 border-t border-slate-700 pt-1 w-48">
                <p className="font-semibold text-slate-800">Authorized Signature</p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <p className="font-bold text-slate-900">Client Approval</p>
              {requisition.clientApprovalNote && (
                <p className="text-[11px] text-slate-600 italic max-w-xs">{requisition.clientApprovalNote}</p>
              )}
              <div className="mt-14 border-t border-slate-700 pt-1 w-48 text-center">
                <p className="font-semibold text-slate-800">Seal &amp; Signature</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Tagline */}
        <div className="pt-8 pb-1 text-center text-[11px] font-semibold text-slate-700 border-t border-slate-300 mt-6 bg-transparent">
          <p>All kinds of Medical, Hospital, Garments, Industrial &amp; University lab equipment Service Centre.</p>
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
          .requisition-doc {
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
            opacity: 0.32 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};
