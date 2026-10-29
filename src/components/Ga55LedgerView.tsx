import React from 'react';
import { MonthlyPayRecord, EmployeeProfile } from '../types/taxTypes';
import { Printer, Download, Building, User, Calendar, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface Ga55Props {
  profile: EmployeeProfile;
  records: MonthlyPayRecord[];
  onUpdateRecord?: (index: number, field: keyof MonthlyPayRecord, value: number) => void;
}

export const Ga55LedgerView: React.FC<Ga55Props> = ({ profile, records, onUpdateRecord }) => {
  // Compute totals
  const totalBasic = records.reduce((s, r) => s + r.basicPay, 0);
  const totalDA = records.reduce((s, r) => s + r.daAmount, 0);
  const totalHRA = records.reduce((s, r) => s + r.hraAmount, 0);
  const totalArrear = records.reduce((s, r) => s + r.daArrear, 0);
  const totalBonus = records.reduce((s, r) => s + r.bonus, 0);
  const totalPL = records.reduce((s, r) => s + r.plSurrender, 0);
  const totalGross = records.reduce((s, r) => s + r.grossSalary, 0);
  
  const totalGPF = records.reduce((s, r) => s + r.gpfAmount, 0);
  const totalSI = records.reduce((s, r) => s + r.siAmount, 0);
  const totalRGHS = records.reduce((s, r) => s + r.rghsAmount, 0);
  const totalGIS = records.reduce((s, r) => s + r.gisAmount, 0);
  const totalIT = records.reduce((s, r) => s + r.itTdsAmount, 0);
  const totalDeductions = records.reduce((s, r) => s + r.totalDeductions, 0);
  const totalNet = records.reduce((s, r) => s + r.netPayable, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            राजस्थान पे-मैनेजर (PayManager) वार्षिक GA-55 सैलरी लेजर
          </h2>
          <p className="text-xs text-slate-500">
            वित्तीय वर्ष: {profile.financialYear} (मार्च से फरवरी देय अप्रैल से मार्च) • 100% ट्रेजरी एवं PayManager मानक
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            GA-55 प्रिंट / PDF सेव करें
          </button>
        </div>
      </div>

      {/* Actual GA-55 Printable Statement */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-300 shadow-sm text-slate-900 printable-area">
        {/* Header Section */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
          <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide">
            {profile.schoolName || 'राजकीय उच्च माध्यमिक विद्यालय, राजस्थान'}
          </h1>
          <h2 className="text-sm font-bold text-slate-700 uppercase mt-1">
            वेतन बिल एवं व्यक्तिगत कटौती लेजर (GA-55 / GF&AR Rule 257)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            वित्तीय वर्ष (Financial Year): <strong>{profile.financialYear}</strong> | कर निर्धारण वर्ष (AY): <strong>{profile.assessmentYear}</strong>
          </p>
        </div>

        {/* Employee Details Box */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs md:text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
          <div>
            <span className="text-slate-500 block text-[11px]">कर्मचारी का नाम:</span>
            <strong className="text-slate-900">{profile.empName || 'श्री / श्रीमती कार्मिक'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">पद (Designation):</span>
            <strong className="text-slate-900">{profile.designation || 'अध्यापक / व्याख्याता'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">पे मैट्रिक्स लेवल:</span>
            <strong className="text-slate-900">{profile.payLevel} (वर्तमान बेसिक: ₹{profile.currentBasic.toLocaleString('en-IN')})</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">पैन (PAN Number):</span>
            <strong className="text-slate-900 font-mono">{profile.panNumber || 'ABCDE1234F'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">PRAN / GPF No:</span>
            <strong className="text-slate-900 font-mono">{profile.pranNumber || '1100XXXXXXXX'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">राज्य बीमा (SI Policy):</span>
            <strong className="text-slate-900 font-mono">{profile.siNumber || 'SI-XXXXXX'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">आहरण वितरण अधिकारी (DDO):</span>
            <strong className="text-slate-900">{profile.ddoName || 'प्रधानाचार्य / संस्था प्रधान'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">कार्यालय TAN:</span>
            <strong className="text-slate-900 font-mono">{profile.officeTan || 'JPRRXXXXX'}</strong>
          </div>
        </div>

        {/* GA-55 Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-400 text-[11.5px] leading-tight">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold text-center">
                <th className="border border-slate-400 p-1.5" rowSpan={2}>माह (Month)</th>
                <th className="border border-slate-400 p-1.5" colSpan={6}>सकल परिलब्धियां (Gross Allowances)</th>
                <th className="border border-slate-400 p-1.5 bg-emerald-100" rowSpan={2}>सकल योग (Gross Total)</th>
                <th className="border border-slate-400 p-1.5" colSpan={6}>नियमित कटौतियां (Monthly Deductions)</th>
                <th className="border border-slate-400 p-1.5 bg-red-100" rowSpan={2}>कुल कटौती (Total Ded.)</th>
                <th className="border border-slate-400 p-1.5 bg-blue-100" rowSpan={2}>शुद्ध वेतन (Net Pay)</th>
              </tr>
              <tr className="bg-slate-100 text-slate-800 font-semibold text-center text-[10.5px]">
                <th className="border border-slate-400 p-1">मूल वेतन (Basic)</th>
                <th className="border border-slate-400 p-1">DA (%)</th>
                <th className="border border-slate-400 p-1">महंगाई (DA)</th>
                <th className="border border-slate-400 p-1">HRA</th>
                <th className="border border-slate-400 p-1">एरियर (Arrear)</th>
                <th className="border border-slate-400 p-1">बोनस/PL</th>
                <th className="border border-slate-400 p-1">GPF</th>
                <th className="border border-slate-400 p-1">SI (बीमा)</th>
                <th className="border border-slate-400 p-1">RGHS</th>
                <th className="border border-slate-400 p-1">GIS</th>
                <th className="border border-slate-400 p-1">IT (TDS)</th>
                <th className="border border-slate-400 p-1">अन्य</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={r.monthKey} className={`text-right hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="border border-slate-400 p-1 text-left font-medium text-slate-800">{r.monthName}</td>
                  <td className="border border-slate-400 p-1 font-mono">{r.basicPay.toLocaleString('en-IN')}</td>
                  <td className="border border-slate-400 p-1 text-center font-mono text-[10px] text-slate-600">{r.daRate}%</td>
                  <td className="border border-slate-400 p-1 font-mono">{r.daAmount.toLocaleString('en-IN')}</td>
                  <td className="border border-slate-400 p-1 font-mono">{r.hraAmount.toLocaleString('en-IN')}</td>
                  <td className="border border-slate-400 p-1 font-mono text-slate-600">{r.daArrear > 0 ? r.daArrear.toLocaleString('en-IN') : '-'}</td>
                  <td className="border border-slate-400 p-1 font-mono text-slate-600">{(r.bonus + r.plSurrender) > 0 ? (r.bonus + r.plSurrender).toLocaleString('en-IN') : '-'}</td>
                  <td className="border border-slate-400 p-1 font-mono font-bold bg-emerald-50 text-emerald-900">{r.grossSalary.toLocaleString('en-IN')}</td>
                  
                  <td className="border border-slate-400 p-1 font-mono">{r.gpfAmount > 0 ? r.gpfAmount.toLocaleString('en-IN') : '-'}</td>
                  <td className="border border-slate-400 p-1 font-mono">{r.siAmount > 0 ? r.siAmount.toLocaleString('en-IN') : '-'}</td>
                  <td className="border border-slate-400 p-1 font-mono">{r.rghsAmount > 0 ? r.rghsAmount.toLocaleString('en-IN') : '-'}</td>
                  <td className="border border-slate-400 p-1 font-mono text-slate-600">{r.gisAmount > 0 ? r.gisAmount.toLocaleString('en-IN') : '-'}</td>
                  <td className="border border-slate-400 p-1 font-mono text-red-700">{r.itTdsAmount > 0 ? r.itTdsAmount.toLocaleString('en-IN') : '-'}</td>
                  <td className="border border-slate-400 p-1 font-mono text-slate-600">{r.otherDeductions > 0 ? r.otherDeductions.toLocaleString('en-IN') : '-'}</td>
                  <td className="border border-slate-400 p-1 font-mono font-bold bg-red-50 text-red-900">{r.totalDeductions.toLocaleString('en-IN')}</td>
                  <td className="border border-slate-400 p-1 font-mono font-bold bg-blue-50 text-blue-900">{r.netPayable.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-300 font-extrabold text-slate-900 text-right border-t-2 border-slate-800">
                <td className="border border-slate-400 p-1.5 text-center">वार्षिक कुल योग (Total):</td>
                <td className="border border-slate-400 p-1.5 font-mono">₹{totalBasic.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 text-center">-</td>
                <td className="border border-slate-400 p-1.5 font-mono">₹{totalDA.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono">₹{totalHRA.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono">₹{totalArrear.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono">₹{(totalBonus + totalPL).toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono bg-emerald-200 text-emerald-950 text-sm">₹{totalGross.toLocaleString('en-IN')}</td>
                
                <td className="border border-slate-400 p-1.5 font-mono">₹{totalGPF.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono">₹{totalSI.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono">₹{totalRGHS.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono">₹{totalGIS.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono text-red-900">₹{totalIT.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono">-</td>
                <td className="border border-slate-400 p-1.5 font-mono bg-red-200 text-red-950 text-sm">₹{totalDeductions.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1.5 font-mono bg-blue-200 text-blue-950 text-sm">₹{totalNet.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Verification Certificate Footer */}
        <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div>
            <p className="font-bold text-slate-900 mb-1">कर्मचारी का सत्यापन (Employee Declaration):</p>
            <p className="italic text-[11px] text-slate-500">प्रमाणित किया जाता है कि उपर्युक्त वेतन एवं कटौतियां मेरे PayManager बिलों एवं सेवा पुस्तिका के पूर्णतः अनुरूप हैं।</p>
            <div className="mt-10 border-t border-slate-400 pt-1 text-center font-bold">हस्ताक्षर कर्मचारी</div>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-1">बिल लिपिक / लेखाकार (Accountant):</p>
            <p className="italic text-[11px] text-slate-500">जांच उपरांत राशि एवं कटौती का मिलान सही पाया गया।</p>
            <div className="mt-10 border-t border-slate-400 pt-1 text-center font-bold">हस्ताक्षर लिपिक</div>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-1">आहरण एवं वितरण अधिकारी (DDO Verification):</p>
            <p className="italic text-[11px] text-slate-500">सत्यापित एवं प्रमाणित किया जाता है।</p>
            <div className="mt-10 border-t border-slate-400 pt-1 text-center font-bold">हस्ताक्षर मय मोहर DDO</div>
          </div>
        </div>
      </div>
    </div>
  );
};
