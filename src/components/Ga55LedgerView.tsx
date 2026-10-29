import React, { useState } from 'react';
import { MonthlyPayRecord, EmployeeProfile } from '../types/taxTypes';
import { Printer, Edit3, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface Ga55Props {
  profile: EmployeeProfile;
  records: MonthlyPayRecord[];
  onUpdateRecord: (index: number, field: keyof MonthlyPayRecord, value: number) => void;
  onResetRecords: () => void;
}

export const Ga55LedgerView: React.FC<Ga55Props> = ({ profile, records, onUpdateRecord, onResetRecords }) => {
  const [isEditable, setIsEditable] = useState(false);

  // Compute totals
  const totalBasic = records.reduce((s, r) => s + (r.basicPay || 0), 0);
  const totalDA = records.reduce((s, r) => s + (r.daAmount || 0), 0);
  const totalHRA = records.reduce((s, r) => s + (r.hraAmount || 0), 0);
  const totalSplPay = records.reduce((s, r) => s + (r.splPay || 0), 0);
  const totalCCA = records.reduce((s, r) => s + (r.ccaAmount || 0), 0);
  const totalBonus = records.reduce((s, r) => s + (r.bonus || 0), 0);
  const totalOtherAllow = records.reduce((s, r) => s + (r.otherAllowances || 0), 0);
  const totalGross = records.reduce((s, r) => s + (r.grossSalary || 0), 0);
  
  const totalGPF = records.reduce((s, r) => s + (r.gpfAmount || 0), 0);
  const totalGPFLoan = records.reduce((s, r) => s + (r.gpfLoan || 0), 0);
  const totalSI = records.reduce((s, r) => s + (r.siAmount || 0), 0);
  const totalSILoan = records.reduce((s, r) => s + (r.siLoan || 0), 0);
  const totalRGHS = records.reduce((s, r) => s + (r.rghsAmount || 0), 0);
  const totalGIS = records.reduce((s, r) => s + (r.gisAmount || 0), 0);
  const totalLIC = records.reduce((s, r) => s + (r.licSalary || 0), 0);
  const totalIT = records.reduce((s, r) => s + (r.itTdsAmount || 0), 0);
  const totalOtherDed = records.reduce((s, r) => s + (r.otherDeductions || 0), 0);
  const totalDeductions = records.reduce((s, r) => s + (r.totalDeductions || 0), 0);
  const totalNet = records.reduce((s, r) => s + (r.netPayable || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Actions Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📑</span>
            <span>GA-55 वेतन बिल एवं व्यक्तिगत कटौती लेजर (100% राजस्थान PayManager मानक)</span>
          </h2>
          <p className="text-xs text-slate-500">
            A4 पेज पर सटीक फिटिंग • यदि पे-मैनेजर से अंतर हो तो "मैन्युअल एडिट" चालू करके कोई भी सेल बदलें
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditable(!isEditable)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isEditable 
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditable ? '✏️ मैन्युअल एडिट सक्रिय है' : '✏️ मैन्युअल एडिट चालू करें'}</span>
          </button>

          <button
            onClick={onResetRecords}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300"
            title="पे-मैट्रिक्स के अनुसार स्वतः रीसेट करें"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ऑटो रीसेट</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>A4 प्रिंट / PDF सेव</span>
          </button>
        </div>
      </div>

      {isEditable && (
        <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg text-xs text-amber-900 flex items-center gap-2 no-print">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>एडिट मोड सक्रिय:</strong> आप नीचे टेबल के किसी भी सेल पर क्लिक करके सीधे अपनी संख्या टाइप कर सकते हैं। सकल योग और शुद्ध वेतन अपने आप अपडेट होगा।
          </span>
        </div>
      )}

      {/* SINGLE A4 PRINTABLE CONTAINER */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-300 shadow-sm text-slate-900 a4-page-container">
        {/* Header Block */}
        <div className="text-center border-b-2 border-slate-800 pb-2 mb-2">
          <h1 className="text-base md:text-lg font-extrabold uppercase tracking-wide text-slate-900">
            {profile.schoolName || 'Office of the Govt. Higher Secondary School'}
          </h1>
          <h2 className="text-xs md:text-sm font-bold text-slate-700 uppercase">
            Salary and Deduction Detail for FY : {profile.financialYear} (GA-55)
          </h2>
        </div>

        {/* Employee Summary Info Bar */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[11px] bg-slate-50 p-2 rounded border border-slate-300 mb-2 leading-tight">
          <div>Name : <strong>{profile.empName || 'Nagji Yadav'}</strong></div>
          <div>Post : <strong>{profile.designation || 'TEACHER'} ({profile.payLevel})</strong></div>
          <div>PAN : <strong className="font-mono">{profile.panNumber || 'AHHPY4147Q'}</strong></div>
          <div>TAN : <strong className="font-mono">{profile.officeTan || 'JDHG20338D'}</strong></div>
          <div>Bank A/c : <strong className="font-mono">{profile.bankAccount || '15000100003153'}</strong></div>
          <div>Mobile : <strong className="font-mono">{profile.mobileNo || '9982151938'}</strong></div>
          <div>SI No : <strong className="font-mono">{profile.siNumber || 'RJ-SI-XXXXXX'}</strong></div>
          <div>GPF/PRAN : <strong className="font-mono">{profile.pranNumber || '1100XXXXXXXX'}</strong></div>
        </div>

        {/* Compact 1-Page A4 Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-400 text-[10.5px] leading-tight">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold text-center">
                <th className="border border-slate-400 p-1">Month</th>
                <th className="border border-slate-400 p-1">Basic</th>
                <th className="border border-slate-400 p-1">DA</th>
                <th className="border border-slate-400 p-1">HRA</th>
                <th className="border border-slate-400 p-1">Bonus</th>
                <th className="border border-slate-400 p-1">Arrear/PL</th>
                <th className="border border-slate-400 p-1 bg-emerald-100 font-bold">Gross Sal.</th>
                <th className="border border-slate-400 p-1">GPF</th>
                <th className="border border-slate-400 p-1">SI</th>
                <th className="border border-slate-400 p-1">RGHS</th>
                <th className="border border-slate-400 p-1">GIS</th>
                <th className="border border-slate-400 p-1">LIC</th>
                <th className="border border-slate-400 p-1">IT (TDS)</th>
                <th className="border border-slate-400 p-1">Other</th>
                <th className="border border-slate-400 p-1 bg-red-100 font-bold">Total Ded.</th>
                <th className="border border-slate-400 p-1 bg-blue-100 font-bold">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const isArrearRow = idx >= 12;
                return (
                  <tr 
                    key={r.monthKey || idx} 
                    className={`text-right hover:bg-slate-50 ${isArrearRow ? 'bg-amber-50/40 font-medium' : ''}`}
                  >
                    <td className={`border border-slate-400 px-1 py-0.5 text-left whitespace-pre-line leading-tight ${isArrearRow ? 'font-bold text-amber-950 text-[9.5px]' : 'font-medium'}`}>
                      {r.monthName}
                    </td>
                    
                    {/* Basic */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.basicPay}
                          onChange={(e) => onUpdateRecord(idx, 'basicPay', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.basicPay > 0 ? r.basicPay.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* DA */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.daAmount}
                          onChange={(e) => onUpdateRecord(idx, 'daAmount', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.daAmount > 0 ? r.daAmount.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* HRA */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.hraAmount}
                          onChange={(e) => onUpdateRecord(idx, 'hraAmount', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.hraAmount > 0 ? r.hraAmount.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* Bonus */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.bonus}
                          onChange={(e) => onUpdateRecord(idx, 'bonus', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.bonus > 0 ? r.bonus.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* Arrear/PL */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.daArrear + r.plSurrender}
                          onChange={(e) => onUpdateRecord(idx, 'plSurrender', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{(r.daArrear + r.plSurrender) > 0 ? (r.daArrear + r.plSurrender).toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* Gross */}
                    <td className="border border-slate-400 px-1 py-0.5 font-mono font-bold bg-emerald-50/50 text-emerald-950">
                      {r.grossSalary.toLocaleString('en-IN')}
                    </td>

                    {/* GPF */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.gpfAmount}
                          onChange={(e) => onUpdateRecord(idx, 'gpfAmount', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.gpfAmount > 0 ? r.gpfAmount.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* SI */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.siAmount}
                          onChange={(e) => onUpdateRecord(idx, 'siAmount', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.siAmount > 0 ? r.siAmount.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* RGHS */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.rghsAmount}
                          onChange={(e) => onUpdateRecord(idx, 'rghsAmount', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.rghsAmount > 0 ? r.rghsAmount.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* GIS */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.gisAmount}
                          onChange={(e) => onUpdateRecord(idx, 'gisAmount', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.gisAmount > 0 ? r.gisAmount.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* LIC */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.licSalary}
                          onChange={(e) => onUpdateRecord(idx, 'licSalary', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.licSalary > 0 ? r.licSalary.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* IT TDS */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.itTdsAmount}
                          onChange={(e) => onUpdateRecord(idx, 'itTdsAmount', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500 text-red-700"
                        />
                      ) : (
                        <span className="font-mono text-red-700">{r.itTdsAmount > 0 ? r.itTdsAmount.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* Other */}
                    <td className="border border-slate-400 p-0.5">
                      {isEditable ? (
                        <input
                          type="number"
                          value={r.otherDeductions}
                          onChange={(e) => onUpdateRecord(idx, 'otherDeductions', Number(e.target.value))}
                          className="w-full text-right bg-amber-50 px-1 py-0.5 font-mono text-[9.5px] border-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono">{r.otherDeductions > 0 ? r.otherDeductions.toLocaleString('en-IN') : 0}</span>
                      )}
                    </td>

                    {/* Total Ded */}
                    <td className="border border-slate-400 px-1 py-0.5 font-mono font-bold bg-red-50/50 text-red-950">
                      {r.totalDeductions.toLocaleString('en-IN')}
                    </td>

                    {/* Net */}
                    <td className="border border-slate-400 px-1 py-0.5 font-mono font-bold bg-blue-50/50 text-blue-950">
                      {r.netPayable.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-300 font-extrabold text-slate-900 text-right border-t-2 border-slate-800 text-[10.5px]">
                <td className="border border-slate-400 p-1 text-center font-bold">TOTAL:</td>
                <td className="border border-slate-400 p-1 font-mono">{totalBasic.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalDA.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalHRA.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalBonus.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalOtherAllow.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono bg-emerald-200 text-emerald-950 font-black">{totalGross.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalGPF.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalSI.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalRGHS.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalGIS.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalLIC.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono text-red-900">{totalIT.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono">{totalOtherDed.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono bg-red-200 text-red-950 font-black">{totalDeductions.toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 p-1 font-mono bg-blue-200 text-blue-950 font-black">{totalNet.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Verification Signatures Footer (Adjusted for 1 A4 Page) */}
        <div className="mt-4 pt-3 border-t border-slate-400 grid grid-cols-2 gap-8 text-[11px] text-slate-700">
          <div className="text-center">
            <p className="font-bold text-slate-900">Signature of Employee</p>
            <p className="text-[10px] text-slate-500">({profile.empName || 'Nagji Yadav'})</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-900">Signature of DDO (with Seal)</p>
            <p className="text-[10px] text-slate-500">({profile.ddoName || 'JEEVRAJ PARMAR'})</p>
          </div>
        </div>
      </div>
    </div>
  );
};
