import React, { useState } from 'react';
import { EmployeeProfile, TaxComparisonResult, TaxDeductionsOld } from '../types/taxTypes';
import { Printer, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaxStatementProps {
  profile: EmployeeProfile;
  compResult: TaxComparisonResult;
  deductionsOld: TaxDeductionsOld;
  totalBasic12M: number;
  totalDA12M: number;
  totalHRA12M: number;
}

export const DdoTaxStatementView: React.FC<TaxStatementProps> = ({
  profile,
  compResult,
  deductionsOld,
  totalBasic12M,
  totalDA12M,
  totalHRA12M
}) => {
  const [activeRegimeView, setActiveRegimeView] = useState<'OLD' | 'NEW'>('OLD');

  const handlePrint = () => {
    window.print();
  };

  const isOld = activeRegimeView === 'OLD';

  return (
    <div className="space-y-4">
      {/* Top Banner Actions */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            आयकर आगणन प्रपत्र (Form 16 Part-B / Computation Sheet)
          </h2>
          <p className="text-xs text-slate-500">
            A4 पेज पर सटीक 1 पेज में सेट • राजस्थान शिक्षा विभाग एवं DDO मानक प्रारूप
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Regime Switcher */}
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-bold">
            <button
              onClick={() => setActiveRegimeView('OLD')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRegimeView === 'OLD'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              📜 पुरानी व्यवस्था (Old Regime)
            </button>
            <button
              onClick={() => setActiveRegimeView('NEW')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRegimeView === 'NEW'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              ✨ नई व्यवस्था (New Regime)
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>A4 प्रिंट / PDF</span>
          </button>
        </div>
      </div>

      {/* SINGLE A4 PRINTABLE CONTAINER (100% Page Fit) */}
      <div className="bg-white p-5 md:p-7 rounded-xl border border-slate-300 shadow-sm text-slate-900 a4-page-container text-[11px] leading-tight">
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-800 pb-2 mb-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-0.5">
            <span>OFFICE: {profile.schoolName || 'Govt. Senior Secondary School'}</span>
            <span className="font-bold text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {isOld ? 'Old Tax Regime' : 'New Tax Regime'}
            </span>
          </div>
          <h1 className="text-base font-extrabold uppercase text-slate-900">
            आयकर गणना प्रपत्र वर्ष 2024-25 (कर निर्धारण वर्ष 2025-26)
          </h1>
          <p className="text-[10px] text-slate-600">
            वेतनभोगी कर्मचारी कर निर्धारण विवरण (आयकर अधिनियम, 1961 के अंतर्गत)
          </p>
        </div>

        {/* Employee Summary Row */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded border border-slate-300 mb-2 text-[10.5px]">
          <div>1. नाम कर्मचारी: <strong>{profile.empName || 'Nagji Yadav'}</strong></div>
          <div>पद: <strong>{profile.designation || 'TEACHER'} ({profile.payLevel})</strong></div>
          <div>PAN: <strong className="font-mono">{profile.panNumber || 'AHHPY4147Q'}</strong></div>
        </div>

        {/* Computation Table */}
        <table className="w-full border-collapse border border-slate-400 mb-2 text-[10.5px]">
          <tbody>
            <tr>
              <td className="border border-slate-400 p-1 text-center font-bold w-7">2</td>
              <td className="border border-slate-400 p-1">वर्ष 2024-25 में प्राप्त कुल सकल वेतन (Gross Salary as per GA-55)</td>
              <td className="border border-slate-400 p-1 text-right font-mono font-bold w-28">{compResult.grossTotalIncome}</td>
            </tr>

            {/* HRA Exemption Sec 10(13A) */}
            <tr>
              <td className="border border-slate-400 p-1 text-center font-bold">3</td>
              <td className="border border-slate-400 p-1">
                गृह किराया धारा 10(13A) एवं धारा 10(14) अंतर्गत अन्य भत्ते जो करमुक्त हैं
              </td>
              <td className="border border-slate-400 p-1 text-right font-mono">
                {isOld ? compResult.calculatedHraExemption : 0}
              </td>
            </tr>

            <tr className="bg-slate-50">
              <td className="border border-slate-400 p-1 text-center font-bold">4</td>
              <td className="border border-slate-400 p-1 font-semibold">शेष वेतन आय (2 - 3)</td>
              <td className="border border-slate-400 p-1 text-right font-mono font-bold">
                {isOld ? (compResult.grossTotalIncome - compResult.calculatedHraExemption) : compResult.grossTotalIncome}
              </td>
            </tr>

            {/* Standard Deduction */}
            <tr>
              <td className="border border-slate-400 p-1 text-center font-bold">5</td>
              <td className="border border-slate-400 p-1">
                (i) स्टैंडर्ड डिडक्शन (Standard Deduction) धारा 16(ia) [{isOld ? '₹50,000' : '₹75,000'}]
                <br />
                (ii) मनोरंजन भत्ता / (iii) व्यवसाय कर धारा 16
              </td>
              <td className="border border-slate-400 p-1 text-right font-mono font-bold text-red-700">
                {isOld ? 50000 : 75000}
              </td>
            </tr>

            <tr className="bg-slate-50">
              <td className="border border-slate-400 p-1 text-center font-bold">6</td>
              <td className="border border-slate-400 p-1 font-semibold">शेष वेतन आय (4 - 5)</td>
              <td className="border border-slate-400 p-1 text-right font-mono font-bold">
                {isOld 
                  ? (compResult.grossTotalIncome - compResult.calculatedHraExemption - 50000)
                  : (compResult.grossTotalIncome - 75000)
                }
              </td>
            </tr>

            {/* Home Loan Interest 24(b) (Old only) */}
            {isOld && (
              <tr>
                <td className="border border-slate-400 p-1 text-center font-bold">7</td>
                <td className="border border-slate-400 p-1">
                  गृह संपत्ति हानि / गृह ऋण ब्याज धारा 24(b) [अधिकतम ₹2,00,000]
                </td>
                <td className="border border-slate-400 p-1 text-right font-mono text-red-700">
                  {compResult.old_sec24b_homeLoan > 0 ? `-${compResult.old_sec24b_homeLoan}` : '0'}
                </td>
              </tr>
            )}

            <tr className="bg-slate-100 font-bold">
              <td className="border border-slate-400 p-1 text-center">8</td>
              <td className="border border-slate-400 p-1">सकल करयोग्य आय (Gross Income before Chapter VI-A)</td>
              <td className="border border-slate-400 p-1 text-right font-mono font-bold">
                {isOld 
                  ? Math.max(0, compResult.grossTotalIncome - compResult.calculatedHraExemption - 50000 - compResult.old_sec24b_homeLoan)
                  : (compResult.grossTotalIncome - 75000)
                }
              </td>
            </tr>

            {/* Chapter VI-A Deductions (Old Regime) */}
            {isOld ? (
              <>
                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">9</td>
                  <td className="border border-slate-400 p-1">
                    <strong>धारा 80C, 80CCC, 80CCD(1) स्वीकृत कटौती (अधिकतम ₹1,50,000):</strong>
                    <div className="text-[10px] text-slate-600 pl-2">
                      (i) SI: ₹{compResult.old_sec80C_si} | (ii) GPF: ₹{compResult.old_sec80C_gpf} | (iii) LIC/PLI/ट्यूशन/होम लोन मूलधन: ₹{compResult.old_sec80C_others}
                    </div>
                  </td>
                  <td className="border border-slate-400 p-1 text-right font-mono font-bold text-red-700">
                    {compResult.old_sec80C_totalAllowed}
                  </td>
                </tr>

                {compResult.old_sec80CCD1B > 0 && (
                  <tr>
                    <td className="border border-slate-400 p-1 text-center font-bold">10</td>
                    <td className="border border-slate-400 p-1">धारा 80CCD(1B) नवीन पेंशन योजना (NPS) में अतिरिक्त अंशदान (अधिकतम ₹50,000)</td>
                    <td className="border border-slate-400 p-1 text-right font-mono text-red-700">{compResult.old_sec80CCD1B}</td>
                  </tr>
                )}

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">11</td>
                  <td className="border border-slate-400 p-1">
                    <strong>अन्य अध्याय VI-A कटौतियां:</strong>
                    <div className="text-[10px] text-slate-600 pl-2">
                      • 80D (RGHS व मेडिक्लेम): ₹{compResult.old_sec80D} | • 80U (दिव्यांग कार्मिक): ₹{compResult.old_sec80U_divyang} | • 80DD (दिव्यांग आश्रित): ₹{compResult.old_sec80DD_dependent} | • अन्य (80E, 80G, 80TTA): ₹{compResult.old_otherDeductions}
                    </div>
                  </td>
                  <td className="border border-slate-400 p-1 text-right font-mono text-red-700 font-bold">
                    {compResult.old_sec80D + compResult.old_sec80U_divyang + compResult.old_sec80DD_dependent + compResult.old_otherDeductions}
                  </td>
                </tr>

                <tr className="bg-emerald-50 font-bold">
                  <td className="border border-slate-400 p-1 text-center">12</td>
                  <td className="border border-slate-400 p-1">शुद्ध कर योग्य आय (Net Taxable Income) [10 के गुणक में]</td>
                  <td className="border border-slate-400 p-1 text-right font-mono font-black text-emerald-950 text-xs">
                    {compResult.old_taxableIncome}
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">13</td>
                  <td className="border border-slate-400 p-1">स्लैब अनुसार परिकलित आयकर (Tax before Rebate)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{compResult.old_taxBeforeRebate}</td>
                </tr>

                {compResult.old_rebate87A > 0 && (
                  <tr>
                    <td className="border border-slate-400 p-1 text-center font-bold">14</td>
                    <td className="border border-slate-400 p-1">कम करें: धारा 87A के तहत कर छूट (अधिकतम ₹12,500)</td>
                    <td className="border border-slate-400 p-1 text-right font-mono text-emerald-700 font-bold">-{compResult.old_rebate87A}</td>
                  </tr>
                )}

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">15</td>
                  <td className="border border-slate-400 p-1">स्वास्थ्य एवं शिक्षा उपकर (Health & Education Cess @ 4%)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{compResult.old_cess}</td>
                </tr>

                <tr className="bg-slate-200 font-black text-xs text-slate-900">
                  <td className="border border-slate-400 p-1.5 text-center">16</td>
                  <td className="border border-slate-400 p-1.5 uppercase">कुल देय आयकर (Net Total Tax Payable - Old Regime)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono text-emerald-950 text-sm">
                    ₹{compResult.old_totalTaxPayable}
                  </td>
                </tr>
              </>
            ) : (
              // NEW REGIME ROWS
              <>
                <tr className="bg-emerald-50 font-bold">
                  <td className="border border-slate-400 p-1 text-center">9</td>
                  <td className="border border-slate-400 p-1">शुद्ध कर योग्य आय (Net Taxable Income u/s 115BAC)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono font-black text-emerald-950 text-xs">
                    {compResult.new_taxableIncome}
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">10</td>
                  <td className="border border-slate-400 p-1">न्यू स्लैब अनुसार परिकलित आयकर (Tax before Rebate)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{compResult.new_taxBeforeRebate}</td>
                </tr>

                {compResult.new_rebate87A > 0 && (
                  <tr>
                    <td className="border border-slate-400 p-1 text-center font-bold">11</td>
                    <td className="border border-slate-400 p-1">कम करें: धारा 87A पूर्ण छूट (आय ₹7 लाख तक होने पर ₹25,000 तक)</td>
                    <td className="border border-slate-400 p-1 text-right font-mono text-emerald-700 font-bold">-{compResult.new_rebate87A}</td>
                  </tr>
                )}

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">12</td>
                  <td className="border border-slate-400 p-1">स्वास्थ्य एवं शिक्षा उपकर (Health & Education Cess @ 4%)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{compResult.new_cess}</td>
                </tr>

                <tr className="bg-slate-200 font-black text-xs text-slate-900">
                  <td className="border border-slate-400 p-1.5 text-center">13</td>
                  <td className="border border-slate-400 p-1.5 uppercase">कुल देय आयकर (Net Total Tax Payable - New Regime)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono text-emerald-950 text-sm">
                    ₹{compResult.new_totalTaxPayable}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* HRA & Required Receipts Info Box (Cleanly positioned on the same page) */}
        {isOld && (
          <div className="bg-amber-50/70 border border-amber-300 p-2 rounded mb-2 text-[10px] leading-tight text-amber-950">
            <div className="font-bold flex items-center gap-1 text-amber-900 mb-0.5">
              <span>🏠</span>
              <span>मकान किराया छूट (HRA Exemption) एवं रसीद आवश्यकता (Section 10(13A)):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                • 12 माह में प्राप्त HRA: <strong>₹{totalHRA12M}</strong><br />
                • बेसिक + DA का 10%: <strong>₹{Math.round(0.10 * (totalBasic12M + totalDA12M))}</strong>
              </div>
              <div>
                • छूट योग्य HRA राशि: <strong className="text-emerald-800">₹{compResult.calculatedHraExemption}</strong><br />
                • <strong>आवश्यक किराया रसीद:</strong> पूर्ण छूट हेतु वार्षिक <strong>₹{compResult.minRentReceiptRequired}</strong> (अर्थात ₹{Math.round(compResult.minRentReceiptRequired / 12)} प्रतिमाह) की रसीद आवश्यक है।
              </div>
            </div>
          </div>
        )}

        {/* Signatures and Verification Block (Fixed at bottom for 1-Page A4) */}
        <div className="mt-3 pt-2 border-t border-slate-400 grid grid-cols-2 gap-8 text-[11px] text-slate-800">
          <div className="text-center">
            <p className="font-bold">Signature of Employee</p>
            <p className="text-[10px] text-slate-500">({profile.empName || 'Nagji Yadav'})</p>
          </div>
          <div className="text-center">
            <p className="font-bold">Signature of DDO (with Seal)</p>
            <p className="text-[10px] text-slate-500">({profile.ddoName || 'JEEVRAJ PARMAR'})</p>
          </div>
        </div>
      </div>
    </div>
  );
};
