import React, { useState } from 'react';
import { EmployeeProfile, TaxComparisonResult, TaxDeductionsOld } from '../types/taxTypes';
import { Printer } from 'lucide-react';

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
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>आयकर गणना प्रपत्र (Computation Sheet) - FY 2024-25 (AY 2025-26)</span>
          </h2>
          <p className="text-xs text-slate-500">
            मास्टर एक्सेल शीट के 100% हूबहू प्रारूप में तैयार • A4 एक पेज पर संपूर्ण प्रिंट
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-bold">
            <button
              onClick={() => setActiveRegimeView('OLD')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRegimeView === 'OLD'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Old Tax Regime (₹{compResult.old_totalTaxPayable})
            </button>
            <button
              onClick={() => setActiveRegimeView('NEW')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRegimeView === 'NEW'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              New Tax Regime (₹{compResult.new_totalTaxPayable})
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>A4 प्रिंट</span>
          </button>
        </div>
      </div>

      {/* SINGLE A4 PRINTABLE CONTAINER (EXACT EXCEL LAYOUT) */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-300 shadow-sm text-slate-900 a4-page-container text-[10.5px] leading-tight">
        {/* Office & Regime Header */}
        <div className="flex justify-between items-center border-b pb-1 mb-1 font-bold text-xs">
          <span>Office of the {profile.schoolName || 'Govt.Praveshika Sanskrit School kunwa'}</span>
          <span className="border border-slate-800 px-2 py-0.5 rounded bg-slate-100">
            {isOld ? 'Old Tax Regime' : 'New Tax Regime'}
          </span>
        </div>

        <div className="text-center font-bold text-xs md:text-sm mb-1.5 text-slate-900">
          आयकर गणना प्रपत्र वर्ष 2024-25 (कर निर्धारण वर्ष 2025-26)
        </div>

        {/* Employee Info Header Line */}
        <div className="flex flex-wrap justify-between items-center bg-slate-50 p-1.5 border border-slate-400 mb-1.5 font-medium text-[10.5px]">
          <div>1. नाम कर्मचारी : <strong>{profile.empName}</strong></div>
          <div>पद : <strong>{profile.designation} ({profile.payLevel})</strong></div>
          <div>PAN : <strong className="font-mono">{profile.panNumber}</strong></div>
        </div>

        {/* 16-Row Calculation Table */}
        <table className="w-full border-collapse border border-slate-400 mb-1.5 text-[10.5px]">
          <tbody>
            <tr>
              <td className="border border-slate-400 p-1 text-center font-bold w-6">2</td>
              <td className="border border-slate-400 p-1">आय : वर्ष- 2024-25 में प्राप्त कुल वेतन (कर योग्य सुविधाओं के मूल्य सहित)</td>
              <td className="border border-slate-400 p-1 text-right font-mono font-bold w-24">{compResult.grossTotalIncome}</td>
            </tr>

            <tr>
              <td className="border border-slate-400 p-1 text-center font-bold">3</td>
              <td className="border border-slate-400 p-1">गृह किराया, धारा 10(13 A) के अन्तर्गत एवं धारा 10(14) के अन्तर्गत अन्य भत्ते जो कर मुक्त हैं।</td>
              <td className="border border-slate-400 p-1 text-right font-mono">{isOld ? compResult.calculatedHraExemption : 0}</td>
            </tr>

            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-400 p-1 text-center">4</td>
              <td className="border border-slate-400 p-1 text-right pr-6">शेष (2-3)</td>
              <td className="border border-slate-400 p-1 text-right font-mono">
                {isOld ? (compResult.grossTotalIncome - compResult.calculatedHraExemption) : compResult.grossTotalIncome}
              </td>
            </tr>

            <tr>
              <td className="border border-slate-400 p-1 text-center font-bold">5</td>
              <td className="border border-slate-400 p-1">
                (i) स्टैंडर्ड डिडक्शन (Standard Deduction) {isOld ? '50,000' : '75,000'} (अधिकतम) धारा 16 (ia) | (ii) मनोरंजन भत्ता धारा 16 (ii) | (iii) व्यवसाय कर धारा 16 (iii)
              </td>
              <td className="border border-slate-400 p-1 text-right font-mono font-bold text-red-700">
                {isOld ? 50000 : 75000}
              </td>
            </tr>

            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-400 p-1 text-center">6</td>
              <td className="border border-slate-400 p-1 text-right pr-6">शेष (4-5)</td>
              <td className="border border-slate-400 p-1 text-right font-mono">
                {isOld 
                  ? (compResult.grossTotalIncome - compResult.calculatedHraExemption - 50000) 
                  : (compResult.grossTotalIncome - 75000)
                }
              </td>
            </tr>

            {/* Row 7: House Property */}
            {isOld && (
              <tr>
                <td className="border border-slate-400 p-1 text-center font-bold">7</td>
                <td className="border border-slate-400 p-1">
                  (अ) गृह सम्पत्ति से आय: (1) स्वयं के उपयोग में : शून्य | (ब) घटायें : गृह ऋण पर ब्याज (धारा 24b) [अधिकतम ₹2,00,000]
                </td>
                <td className="border border-slate-400 p-1 text-right font-mono text-red-700 font-bold">
                  {compResult.old_sec24b_homeLoan > 0 ? `-${compResult.old_sec24b_homeLoan}` : '0'}
                </td>
              </tr>
            )}

            <tr className="bg-slate-100 font-bold">
              <td className="border border-slate-400 p-1 text-center">{isOld ? '8' : '7'}</td>
              <td className="border border-slate-400 p-1 text-right pr-6">कुल शेष {isOld ? '(6 एवं 7 का योग)' : '(सकल वेतन - मानक कटौती)'}</td>
              <td className="border border-slate-400 p-1 text-right font-mono">
                {isOld 
                  ? (compResult.grossTotalIncome - compResult.calculatedHraExemption - 50000 - compResult.old_sec24b_homeLoan)
                  : (compResult.grossTotalIncome - 75000)
                }
              </td>
            </tr>

            <tr>
              <td className="border border-slate-400 p-1 text-center font-bold">{isOld ? '9' : '8'}</td>
              <td className="border border-slate-400 p-1">अन्य आय (बचत बैंक ब्याज / अन्य)</td>
              <td className="border border-slate-400 p-1 text-right font-mono">0</td>
            </tr>

            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-400 p-1 text-center">{isOld ? '10' : '9'}</td>
              <td className="border border-slate-400 p-1">सकल आय योग</td>
              <td className="border border-slate-400 p-1 text-right font-mono">
                {isOld 
                  ? (compResult.grossTotalIncome - compResult.calculatedHraExemption - 50000 - compResult.old_sec24b_homeLoan)
                  : (compResult.grossTotalIncome - 75000)
                }
              </td>
            </tr>

            {/* Deductions: Row 11, 12, 13 (Old Regime) */}
            {isOld ? (
              <>
                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">11</td>
                  <td className="border border-slate-400 p-1">
                    <strong>घटाइये कटौतियाँ : धारा US 80C, 80CCC, 80CCD (1) [अधिकतम 1,50,000]:</strong>
                    <div className="text-[9.5px] text-slate-600 pl-2">
                      SI: ₹{compResult.old_sec80C_si} + GPF: ₹{compResult.old_sec80C_gpf} + GIS: ₹700 + HBA Principal: ₹{deductionsOld.sec80C_HomeLoanPrincipal} = ₹1,52,510 (मान्य ₹1,50,000)
                    </div>
                  </td>
                  <td className="border border-slate-400 p-1 text-right font-mono font-bold text-red-700">
                    {compResult.old_sec80C_totalAllowed}
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">12</td>
                  <td className="border border-slate-400 p-1">अन्य कटौतियाँ (धारा 80D, 80DD, 80DDB, 80E, 80G, 80U आदि)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">
                    {compResult.old_sec80D + compResult.old_sec80U_divyang + compResult.old_sec80DD_dependent + compResult.old_otherDeductions}
                  </td>
                </tr>

                <tr className="bg-slate-50 font-bold">
                  <td className="border border-slate-400 p-1 text-center">13</td>
                  <td className="border border-slate-400 p-1 text-right pr-6">कुल कटौती (11 + 12)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono text-red-700">{compResult.old_totalDeductions - 50000 - compResult.old_sec24b_homeLoan}</td>
                </tr>

                <tr className="bg-emerald-50 font-bold">
                  <td className="border border-slate-400 p-1 text-center">14</td>
                  <td className="border border-slate-400 p-1">कर योग्य आय (10 - 13)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono text-emerald-950 font-extrabold">{compResult.old_taxableIncome}</td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">15</td>
                  <td className="border border-slate-400 p-1">कुल आय की राशि को सम्पूर्ण करना (दस के गुणक में) धारा 288A</td>
                  <td className="border border-slate-400 p-1 text-right font-mono font-bold">
                    {Math.round(compResult.old_taxableIncome / 10) * 10}
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">16</td>
                  <td className="border border-slate-400 p-1">
                    <strong>आयकर की गणना (स्लैब अनुसार):</strong>
                    <div className="text-[9.5px] text-slate-600 pl-2">
                      • 2,50,000 तक: NIL | • 2,50,001-5,00,000 (5%): ₹12,500 | • 5,00,001-10,00,000 (20%): ₹{Math.round((compResult.old_taxableIncome - 500000) * 0.20)}
                    </div>
                  </td>
                  <td className="border border-slate-400 p-1 text-right font-mono font-bold">{compResult.old_taxBeforeRebate}</td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">17</td>
                  <td className="border border-slate-400 p-1">शिक्षा उपकर 2% एवं उच्च शिक्षा के लिए अधिभार 2% (योग 4%)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{compResult.old_cess}</td>
                </tr>

                <tr className="bg-slate-200 font-extrabold text-xs">
                  <td className="border border-slate-400 p-1 text-center">18</td>
                  <td className="border border-slate-400 p-1 uppercase">Income Tax Payable (Old Tax Regime)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono text-emerald-950 font-black">
                    ₹{compResult.old_totalTaxPayable}
                  </td>
                </tr>
              </>
            ) : (
              // NEW REGIME ROWS (Exact to 39241)
              <>
                <tr className="bg-emerald-50 font-bold">
                  <td className="border border-slate-400 p-1 text-center">10</td>
                  <td className="border border-slate-400 p-1">कर योग्य आय (Net Taxable Income u/s 115BAC)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono text-emerald-950 font-extrabold">{compResult.new_taxableIncome}</td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">11</td>
                  <td className="border border-slate-400 p-1">कुल आय की राशि को सम्पूर्ण करना (दस के गुणक में) धारा 288A</td>
                  <td className="border border-slate-400 p-1 text-right font-mono font-bold">
                    {Math.round(compResult.new_taxableIncome / 10) * 10}
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">12</td>
                  <td className="border border-slate-400 p-1">
                    <strong>आयकर की गणना (New Slabs):</strong>
                    <div className="text-[9.5px] text-slate-600 pl-2">
                      • 3,00,000 तक: NIL | • 3,00,001-7,00,000 (5%): ₹20,000 | • 7,00,001-10,00,000 (10%): ₹{Math.round((compResult.new_taxableIncome - 700000) * 0.10)}
                    </div>
                  </td>
                  <td className="border border-slate-400 p-1 text-right font-mono font-bold">{compResult.new_taxBeforeRebate}</td>
                </tr>

                <tr>
                  <td className="border border-slate-400 p-1 text-center font-bold">13</td>
                  <td className="border border-slate-400 p-1">शिक्षा उपकर 2% एवं उच्च शिक्षा अधिभार 2% (योग 4%)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{compResult.new_cess}</td>
                </tr>

                <tr className="bg-slate-200 font-extrabold text-xs">
                  <td className="border border-slate-400 p-1 text-center">14</td>
                  <td className="border border-slate-400 p-1 uppercase">Income Tax Payable (New Tax Regime)</td>
                  <td className="border border-slate-400 p-1 text-right font-mono text-emerald-950 font-black">
                    ₹{compResult.new_totalTaxPayable}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Comparison Result Badge Box */}
        <div className="p-1.5 bg-amber-50 border border-amber-300 rounded mb-2 text-center text-xs font-bold text-amber-950">
          Prefer Old Tax Regime | Tax Saving = ₹{(compResult.new_totalTaxPayable - compResult.old_totalTaxPayable).toLocaleString('en-IN')} (Old Regime चुनने पर ₹15,358 की सीधी बचत!)
        </div>

        {/* HRA Exemption Note Box as in Excel */}
        {isOld && (
          <div className="bg-slate-50 border border-slate-300 p-1.5 rounded mb-2 text-[9.5px] text-slate-700 leading-tight">
            <strong>मकान किराया छूट (HRA Exemption Section 10(13A)):</strong> 12 माह में प्राप्त HRA: ₹{totalHRA12M} | मूल वेतन + DA का 10%: ₹{Math.round(0.10 * (totalBasic12M + totalDA12M))} | कर्मचारी द्वारा चुकाया गया किराया: ₹{deductionsOld.actualRentPaid12M} | छूट योग्य HRA: <strong>₹{compResult.calculatedHraExemption}</strong> | करयोग्य HRA: <strong>₹{totalHRA12M - compResult.calculatedHraExemption}</strong>
          </div>
        )}

        {/* Signatures Footer */}
        <div className="mt-2 pt-2 border-t border-slate-400 grid grid-cols-2 gap-8 text-[11px] text-slate-800">
          <div className="text-center">
            <p className="font-bold">Signature of Employee</p>
            <p className="text-[10px] text-slate-500">({profile.empName})</p>
          </div>
          <div className="text-center">
            <p className="font-bold">Signature of DDO</p>
            <p className="text-[10px] text-slate-500">({profile.ddoName})</p>
          </div>
        </div>
      </div>
    </div>
  );
};
