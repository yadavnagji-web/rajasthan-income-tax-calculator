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
  const fy = profile.financialYear || '2024-25';
  const ay = profile.assessmentYear || '2025-26';

  // Calculations for Old Regime Table
  const hraExempt = isOld ? compResult.calculatedHraExemption : 0;
  const rem4 = compResult.grossTotalIncome - hraExempt;
  const stdDed = isOld ? 50000 : (profile.financialYear === '2023-24' ? 50000 : 75000);
  const rem6 = Math.max(0, rem4 - stdDed);
  const homeLoanInt = isOld ? compResult.old_sec24b_homeLoan : 0;
  const rem8 = isOld ? (rem6 - homeLoanInt) : rem6;
  const otherInc = (deductionsOld.bankSavingInterest || 0) + (deductionsOld.fdOtherInterest || 0) + (deductionsOld.otherIncomeSources || 0);
  const gross10 = rem8 + otherInc;

  // 80C sub-items
  const siVal = compResult.old_sec80C_si;
  const gpfVal = compResult.old_sec80C_gpf;
  const gisVal = 700;
  const hbaVal = deductionsOld.sec80C_HomeLoanPrincipal || 0;
  const licVal = deductionsOld.sec80C_LicPli || 0;
  const ppfVal = deductionsOld.sec80C_PpfSsy || 0;
  const tuitionVal = deductionsOld.sec80C_TuitionFee || 0;
  const nscVal = deductionsOld.sec80C_NscElssFd || 0;
  const other80cVal = deductionsOld.sec80C_OtherItems || 0;

  const raw80cSum = siVal + gpfVal + gisVal + hbaVal + licVal + ppfVal + tuitionVal + nscVal + other80cVal;
  const allowed80c = isOld ? Math.min(150000, raw80cSum) : 0;
  const sec80ccd1b = isOld ? compResult.old_sec80CCD1B : 0;
  const total11 = allowed80c + sec80ccd1b;

  // Point 12 (Other deductions)
  const d80D = isOld ? compResult.old_sec80D : 0;
  const d80DD = isOld ? compResult.old_sec80DD_dependent : 0;
  const d80U = isOld ? compResult.old_sec80U_divyang : 0;
  const d80E = isOld ? (deductionsOld.sec80E_EduLoanInterest || 0) : 0;
  const d80G = isOld ? (deductionsOld.sec80G_Donations || 0) : 0;
  const d80TTA = isOld ? (profile.isSeniorCitizen ? Math.min(50000, otherInc) : Math.min(10000, deductionsOld.bankSavingInterest || 0)) : 0;
  const total12 = d80D + d80DD + d80U + d80E + d80G + d80TTA;

  const totalDed13 = isOld ? (total11 + total12) : 0;
  const taxableInc14 = isOld ? Math.max(0, gross10 - totalDed13) : compResult.new_taxableIncome;
  const roundInc15 = Math.round(taxableInc14 / 10) * 10;

  // Tax calculation values
  const taxBeforeRebate = isOld ? compResult.old_taxBeforeRebate : compResult.new_taxBeforeRebate;
  const rebate87A = isOld ? compResult.old_rebate87A : compResult.new_rebate87A;
  const taxAfterRebate = isOld ? compResult.old_taxAfterRebate : compResult.new_taxAfterRebate;
  const cess = isOld ? compResult.old_cess : compResult.new_cess;
  const totalTaxPayable = isOld ? compResult.old_totalTaxPayable : compResult.new_totalTaxPayable;

  return (
    <div className="space-y-4">
      {/* Top Banner Actions (Hidden in Print) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>आयकर गणना प्रपत्र (Computation Sheet) - FY {fy} (AY {ay})</span>
          </h2>
          <p className="text-xs text-slate-500">
            मास्टर एक्सेल शीट के पूर्णतः 100% हुबहू 20 बिंदुओं के प्रारूप में • शुद्ध A4 1-Page Portrait प्रिंट लेआउट
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
              Old Tax Regime (₹{compResult.old_totalTaxPayable.toLocaleString('en-IN')})
            </button>
            <button
              onClick={() => setActiveRegimeView('NEW')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRegimeView === 'NEW'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              New Tax Regime (₹{compResult.new_totalTaxPayable.toLocaleString('en-IN')})
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>A4 प्रिंट निकालें</span>
          </button>
        </div>
      </div>

      {/* SINGLE A4 PRINTABLE CONTAINER (MATCHING MASTER EXCEL SHEET EXACTLY) */}
      <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-300 shadow-sm text-slate-900 a4-page-container text-[9.5px] leading-tight font-sans">
        {/* Header Block */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-1">
          <span className="font-extrabold text-[11px] text-slate-900">
            Office of the {profile.schoolName || 'Govt.Praveshika Sanskrit School kunwa'}
          </span>
          <span className="border-2 border-slate-900 font-extrabold px-2.5 py-0.5 rounded text-[10px] bg-slate-100 uppercase">
            {isOld ? 'Old Tax Regime' : 'New Tax Regime'}
          </span>
        </div>

        <div className="text-center font-black text-xs md:text-sm mb-1 text-slate-900 underline decoration-slate-400">
          आयकर गणना प्रपत्र वर्ष {fy} (कर निर्धारण वर्ष {ay})
        </div>

        {/* Row 1: Employee Identity Header */}
        <table className="w-full border-collapse border border-slate-700 mb-1 text-[9.5px]">
          <tbody>
            <tr className="bg-slate-100 font-bold">
              <td className="border border-slate-700 px-1.5 py-0.5 w-6 text-center">1</td>
              <td className="border border-slate-700 px-1.5 py-0.5">
                नाम कर्मचारी : <strong className="text-slate-950 font-black">{profile.empName}</strong>
              </td>
              <td className="border border-slate-700 px-1.5 py-0.5">
                पद : <strong>{profile.designation} ({profile.payLevel})</strong>
              </td>
              <td className="border border-slate-700 px-1.5 py-0.5">
                HRA Rate : <strong>{profile.currentHraRate >= 16 ? '18%' : '10%'}</strong>
              </td>
              <td className="border border-slate-700 px-1.5 py-0.5 text-right">
                PAN : <strong className="font-mono">{profile.panNumber}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 20-Point Calculation Table */}
        <table className="w-full border-collapse border border-slate-700 mb-1 text-[9px] leading-tight">
          <tbody>
            {/* Point 2: Gross Income */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold w-6">2</td>
              <td className="border border-slate-700 px-1 py-0.5">
                आय : वर्ष-{fy} में प्राप्त कुल वेतन (कर योग्य सुविधाओं के मूल्य सहित)
              </td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-bold w-24">
                {compResult.grossTotalIncome.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 3: HRA Exemption */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">3</td>
              <td className="border border-slate-700 px-1 py-0.5">
                गृह किराया, धारा 10 (13A) के अन्तर्गत, एवं धारा 10 (14) के अन्तर्गत अन्य भत्ते जो कर मुक्त हैं।
              </td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono">
                {hraExempt.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 4: Remainder */}
            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-700 px-1 py-0.5 text-center">4</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right pr-4">शेष (2 - 3)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono">
                {rem4.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 5: Standard Deduction & Sec 16 */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">5</td>
              <td className="border border-slate-700 px-1 py-0.5">
                (i) स्टैंडर्ड डिडक्शन (Standard Deduction) {stdDed.toLocaleString('en-IN')} (अधिकतम) धारा 16 (ia) &nbsp;|&nbsp;
                (ii) मनोरंजन भत्ता धारा 16 (ii) &nbsp;|&nbsp;
                (iii) व्यवसाय कर धारा 16 (iii)
              </td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-bold text-red-700">
                {stdDed.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 6: Remainder (4 - 5) */}
            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-700 px-1 py-0.5 text-center">6</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right pr-4">शेष (4 - 5)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono">
                {rem6.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 7: Income from House Property / Home Loan Interest 24(b) */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">7</td>
              <td className="border border-slate-700 px-1 py-0.5">
                (अ) गृह सम्पत्ति से आय: (1) स्वयं के उपयोग में : शून्य | (2) प्राप्त किराया: 0 <br />
                (ब) घटायें: गृह ऋण पर ब्याज (धारा 24b) [अधिकतम ₹2,00,000] &nbsp;|&nbsp; योग 7(ब): ₹{homeLoanInt.toLocaleString('en-IN')}
              </td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono text-red-700 font-bold">
                {homeLoanInt > 0 ? `-${homeLoanInt.toLocaleString('en-IN')}` : '0'}
              </td>
            </tr>

            {/* Point 8: Balance (6 + 7) */}
            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-700 px-1 py-0.5 text-center">8</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right pr-4">कुल शेष (+/-) (6 एवं 7)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono">
                {rem8.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 9: Other Income */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">9</td>
              <td className="border border-slate-700 px-1 py-0.5">अन्य आय (बचत बैंक ब्याज / अन्य स्रोत)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono">{otherInc.toLocaleString('en-IN')}</td>
            </tr>

            {/* Point 10: Gross Total Income (8 + 9) */}
            <tr className="bg-slate-100 font-bold">
              <td className="border border-slate-700 px-1 py-0.5 text-center">10</td>
              <td className="border border-slate-700 px-1 py-0.5">सकल आय योग (8 + 9)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-black">
                {gross10.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 11: Section 80C, 80CCC, 80CCD */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">11</td>
              <td className="border border-slate-700 px-1 py-0.5">
                <div className="font-bold text-slate-900">
                  घटाइये कटौतियाँ : धारा US 80C, 80CCC, 80CCD(1) - (A) अधिकतम सीमा 1,50,000/- (धारा 80CCE)
                </div>
                {isOld ? (
                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[8px] text-slate-700 mt-0.5 bg-slate-50 p-1 border border-slate-300 rounded">
                    <div>(i) राज्य बीमा (SI): <strong>₹{siVal.toLocaleString('en-IN')}</strong></div>
                    <div>(vi) GPF / GPF 2004: <strong>₹{gpfVal.toLocaleString('en-IN')}</strong></div>
                    <div>(vii) सामूहिक बीमा (GIS): <strong>₹{gisVal}</strong></div>
                    <div>(ix) HBA मूलधन: <strong>₹{hbaVal.toLocaleString('en-IN')}</strong></div>
                    <div>(ii) जीवन बीमा (LIC): <strong>₹{licVal.toLocaleString('en-IN')}</strong></div>
                    <div>(iv) PPF/SSY: <strong>₹{ppfVal.toLocaleString('en-IN')}</strong></div>
                    <div>(xiv) ट्यूशन फीस: <strong>₹{tuitionVal.toLocaleString('en-IN')}</strong></div>
                    <div>(iii) NSC/ELSS: <strong>₹{nscVal.toLocaleString('en-IN')}</strong></div>
                    <div>(xix) कुल 80C योग: <strong>₹{raw80cSum.toLocaleString('en-IN')}</strong></div>
                  </div>
                ) : (
                  <div className="text-[8.5px] text-slate-500 italic">नई कर व्यवस्था में धारा 80C की कटौती अनुमन्य नहीं है।</div>
                )}
                {isOld && (
                  <div className="text-[8.5px] text-slate-700 mt-0.5">
                    (B) 80CCD(2) नियोक्ता अंशदान: ₹0 &nbsp;|&nbsp; (C) 80CCD(1B) NPS अतिरिक्त अंशदान: <strong>₹{sec80ccd1b.toLocaleString('en-IN')}</strong>
                  </div>
                )}
              </td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-bold text-red-700">
                {total11.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 12: Other Deductions (80D, 80DD, 80U, 80E, 80G, 80TTA) */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">12</td>
              <td className="border border-slate-700 px-1 py-0.5">
                <div className="font-bold">अन्य कटौतियाँ (Chapter VI-A):</div>
                {isOld ? (
                  <div className="text-[8.5px] text-slate-700">
                    1. 80D मेडिक्लेम/RGHS: ₹{d80D.toLocaleString('en-IN')} &nbsp;|&nbsp;
                    2. 80DD आश्रित दिव्यांग: ₹{d80DD.toLocaleString('en-IN')} &nbsp;|&nbsp;
                    6. 80U स्वयं दिव्यांग: ₹{d80U.toLocaleString('en-IN')} &nbsp;|&nbsp;
                    4. 80E शिक्षा ऋण: ₹{d80E.toLocaleString('en-IN')} &nbsp;|&nbsp;
                    5. 80G दान: ₹{d80G.toLocaleString('en-IN')} &nbsp;|&nbsp;
                    7. 80TTA ब्याज: ₹{d80TTA.toLocaleString('en-IN')}
                  </div>
                ) : (
                  <div className="text-[8.5px] text-slate-500 italic">लागू नहीं (Nil in New Regime)</div>
                )}
              </td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-bold text-red-700">
                {total12.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 13: Total Deductions (11 + 12) */}
            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-700 px-1 py-0.5 text-center">13</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right pr-4">कुल कटौती (11 + 12)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-bold text-red-700">
                {totalDed13.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 14: Taxable Income (10 - 13) */}
            <tr className="bg-amber-50 font-bold">
              <td className="border border-slate-700 px-1 py-0.5 text-center">14</td>
              <td className="border border-slate-700 px-1 py-0.5">कर योग्य आय (10 - 13)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-black text-amber-950">
                {taxableInc14.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 15: Round off Section 288A */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">15</td>
              <td className="border border-slate-700 px-1 py-0.5">कुल आय की राशि को सम्पूर्ण करना (दस के गुणक में) धारा 288A</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-bold">
                {roundInc15.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 16: Tax Calculation on Slabs */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">16</td>
              <td className="border border-slate-700 px-1 py-0.5">
                <div className="font-bold">आयकर की गणना उपरोक्त कॉलम 15 के आधार पर:</div>
                {isOld ? (
                  <div className="text-[8px] text-slate-600">
                    • 2,50,000 तक: Nil &nbsp;|&nbsp;
                    • 2,50,001 - 5,00,000 (5%): ₹12,500 &nbsp;|&nbsp;
                    • 5,00,001 - 10,00,000 (20%): ₹{Math.max(0, Math.round((roundInc15 - 500000) * 0.20)).toLocaleString('en-IN')}
                  </div>
                ) : (
                  <div className="text-[8px] text-slate-600">
                    • 3,00,000 तक: Nil &nbsp;|&nbsp;
                    • 3,00,001 - 7,00,000 (5%): ₹20,000 &nbsp;|&nbsp;
                    • 7,00,001 - 10,00,000 (10%): ₹{Math.max(0, Math.round((roundInc15 - 700000) * 0.10)).toLocaleString('en-IN')}
                  </div>
                )}
                <div className="text-[8.5px] font-semibold text-slate-800 mt-0.5">
                  (1) योग आयकर: ₹{taxBeforeRebate.toLocaleString('en-IN')} &nbsp;|&nbsp;
                  (2) छूट धारा 87(A): ₹{rebate87A.toLocaleString('en-IN')} &nbsp;|&nbsp;
                  (3) शेष आयकर (1 - 2): ₹{taxAfterRebate.toLocaleString('en-IN')} &nbsp;|&nbsp;
                  (4) स्वास्थ्य एवं शिक्षा उपकर 4%: ₹{cess.toLocaleString('en-IN')}
                </div>
              </td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-bold">
                {totalTaxPayable.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 17: Section 89 Relief */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">17</td>
              <td className="border border-slate-700 px-1 py-0.5">घटाइये : राहत धारा 89 के तहत (Relief on Arrears)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono">
                {(deductionsOld.sec89_ReliefArrears || 0).toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 18: Total Tax Payable */}
            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-700 px-1 py-0.5 text-center">18</td>
              <td className="border border-slate-700 px-1 py-0.5">कुल शेष आयकर (Net Income Tax)</td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono font-bold">
                {totalTaxPayable.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Point 19: Monthly TDS Details */}
            <tr>
              <td className="border border-slate-700 px-1 py-0.5 text-center font-bold">19</td>
              <td className="border border-slate-700 px-1 py-0.5">
                <span className="font-bold">आयकर कटौती का विवरण:</span> &nbsp;
                नवम्बर {fy.split('-')[0]} तक: ₹0 &nbsp;|&nbsp; दिसम्बर: ₹0 &nbsp;|&nbsp; जनवरी: ₹0 &nbsp;|&nbsp; फरवरी: ₹0 &nbsp;|&nbsp; TDS कुल: ₹0
              </td>
              <td className="border border-slate-700 px-1 py-0.5 text-right font-mono">0</td>
            </tr>

            {/* Point 20: Net Payable / Refundable */}
            <tr className="bg-slate-200 font-black text-[10.5px]">
              <td className="border border-slate-700 px-1 py-1 text-center font-black">20</td>
              <td className="border border-slate-700 px-1 py-1 uppercase text-slate-950 font-black tracking-wide">
                Income Tax Payable ({isOld ? 'Old Tax Regime' : 'New Tax Regime'})
              </td>
              <td className="border border-slate-700 px-1 py-1 text-right font-mono text-emerald-950 font-black text-xs">
                ₹{totalTaxPayable.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Comparison Callout Box */}
        <div className="p-1 bg-amber-50 border border-amber-300 rounded mb-1 text-center text-[9px] font-bold text-amber-950">
          💡 निर्णय: {compResult.savingSuggestion} (Old Regime: ₹{compResult.old_totalTaxPayable.toLocaleString('en-IN')} | New Regime: ₹{compResult.new_totalTaxPayable.toLocaleString('en-IN')})
        </div>

        {/* HRA Exemption Note Box */}
        {isOld && compResult.calculatedHraExemption > 0 && (
          <div className="bg-slate-50 border border-slate-400 p-1 rounded mb-1 text-[8px] text-slate-700 leading-tight">
            <strong>मकान किराया छूट (HRA Exemption Section 10(13A)):</strong> 12 माह में प्राप्त HRA: ₹{totalHRA12M.toLocaleString('en-IN')} | वेतन का 10%: ₹{Math.round(0.10 * (totalBasic12M + totalDA12M)).toLocaleString('en-IN')} | चुकाया गया किराया: ₹{(deductionsOld.actualRentPaid12M || 0).toLocaleString('en-IN')} | छूट योग्य HRA: <strong>₹{compResult.calculatedHraExemption.toLocaleString('en-IN')}</strong>
          </div>
        )}

        {/* DDO and Employee Signatures Block */}
        <div className="mt-3 pt-2 border-t-2 border-slate-700 grid grid-cols-2 gap-8 text-[10px] text-slate-900 font-bold">
          <div className="text-center space-y-0.5">
            <p className="border-b border-dotted border-slate-500 pb-4 inline-block w-40"></p>
            <p className="font-extrabold uppercase">Signature of Employee</p>
            <p className="text-[9px] font-medium text-slate-600">({profile.empName})</p>
          </div>

          <div className="text-center space-y-0.5">
            <p className="border-b border-dotted border-slate-500 pb-4 inline-block w-40"></p>
            <p className="font-extrabold uppercase">Signature of DDO with Seal</p>
            <p className="text-[9px] font-medium text-slate-600">({profile.ddoName})</p>
          </div>
        </div>
      </div>
    </div>
  );
};