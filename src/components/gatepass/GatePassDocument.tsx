import React from 'react';
import { GatePassRecord } from '../../types';

interface GatePassDocumentProps {
  gatePass: GatePassRecord;
}

export const GatePassDocument: React.FC<GatePassDocumentProps> = ({ gatePass }) => {
  const isReturnChallan = gatePass.challanKind === 'RETURN';

  // Render Watermark helper
  const renderWatermark = () => (
    <div 
      className="watermark-container absolute pointer-events-none select-none z-0 flex items-center justify-center print:flex"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '480px',
        maxWidth: '80%',
      }}
    >
      <img
        src="/watermark.jpg"
        alt="Watermark"
        className="w-full h-auto object-contain"
        style={{
          opacity: 0.28,
          filter: 'contrast(1.05)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/logo.png';
        }}
      />
    </div>
  );

  // Checkbox helper
  const CheckboxItem = ({ checked, label }: { checked: boolean; label: string }) => (
    <span className="inline-flex items-center gap-1 mr-3 my-0.5 text-xs text-slate-900">
      <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border rounded-sm text-[10px] font-bold ${
        checked ? 'bg-[#002060] border-[#002060] text-white' : 'border-slate-500 bg-white'
      }`}>
        {checked ? '✓' : ''}
      </span>
      <span>{label}</span>
    </span>
  );

  if (isReturnChallan) {
    // =========================================================================
    // 2. মেশিন ফেরত চালান (MACHINE RETURN CHALLAN) - EXACT 1 PAGE
    // =========================================================================
    const returnCond = gatePass.returnCondition || '';

    return (
      <div className="gate-pass-print-root text-slate-900 font-sans">
        <div className="sheet relative bg-white mx-auto p-6 sm:p-7 max-w-[820px] shadow-sm print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:min-h-0 print:h-auto overflow-hidden">
          
          {/* Centered Watermark */}
          {renderWatermark()}

          {/* Sheet Content Layer */}
          <div className="relative z-10 bg-transparent">
            {/* Header */}
            <div className="text-center pt-1 pb-3 border-b border-slate-300">
              <h1 className="text-xl sm:text-2xl font-black text-[#002060] tracking-tight uppercase">
                ONE SERVICE &amp; REPAIR TECHNOLOGY
              </h1>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                মেশিন ফেরত চালান
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 italic">
                মেশিন সংশ্লিষ্ট প্রতিষ্ঠানে ফেরত দেওয়ার সময় এই অংশ পূরণ করুন।
              </p>
            </div>

            {/* Top Meta Table (3 Cells) */}
            <table className="w-full text-xs text-left border-collapse border border-slate-400 mt-3 mb-3 bg-transparent">
              <thead>
                <tr className="bg-[#e0f2fe] text-slate-900 font-bold">
                  <th className="py-1.5 px-3 border border-slate-400 w-1/3">গেটপাস নম্বর</th>
                  <th className="py-1.5 px-3 border border-slate-400 w-1/3">ফেরত দেওয়ার তারিখ</th>
                  <th className="py-1.5 px-3 border border-slate-400 w-1/3">সার্ভিস রিপোর্ট / চালান নম্বর</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-transparent font-medium">
                  <td className="py-2 px-3 border border-slate-400 font-mono font-bold text-slate-900">
                    {gatePass.passNo}
                  </td>
                  <td className="py-2 px-3 border border-slate-400 text-slate-800">
                    {gatePass.returnDate || gatePass.date}
                  </td>
                  <td className="py-2 px-3 border border-slate-400 text-slate-800">
                    {gatePass.serviceReportNo || gatePass.referenceWorkOrderNo || '—'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Organization and Machine Quick Reference */}
            <div className="bg-slate-50/80 border border-slate-300 rounded p-2.5 mb-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-700">গ্রহীতা প্রতিষ্ঠান: </span>
                  <span className="font-semibold text-slate-900">{gatePass.organizationName}</span>
                  {gatePass.departmentWard && <span> ({gatePass.departmentWard})</span>}
                </div>
                <div>
                  <span className="font-bold text-slate-700">মেশিনের নাম / মডেল: </span>
                  <span className="font-semibold text-slate-900">
                    {gatePass.machineName || (gatePass.items?.[0]?.description) || '—'}
                  </span>
                  {gatePass.serialNo && <span className="font-mono text-slate-600"> (S/N: {gatePass.serialNo})</span>}
                </div>
              </div>
            </div>

            {/* মেশিন ফেরতের অবস্থা */}
            <div className="mb-3">
              <h3 className="text-xs font-bold text-[#002060] uppercase tracking-wide mb-1">
                মেশিন ফেরতের অবস্থা
              </h3>
              <div className="border border-slate-300 rounded p-2 bg-transparent flex flex-wrap items-center">
                <CheckboxItem checked={returnCond === 'মেরামত ও পরীক্ষা সম্পন্ন'} label="মেরামত ও পরীক্ষা সম্পন্ন" />
                <CheckboxItem checked={returnCond === 'আংশিক মেরামত'} label="আংশিক মেরামত" />
                <CheckboxItem checked={returnCond === 'মেরামত ছাড়াই ফেরত'} label="মেরামত ছাড়াই ফেরত" />
                <CheckboxItem checked={returnCond === 'আরও মেরামত প্রয়োজন'} label="আরও মেরামত প্রয়োজন" />
              </div>
            </div>

            {/* সম্পন্ন কাজ / মন্তব্য */}
            <div className="mb-3">
              <h3 className="text-xs font-bold text-slate-900 mb-1">
                সম্পন্ন কাজ / মন্তব্য:
              </h3>
              <div className="border border-slate-300 rounded p-2.5 min-h-[60px] text-xs text-slate-800 bg-transparent leading-relaxed whitespace-pre-wrap">
                {gatePass.workDoneComments || 'মেশিনের সার্ভিসিং এবং ডায়াগনস্টিক পরীক্ষা সন্তোষজনকভাবে সম্পন্ন হয়েছে।'}
              </div>
            </div>

            {/* ফেরত দেওয়া অ্যাক্সেসরিজ */}
            <div className="mb-3">
              <h3 className="text-xs font-bold text-slate-900 mb-1">
                ফেরত দেওয়া অ্যাক্সেসরিজ:
              </h3>
              <div className="border border-slate-300 rounded p-2.5 min-h-[45px] text-xs text-slate-800 bg-transparent leading-relaxed whitespace-pre-wrap">
                {gatePass.returnedAccessories || gatePass.accessoriesReceived || 'মূল পাওয়ার ক্যাবল এবং প্রয়োজনীয় সংযোগকারী অ্যাক্সেসরিজ ফেরত দেওয়া হলো।'}
              </div>
            </div>

            {/* বাকি সমস্যা / পরামর্শ */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-900 mb-1">
                বাকি সমস্যা / পরামর্শ:
              </h3>
              <div className="border border-slate-300 rounded p-2.5 min-h-[45px] text-xs text-slate-800 bg-transparent leading-relaxed whitespace-pre-wrap">
                {gatePass.pendingIssuesAdvice || 'নিয়মিত ভোল্টেজ স্টেবিলাইজার ব্যবহারের পরামর্শ দেওয়া হলো।'}
              </div>
            </div>

            {/* মেশিন বুঝে পাওয়ার স্বীকৃতি */}
            <div className="mb-4 p-2.5 border border-slate-300 bg-slate-50/70 rounded">
              <h3 className="text-xs font-bold text-[#002060] mb-0.5">
                মেশিন বুঝে পাওয়ার স্বীকৃতি
              </h3>
              <p className="text-xs text-slate-800 font-medium">
                আমি / আমরা প্রতিষ্ঠানের পক্ষে উপরোক্ত মেশিন ও উল্লেখিত অ্যাক্সেসরিজ বুঝে পেয়েছি।
              </p>
            </div>

            {/* ২ কলাম স্বাক্ষর টেবিল */}
            <table className="w-full text-xs text-center border-collapse border border-slate-400 mt-4 bg-transparent">
              <thead>
                <tr className="bg-[#e0f2fe] text-slate-900 font-bold">
                  <th className="py-2 px-3 border border-slate-400 w-1/2">
                    প্রতিষ্ঠানের পক্ষে গ্রহণকারী
                  </th>
                  <th className="py-2 px-3 border border-slate-400 w-1/2">
                    ONE SERVICE &amp; REPAIR TECHNOLOGY-এর পক্ষে ফেরত প্রদানকারী
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-transparent">
                  <td className="py-10 px-4 border border-slate-400 align-bottom">
                    <div className="border-t border-dashed border-slate-400 pt-1 text-slate-700 font-medium">
                      স্বাক্ষর ও সিল:
                    </div>
                  </td>
                  <td className="py-10 px-4 border border-slate-400 align-bottom">
                    <div className="border-t border-dashed border-slate-400 pt-1 text-slate-700 font-medium">
                      স্বাক্ষর ও সিল:
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* দ্রষ্টব্য */}
            <p className="text-[11px] text-slate-600 mt-3 italic text-center">
              দ্রষ্টব্য: এই নথি মেশিনের চলাচল ও হস্তান্তরের রেকর্ড। এটি প্রতিষ্ঠানের নিজস্ব অফিসিয়াল গেটপাস বা লিখিত সার্ভিস চুক্তির বিকল্প নয়।
            </p>

            {/* Footer */}
            <div className="pt-3 text-center text-[11px] font-semibold text-slate-600 border-t border-slate-300 mt-4 bg-transparent">
              <p>ONE SERVICE &amp; REPAIR TECHNOLOGY | মেশিন গেটপাস</p>
            </div>
          </div>
        </div>

        {/* Global Print Styling for Single Page */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            body {
              background: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .gate-pass-print-root {
              width: 100% !important;
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .sheet {
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: 0 !important;
              height: auto !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
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
              opacity: 0.28 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // =========================================================================
  // 1. মেশিন গ্রহণ চালান (MACHINE RECEIVING CHALLAN) - EXACT 2 PAGES
  // Zero empty pages!
  // Page 1: Header + Meta + Sections 1, 2, 3 + Conditions 1-5 + Footer 1/2
  // Page 2: Header reference + Conditions 6-7 + Section 5 (3 Signatures) + Footer 2/2
  // Both pages have their own centered watermark!
  // =========================================================================
  const category = gatePass.gatePassCategory || 'মেরামতের জন্য মেশিন গ্রহণ';
  const mCondition = gatePass.machineCondition || 'অচল';
  const tPurpose = gatePass.transportPurpose || 'সার্ভিসিং';

  return (
    <div className="gate-pass-print-root text-slate-900 font-sans space-y-6 print:space-y-0">
      
      {/* ===================== PAGE 1 ===================== */}
      <div className="sheet sheet-page-1 relative bg-white mx-auto p-5 sm:p-7 max-w-[820px] shadow-sm print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:min-h-0 print:h-auto overflow-hidden">
        
        {/* Centered Watermark for Page 1 */}
        {renderWatermark()}

        {/* Content of Page 1 */}
        <div className="relative z-10 bg-transparent">
          {/* Header */}
          <div className="text-center pt-0 pb-2 border-b border-slate-300">
            <h1 className="text-lg sm:text-[22px] font-black text-[#002060] tracking-tight uppercase leading-tight">
              ONE SERVICE &amp; REPAIR TECHNOLOGY
            </h1>
            <p className="text-[11px] text-slate-800 font-medium mt-0.5 leading-snug">
              প্লট নং ০২, রোড নং ১২, মধ্যবাড্ডা, ঢাকা–১২১২ | মোবাইল: ০১৭৭৮-১১৬২৪৪, ০১৫৪০-০৮১২৩০
            </p>
            <h2 className="text-sm sm:text-base font-black text-slate-900 mt-0.5 uppercase tracking-wide">
              গেটপাস
            </h2>
            <h3 className="text-xs sm:text-sm font-bold text-[#002060]">
              মেশিন গ্রহণ চালান
            </h3>
          </div>

          {/* Top Table: গেটপাস নম্বর, তারিখ, রেফারেন্স */}
          <table className="w-full text-xs text-left border-collapse border border-slate-400 mt-2 mb-1.5 bg-transparent">
            <thead>
              <tr className="bg-[#e0f2fe] text-slate-900 font-bold">
                <th className="py-1 px-2.5 border border-slate-400 w-1/3">গেটপাস নম্বর</th>
                <th className="py-1 px-2.5 border border-slate-400 w-1/3">তারিখ</th>
                <th className="py-1 px-2.5 border border-slate-400 w-1/3">রেফারেন্স / কাজের অর্ডার নম্বর</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-transparent font-medium">
                <td className="py-1 px-2.5 border border-slate-400 font-mono font-bold text-slate-900">
                  {gatePass.passNo}
                </td>
                <td className="py-1 px-2.5 border border-slate-400 text-slate-800">
                  {gatePass.date}
                </td>
                <td className="py-1 px-2.5 border border-slate-400 text-slate-800">
                  {gatePass.referenceWorkOrderNo || '—'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* গেটপাসের ধরন Checkboxes */}
          <div className="py-0.5 px-0.5 mb-1.5 text-xs flex flex-wrap items-center">
            <span className="font-bold text-slate-800 mr-2">গেটপাসের ধরন:</span>
            <CheckboxItem checked={category === 'মেরামতের জন্য মেশিন গ্রহণ'} label="মেরামতের জন্য মেশিন গ্রহণ" />
            <CheckboxItem checked={category === 'মেরামত শেষে মেশিন ফেরত'} label="মেরামত শেষে মেশিন ফেরত" />
            <CheckboxItem checked={category === 'পরীক্ষা-নিরীক্ষার জন্য'} label="পরীক্ষা-নিরীক্ষার জন্য" />
            <CheckboxItem checked={category.startsWith('অন্যান্য')} label={category.startsWith('অন্যান্য') ? category : 'অন্যান্য: _________'} />
          </div>

          {/* ১. প্রতিষ্ঠান / সংস্থার তথ্য */}
          <div className="mb-2">
            <h4 className="text-[11.5px] font-bold text-slate-900 mb-0.5">
              ১. প্রতিষ্ঠান / সংস্থার তথ্য
            </h4>
            <table className="w-full text-xs border-collapse border border-slate-400 bg-transparent">
              <thead>
                <tr className="bg-[#e0f2fe] text-slate-900 font-bold">
                  <th className="py-1 px-2.5 border border-slate-400 w-1/3">বিবরণ</th>
                  <th className="py-1 px-2.5 border border-slate-400 w-2/3">তথ্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
                <tr className="bg-transparent">
                  <td className="py-1 px-2.5 border border-slate-400 font-semibold text-slate-700">প্রতিষ্ঠান / সংস্থার নাম</td>
                  <td className="py-1 px-2.5 border border-slate-400 font-bold text-slate-900">{gatePass.organizationName}</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2.5 border border-slate-400 font-semibold text-slate-700">বিভাগ / ইউনিট</td>
                  <td className="py-1 px-2.5 border border-slate-400 text-slate-800">{gatePass.departmentWard || '—'}</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2.5 border border-slate-400 font-semibold text-slate-700">প্রতিষ্ঠানের ঠিকানা</td>
                  <td className="py-1 px-2.5 border border-slate-400 text-slate-800">{gatePass.address || gatePass.destination || '—'}</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2.5 border border-slate-400 font-semibold text-slate-700">যোগাযোগকারী ব্যক্তির নাম ও মোবাইল</td>
                  <td className="py-1 px-2.5 border border-slate-400 text-slate-800">
                    {gatePass.contactPerson ? `${gatePass.contactPerson} (${gatePass.contactNo || ''})` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ২. মেশিনের বিবরণ */}
          <div className="mb-2">
            <h4 className="text-[11.5px] font-bold text-slate-900 mb-0.5">
              ২. মেশিনের বিবরণ
            </h4>
            <table className="w-full text-xs border-collapse border border-slate-400 bg-transparent">
              <thead>
                <tr className="bg-[#e0f2fe] text-slate-900 font-bold">
                  <th className="py-1 px-2 border border-slate-400 w-1/4">বিবরণ</th>
                  <th className="py-1 px-2 border border-slate-400 w-1/4">তথ্য</th>
                  <th className="py-1 px-2 border border-slate-400 w-1/4">বিবরণ</th>
                  <th className="py-1 px-2 border border-slate-400 w-1/4">তথ্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
                <tr className="bg-transparent">
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">মেশিনের নাম</td>
                  <td className="py-1 px-2 border border-slate-400 font-bold text-slate-900">
                    {gatePass.machineName || gatePass.items?.[0]?.description || '—'}
                  </td>
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">পরিমাণ</td>
                  <td className="py-1 px-2 border border-slate-400 font-bold text-slate-900">
                    {gatePass.quantity || 1} টি
                  </td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">ব্র্যান্ড / প্রস্তুতকারক</td>
                  <td className="py-1 px-2 border border-slate-400 text-slate-800">{gatePass.brandManufacturer || '—'}</td>
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">মডেল নম্বর</td>
                  <td className="py-1 px-2 border border-slate-400 text-slate-800">{gatePass.modelNo || '—'}</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">সিরিয়াল নম্বর</td>
                  <td className="py-1 px-2 border border-slate-400 font-mono text-slate-800">{gatePass.serialNo || '—'}</td>
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">অ্যাসেট / আইডি নম্বর</td>
                  <td className="py-1 px-2 border border-slate-400 text-slate-800">{gatePass.assetIdNo || '—'}</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">সঙ্গে প্রাপ্ত অ্যাক্সেসরিজ</td>
                  <td className="py-1 px-2 border border-slate-400 text-slate-800">{gatePass.accessoriesReceived || '—'}</td>
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">অবস্থা</td>
                  <td className="py-1 px-2 border border-slate-400 text-slate-800">
                    <div className="flex items-center gap-1">
                      <CheckboxItem checked={mCondition === 'সচল'} label="সচল" />
                      <CheckboxItem checked={mCondition === 'অচল'} label="অচল" />
                      <CheckboxItem checked={mCondition === 'ক্ষতিগ্রস্ত'} label="ক্ষতিগ্রস্ত" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2 border border-slate-400 font-semibold text-slate-700">জানানো সমস্যা</td>
                  <td colSpan={3} className="py-1 px-2 border border-slate-400 text-slate-800 leading-snug">
                    {gatePass.reportedProblem || gatePass.purpose || '—'}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-0.5 text-[11px] text-slate-800">
              <span className="font-semibold text-slate-700">মেশিনের অবস্থা / দৃশ্যমান ক্ষতির বিবরণ: </span>
              <span>{gatePass.physicalDamageCondition || 'বডিতে কোনো দৃশ্যমান বাহ্যিক ফাটল বা বড় আঘাতের চিহ্ন পাওয়া যায়নি।'}</span>
            </div>
          </div>

          {/* ৩. পরিবহন / হস্তান্তরের তথ্য */}
          <div className="mb-2">
            <h4 className="text-[11.5px] font-bold text-slate-900 mb-0.5">
              ৩. পরিবহন / হস্তান্তরের তথ্য
            </h4>
            <table className="w-full text-xs border-collapse border border-slate-400 bg-transparent">
              <thead>
                <tr className="bg-[#e0f2fe] text-slate-900 font-bold">
                  <th className="py-1 px-2.5 border border-slate-400 w-1/3">বিবরণ</th>
                  <th className="py-1 px-2.5 border border-slate-400 w-2/3">তথ্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
                <tr className="bg-transparent">
                  <td className="py-1 px-2.5 border border-slate-400 font-semibold text-slate-700">মেশিন সংগ্রহ / পৌঁছে দিয়েছেন</td>
                  <td className="py-1 px-2.5 border border-slate-400 font-bold text-slate-900">{gatePass.deliveredBy || gatePass.carrierName || '—'}</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2.5 border border-slate-400 font-semibold text-slate-700">পদবি / কর্মী আইডি (প্রযোজ্য হলে)</td>
                  <td className="py-1 px-2.5 border border-slate-400 text-slate-800">{gatePass.designationStaffId || '—'}</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2.5 border border-slate-400 font-semibold text-slate-700">গাড়ির নম্বর (প্রযোজ্য হলে)</td>
                  <td className="py-1 px-2.5 border border-slate-400 font-mono text-slate-800">{gatePass.vehicleNo || '—'}</td>
                </tr>
                <tr className="bg-transparent">
                  <td className="py-1 px-2.5 border border-slate-400 font-semibold text-slate-700">উদ্দেশ্য</td>
                  <td className="py-1 px-2.5 border border-slate-400 text-slate-800">
                    <div className="flex flex-wrap items-center">
                      <CheckboxItem checked={tPurpose === 'পরীক্ষা'} label="পরীক্ষা" />
                      <CheckboxItem checked={tPurpose === 'সার্ভিসিং'} label="সার্ভিসিং" />
                      <CheckboxItem checked={tPurpose === 'মেরামত'} label="মেরামত" />
                      <CheckboxItem checked={tPurpose === 'ফেরত'} label="ফেরত" />
                      <CheckboxItem checked={tPurpose.startsWith('অন্যান্য')} label="অন্যান্য" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ৪. ঘোষণা ও শর্তাবলি (Points 1 to 5) */}
          <div className="text-[10px] sm:text-[10.5px] text-slate-800 leading-tight">
            <h4 className="font-bold text-slate-900 mb-0.5 text-xs">
              ৪. ঘোষণা ও শর্তাবলি
            </h4>
            <ol className="list-decimal list-outside ml-4 space-y-0.5">
              <li>উপরোক্ত মেশিনটি এই গেটপাসে উল্লেখিত উদ্দেশ্যে পরীক্ষা-নিরীক্ষা, সার্ভিসিং, ত্রুটি নির্ণয়, মেরামত অথবা সংশ্লিষ্ট প্রতিষ্ঠানে ফেরত দেওয়ার জন্য গ্রহণ / হস্তান্তর করা হলো।</li>
              <li>মেশিনের সিরিয়াল নম্বর, বর্তমান অবস্থা এবং সঙ্গে প্রাপ্ত অ্যাক্সেসরিজ হস্তান্তরের সময় নথিভুক্ত করতে হবে।</li>
              <li>মেরামতের কাজ, প্রয়োজনীয় যন্ত্রাংশ ও খরচ সংশ্লিষ্ট প্রতিষ্ঠানের অনুমোদন এবং পারস্পরিক লিখিত সমঝোতা অনুযায়ী নির্ধারিত হবে।</li>
              <li>মেশিন গ্রহণের সময় পূর্ববর্তী ত্রুটি ও দৃশ্যমান ক্ষতির বিবরণ নথিভুক্ত করা হবে।</li>
              <li>মেশিন ফেরত দেওয়ার সময় উল্লেখিত মেশিন ও অ্যাক্সেসরিজ প্রতিষ্ঠানের অনুমোদিত প্রতিনিধির কাছে হস্তান্তর করা হবে; প্রযোজ্য ক্ষেত্রে সার্ভিস রিপোর্ট দেওয়া হবে।</li>
            </ol>
          </div>

          {/* Page 1 Footer */}
          <div className="pt-2 text-center text-[10px] font-semibold text-slate-600 border-t border-slate-300 mt-2 bg-transparent flex items-center justify-between">
            <span>ONE SERVICE &amp; REPAIR TECHNOLOGY | মেশিন গেটপাস</span>
            <span>পৃষ্ঠা ১ / ২</span>
          </div>
        </div>
      </div>


      {/* ===================== PAGE 2 ===================== */}
      <div className="sheet sheet-page-2 relative bg-white mx-auto p-5 sm:p-7 max-w-[820px] shadow-sm print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:min-h-0 print:h-auto overflow-hidden">
        
        {/* Centered Watermark for Page 2 */}
        {renderWatermark()}

        {/* Content of Page 2 */}
        <div className="relative z-10 bg-transparent">
          {/* Header Mini Reference on Page 2 */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-300 mb-3 text-xs">
            <span className="font-bold text-[#002060] uppercase">ONE SERVICE &amp; REPAIR TECHNOLOGY</span>
            <span className="font-mono text-slate-700">গেটপাস নং: <strong>{gatePass.passNo}</strong></span>
            <span className="text-slate-600">তারিখ: {gatePass.date}</span>
          </div>

          {/* Continuation of 4. ঘোষণা ও শর্তাবলি (Points 6 & 7) */}
          <div className="text-[11px] text-slate-800 leading-normal mb-6">
            <ol start={6} className="list-decimal list-outside ml-4 space-y-1.5">
              <li>মেশিনের মালিকানা সংশ্লিষ্ট প্রতিষ্ঠানের কাছেই থাকবে। এই নথি মেশিনের চলাচল ও হস্তান্তরের রেকর্ড হিসেবে ব্যবহৃত হবে।</li>
              <li>প্রতিষ্ঠানের নিজস্ব গেটপাস, প্রবেশ / বের হওয়ার অনুমতি বা অন্য কোনো অনুমোদন প্রয়োজন হলে তা আলাদাভাবে সংগ্রহ করতে হবে।</li>
            </ol>
          </div>

          {/* ৫. হস্তান্তর ও গ্রহণকারীর স্বাক্ষর (৩ কলাম টেবিল) */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              ৫. হস্তান্তর ও গ্রহণকারীর স্বাক্ষর
            </h4>
            <table className="w-full text-xs text-center border-collapse border border-slate-400 bg-transparent">
              <thead>
                <tr className="bg-[#e0f2fe] text-slate-900 font-bold">
                  <th className="py-2.5 px-3 border border-slate-400 w-1/3">হস্তান্তরকারী</th>
                  <th className="py-2.5 px-3 border border-slate-400 w-1/3">গ্রহণকারী</th>
                  <th className="py-2.5 px-3 border border-slate-400 w-1/3">অনুমোদনকারী</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-transparent">
                  <td className="py-14 px-4 border border-slate-400 align-bottom">
                    <div className="border-t border-dashed border-slate-400 pt-1 text-slate-700 font-medium">
                      স্বাক্ষর ও সিল:
                    </div>
                  </td>
                  <td className="py-14 px-4 border border-slate-400 align-bottom">
                    <div className="border-t border-dashed border-slate-400 pt-1 text-slate-700 font-medium">
                      স্বাক্ষর ও সিল:
                    </div>
                  </td>
                  <td className="py-14 px-4 border border-slate-400 align-bottom">
                    <div className="border-t border-dashed border-slate-400 pt-1 text-slate-700 font-medium">
                      স্বাক্ষর ও সিল:
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Page 2 Footer */}
          <div className="pt-3 text-center text-[10px] font-semibold text-slate-600 border-t border-slate-300 mt-6 bg-transparent flex items-center justify-between">
            <span>ONE SERVICE &amp; REPAIR TECHNOLOGY | মেশিন গেটপাস</span>
            <span>পৃষ্ঠা ২ / ২</span>
          </div>
        </div>
      </div>

      {/* Global Print Styling for Multi-Page with Zero Empty Page */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .gate-pass-print-root {
            width: 100% !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .sheet {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            height: auto !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .sheet-page-1 {
            page-break-after: always !important;
            break-after: page !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .sheet-page-2 {
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-before: always !important;
            break-before: page !important;
          }
          .watermark-container {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .watermark-container img {
            display: block !important;
            visibility: visible !important;
            opacity: 0.28 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

    </div>
  );
};
