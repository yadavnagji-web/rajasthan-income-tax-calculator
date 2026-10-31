import React from 'react';
import { EmployeeProfile, MonthlyPayRecord } from '../types/taxTypes';

interface Form16PartBViewProps {
  profile: EmployeeProfile;
  records: MonthlyPayRecord[];
}

export const Form16PartBView: React.FC<Form16PartBViewProps> = ({
  profile,
  records
}) => {
  // Aggregate totals from records
  const totalGrossSalary = records.reduce((sum, r) => sum + (r.grossSalary || 0), 0);
  const totalTdsPaid = records.reduce((sum, r) => sum + (r.itTdsAmount || 0), 0);

  // Budget 2025 New Tax Regime Computations for AY 2026-27:
  const standardDeduction = 75000; // New Regime SD increased to 75,000
  const taxableIncomeBeforeRound = Math.max(0, totalGrossSalary - standardDeduction);
  // Rounded off to nearest 10 u/s 288A
  const taxableIncome = Math.round(taxableIncomeBeforeRound / 10) * 10;

  // New Tax Regime Slab Calculation (AY 2026-27):
  // 0 - 4,00,000: Nil
  // 4,00,001 - 8,00,000: 5% (max 20,000)
  // 8,00,001 - 12,00,000: 10% (max 40,000)
  // 12,00,001 - 16,00,000: 15% (max 60,000)
  // 16,00,001 - 20,00,000: 20% (max 80,000)
  // 20,00,001 - 24,00,000: 25% (max 1,00,000)
  // Above 24,00,000: 30%
  let taxGross = 0;
  if (taxableIncome > 400000) {
    if (taxableIncome <= 800000) {
      taxGross += (taxableIncome - 400000) * 0.05;
    } else {
      taxGross += 400000 * 0.05; // 20,000

      if (taxableIncome <= 1200000) {
        taxGross += (taxableIncome - 800000) * 0.10;
      } else {
        taxGross += 400000 * 0.10; // 40,000 (total 60,000 up to 12L)

        if (taxableIncome <= 1600000) {
          taxGross += (taxableIncome - 1200000) * 0.15;
        } else {
          taxGross += 400000 * 0.15;

          if (taxableIncome <= 2000000) {
            taxGross += (taxableIncome - 1600000) * 0.20;
          } else {
            taxGross += 400000 * 0.20;

            if (taxableIncome <= 2400000) {
              taxGross += (taxableIncome - 2000000) * 0.25;
            } else {
              taxGross += 400000 * 0.25;
              taxGross += (taxableIncome - 2400000) * 0.30;
            }
          }
        }
      }
    }
  }

  // Section 87A Rebate in New Regime:
  // For taxable income up to ₹12,00,000, 100% rebate is available (up to ₹60,000 tax)
  const rebate87A = taxableIncome <= 1200000 ? taxGross : 0;
  const taxAfterRebate = Math.max(0, taxGross - rebate87A);
  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTaxLiability = taxAfterRebate + cess;
  const netTaxDueOrRefund = totalTaxLiability - totalTdsPaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
      {/* Dynamic 1-Page A4 Portrait Print Style */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait !important;
            margin: 4mm 5mm !important;
          }
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .form16-print-container {
            width: 100% !important;
            max-width: 200mm !important;
            margin: 0 auto !important;
            padding: 3mm 4mm !important;
            border: 1.5px solid #000 !important;
            display: block !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
          }
          .form16-print-container table {
            width: 100% !important;
            font-size: 9.5px !important;
            line-height: 1.18 !important;
            border-collapse: collapse !important;
            margin-bottom: 2mm !important;
          }
          .form16-print-container th,
          .form16-print-container td {
            padding: 1.2px 2.5px !important;
            font-size: 9.5px !important;
          }
          .form16-verification-box {
            padding: 2.5mm 3.5mm !important;
            font-size: 9px !important;
            line-height: 1.25 !important;
            margin-top: 2mm !important;
            display: block !important;
          }
        }
      `}</style>

      {/* Top Toolbar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-gray-200 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📜</span> FORM NO. 16 - PART B (1-Page A4 Portrait)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            आयकर अधिनियम 1961 (New Tax Regime u/s 115BAC) • स्वतः पोर्ट्रेट मोड में 1-पेज A4 प्रिंटेबल प्रपत्र
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>प्रिंट Form 16 (Portrait 1-Page)</span>
          </button>
        </div>
      </div>

      {!profile.empName && totalGrossSalary === 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2 print:hidden">
          <span>ℹ️</span>
          <span>कृपया <strong>GA-55 PDF अपलोड करें</strong> या 'GA-55 वेतन विवरण' टैब में डेटा भरें। वर्तमान में फॉर्म ब्लैंक है।</span>
        </div>
      )}

      {/* Printable Area - Form 16 Part B (Guaranteed 1-Page Portrait) */}
      <div className="form16-print-container max-w-[800px] mx-auto border-2 border-gray-800 p-3 sm:p-4 bg-white text-gray-900 text-[10px] sm:text-[10.5px] leading-tight font-sans">
        {/* Header */}
        <div className="text-center pb-1 border-b-2 border-gray-800 mb-1.5">
          <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">FORM NO. 16</h1>
          <p className="text-[9px] text-gray-600 italic">[See rule 31(1)(a)]</p>
          <p className="text-[10px] font-bold mt-0.5">
            PART B (Annexure)
          </p>
          <p className="text-[9.5px] mt-0.5 text-gray-700">
            Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salaries
          </p>
          <div className="inline-block mt-0.5 px-2.5 py-0.5 border border-gray-400 bg-gray-50 rounded text-[9.5px] font-bold text-emerald-900">
            न्यू टैक्स रिजीम (New Tax Regime u/s 115BAC)
          </div>
        </div>

        {/* Employer & Employee Master Info Table */}
        <table className="w-full border-collapse border border-gray-800 mb-1.5 text-[10px]">
          <tbody>
            <tr className="border-b border-gray-800 bg-gray-50">
              <td className="p-1 border-r border-gray-800 w-1/2 font-semibold">
                Name and Address of the Employer:
              </td>
              <td className="p-1 w-1/2 font-semibold">
                Name and Designation of the Employee:
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="p-1 border-r border-gray-800 align-top">
                <div className="font-bold">{profile.schoolName || '-'}</div>
                <div>DDO Code: <strong>{profile.ddoCode || '-'}</strong></div>
                <div>District / State: <strong>Rajasthan</strong></div>
              </td>
              <td className="p-1 align-top">
                <div className="font-bold text-[11px]">{profile.empName || '-'}</div>
                <div>Designation: <strong>{profile.designation || '-'}</strong></div>
                <div>Employee ID: <strong>{profile.empId || '-'}</strong></div>
                <div>Pay Level: <strong>{profile.payLevel || '-'}</strong> | A/c: {profile.bankAccount || '-'}</div>
              </td>
            </tr>
            <tr className="border-b border-gray-800 bg-gray-50 font-semibold text-center text-[9px]">
              <td className="p-0.5 border-r border-gray-800">PAN of the Deductor</td>
              <td className="p-0.5">TAN of the Deductor</td>
            </tr>
            <tr className="border-b border-gray-800 text-center font-mono">
              <td className="p-0.5 border-r border-gray-800">{profile.officeTan ? 'RAJGOV0001' : '-'}</td>
              <td className="p-0.5 font-bold">{profile.officeTan || '-'}</td>
            </tr>
            <tr className="border-b border-gray-800 bg-gray-50 font-semibold text-center text-[9px]">
              <td className="p-0.5 border-r border-gray-800">PAN of the Employee</td>
              <td className="p-0.5">Assessment Year / Financial Year</td>
            </tr>
            <tr className="text-center">
              <td className="p-0.5 border-r border-gray-800 font-bold font-mono text-[11px]">{profile.panNumber || '-'}</td>
              <td className="p-0.5 font-bold">
                A.Y.: {profile.assessmentYear || '2026-27'} (F.Y.: {profile.financialYear || '2025-26'})
              </td>
            </tr>
          </tbody>
        </table>

        {/* Details of Salary Paid and any other income and tax deducted */}
        <table className="w-full border-collapse border border-gray-800 mb-1.5 text-[9.5px] sm:text-[10px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-800 text-left font-bold">
              <th className="p-1 border-r border-gray-800 w-7 text-center">क्र.</th>
              <th className="p-1 border-r border-gray-800">Particulars (विवरण)</th>
              <th className="p-1 border-r border-gray-800 w-24 text-right">रकम (Rs.)</th>
              <th className="p-1 w-28 text-right">कुल रकम (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Gross Salary */}
            <tr className="border-b border-gray-300">
              <td className="p-1 text-center font-bold">1.</td>
              <td className="p-1 font-bold" colSpan={3}>Gross Salary (सकल वेतन)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td></td>
              <td className="p-1 pl-4 text-gray-700">(a) Salary as per provisions contained in sec. 17(1)</td>
              <td className="p-1 text-right font-mono">₹{totalGrossSalary.toLocaleString('en-IN')}</td>
              <td></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td></td>
              <td className="p-1 pl-4 text-gray-700">(b) Value of perquisites u/s 17(2)</td>
              <td className="p-1 text-right font-mono">₹0</td>
              <td></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td></td>
              <td className="p-1 pl-4 text-gray-700">(c) Profits in lieu of salary u/s 17(3)</td>
              <td className="p-1 text-right font-mono">₹0</td>
              <td></td>
            </tr>
            <tr className="border-b border-gray-400 bg-gray-50 font-bold">
              <td></td>
              <td className="p-1 pl-4">Total Gross Salary (सकल वेतन योग)</td>
              <td></td>
              <td className="p-1 text-right font-mono text-xs">₹{totalGrossSalary.toLocaleString('en-IN')}</td>
            </tr>

            {/* 2. Exemptions u/s 10 */}
            <tr className="border-b border-gray-200">
              <td className="p-1 text-center font-bold">2.</td>
              <td className="p-1">Less: Allowance to the extent exempt u/s 10 (न्यू रिजीम में शून्य)</td>
              <td className="p-1 text-right font-mono">₹0</td>
              <td className="p-1 text-right font-mono">₹0</td>
            </tr>

            {/* 3. Balance */}
            <tr className="border-b border-gray-200">
              <td className="p-1 text-center font-bold">3.</td>
              <td className="p-1 font-semibold">Balance (1 - 2)</td>
              <td></td>
              <td className="p-1 text-right font-mono font-semibold">₹{totalGrossSalary.toLocaleString('en-IN')}</td>
            </tr>

            {/* 4. Deductions under section 16 */}
            <tr className="border-b border-gray-300">
              <td className="p-1 text-center font-bold">4.</td>
              <td className="p-1 font-bold" colSpan={3}>Deductions under Section 16</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td></td>
              <td className="p-1 pl-4 text-gray-700">(a) Standard Deduction u/s 16(ia) (Budget 2025 New Slab)</td>
              <td className="p-1 text-right font-mono font-semibold text-emerald-700">₹{standardDeduction.toLocaleString('en-IN')}</td>
              <td></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td></td>
              <td className="p-1 pl-4 text-gray-700">(b) Entertainment allowance u/s 16(ii)</td>
              <td className="p-1 text-right font-mono">₹0</td>
              <td></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td></td>
              <td className="p-1 pl-4 text-gray-700">(c) Tax on employment u/s 16(iii)</td>
              <td className="p-1 text-right font-mono">₹0</td>
              <td></td>
            </tr>
            <tr className="border-b border-gray-400 bg-gray-50 font-bold">
              <td></td>
              <td className="p-1 pl-4">Total Deductions under Section 16</td>
              <td></td>
              <td className="p-1 text-right font-mono text-emerald-700">₹{standardDeduction.toLocaleString('en-IN')}</td>
            </tr>

            {/* 5. Income chargeable under the head Salaries */}
            <tr className="border-b border-gray-400 bg-blue-50/40 font-bold">
              <td className="p-1 text-center">5.</td>
              <td className="p-1">Income chargeable under the head "Salaries" (3 - 4)</td>
              <td></td>
              <td className="p-1 text-right font-mono text-xs">₹{taxableIncomeBeforeRound.toLocaleString('en-IN')}</td>
            </tr>

            {/* 6. Other Income */}
            <tr className="border-b border-gray-200">
              <td className="p-1 text-center">6.</td>
              <td className="p-1 text-gray-700">Add: Any other income reported by employee</td>
              <td></td>
              <td className="p-1 text-right font-mono">₹0</td>
            </tr>

            {/* 7. Gross Total Income */}
            <tr className="border-b border-gray-400 font-bold">
              <td className="p-1 text-center">7.</td>
              <td className="p-1">Gross Total Income (5 + 6)</td>
              <td></td>
              <td className="p-1 text-right font-mono">₹{taxableIncomeBeforeRound.toLocaleString('en-IN')}</td>
            </tr>

            {/* 8. Deductions under Chapter VI-A */}
            <tr className="border-b border-gray-200">
              <td className="p-1 text-center">8.</td>
              <td className="p-1 text-gray-600">Deductions under Chapter VI-A (Not applicable under New Regime)</td>
              <td></td>
              <td className="p-1 text-right font-mono">₹0</td>
            </tr>

            {/* 9. Total Taxable Income */}
            <tr className="border-b-2 border-gray-800 bg-emerald-50 font-extrabold text-xs">
              <td className="p-1 text-center">9.</td>
              <td className="p-1 text-emerald-950">
                Total Taxable Income (कुल कर योग्य आय - Rounded off u/s 288A)
              </td>
              <td></td>
              <td className="p-1 text-right font-mono text-emerald-900">
                ₹{taxableIncome.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* 10. Tax on Total Income */}
            <tr className="border-b border-gray-200">
              <td className="p-1 text-center font-bold">10.</td>
              <td className="p-1">
                Tax on Total Income (New Regime Slabs: 0-4L Nil, 4-8L 5%, 8-12L 10%)
              </td>
              <td></td>
              <td className="p-1 text-right font-mono font-semibold">₹{taxGross.toLocaleString('en-IN')}</td>
            </tr>

            {/* 11. Section 87A Rebate */}
            <tr className="border-b border-gray-200 text-emerald-700 font-semibold">
              <td className="p-1 text-center">11.</td>
              <td className="p-1">
                Less: Rebate under Section 87A (आय ₹12 लाख तक होने पर 100% कर छूट)
              </td>
              <td></td>
              <td className="p-1 text-right font-mono">(-) ₹{rebate87A.toLocaleString('en-IN')}</td>
            </tr>

            {/* 12. Tax payable after rebate */}
            <tr className="border-b border-gray-200">
              <td className="p-1 text-center font-bold">12.</td>
              <td className="p-1">Tax payable after rebate (10 - 11)</td>
              <td></td>
              <td className="p-1 text-right font-mono font-bold">₹{taxAfterRebate.toLocaleString('en-IN')}</td>
            </tr>

            {/* 13. Health and Education Cess */}
            <tr className="border-b border-gray-200">
              <td className="p-1 text-center">13.</td>
              <td className="p-1 text-gray-700">Add: Health and Education Cess @ 4%</td>
              <td></td>
              <td className="p-1 text-right font-mono">₹{cess.toLocaleString('en-IN')}</td>
            </tr>

            {/* 14. Total Tax Liability */}
            <tr className="border-b border-gray-400 bg-gray-50 font-bold">
              <td className="p-1 text-center">14.</td>
              <td className="p-1">Total Tax Liability (12 + 13)</td>
              <td></td>
              <td className="p-1 text-right font-mono">₹{totalTaxLiability.toLocaleString('en-IN')}</td>
            </tr>

            {/* 15. Relief u/s 89 */}
            <tr className="border-b border-gray-200">
              <td className="p-1 text-center">15.</td>
              <td className="p-1 text-gray-700">Less: Relief under Section 89</td>
              <td></td>
              <td className="p-1 text-right font-mono">₹0</td>
            </tr>

            {/* 16. Net Tax Payable */}
            <tr className="border-b border-gray-300 font-extrabold">
              <td className="p-1 text-center">16.</td>
              <td className="p-1">Net Tax Payable (14 - 15)</td>
              <td></td>
              <td className="p-1 text-right font-mono text-emerald-800">₹{totalTaxLiability.toLocaleString('en-IN')}</td>
            </tr>

            {/* 17. Total TDS Deducted */}
            <tr className="border-b border-gray-300">
              <td className="p-1 text-center font-bold">17.</td>
              <td className="p-1">Total TDS Deducted during the year (पे-मैनेजर कटौती योग)</td>
              <td></td>
              <td className="p-1 text-right font-mono font-semibold">₹{totalTdsPaid.toLocaleString('en-IN')}</td>
            </tr>

            {/* 18. Balance Tax Payable / Refundable */}
            <tr className="border-b-2 border-gray-800 bg-emerald-100 font-extrabold text-xs">
              <td className="p-1.5 text-center">18.</td>
              <td className="p-1.5 text-emerald-950">
                {netTaxDueOrRefund <= 0 ? 'Residual Tax Due (शेष देय आयकर) / Refund' : 'शेष देय आयकर (Net Due Tax)'}
              </td>
              <td></td>
              <td className="p-1.5 text-right font-mono text-sm text-emerald-900">
                ₹{Math.max(0, netTaxDueOrRefund).toLocaleString('en-IN')} {netTaxDueOrRefund === 0 ? '(शून्य देय)' : ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Verification / Sign-off Block */}
        <div className="form16-verification-box border border-gray-800 p-2 sm:p-2.5 bg-gray-50 text-[9.5px] leading-normal">
          <p className="font-bold text-center underline uppercase mb-1">Verification</p>
          <p>
            I, <strong>{profile.ddoName || 'Principal & DDO'}</strong>, working in the capacity of Drawing and Disbursing Officer (DDO Code: {profile.ddoCode || '38402'}), do hereby certify that a sum of <strong>Rs. {totalTdsPaid.toLocaleString('en-IN')}</strong> [Rupees in words] has been deducted and deposited to the credit of the Central Government. I further certify that the information given above is true, complete and correct.
          </p>
          <div className="flex justify-between items-end mt-3 sm:mt-4 pt-1">
            <div>
              <div>Place: <strong>Kuan, Dungarpur (Raj.)</strong></div>
              <div>Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
            </div>
            <div className="text-right">
              <div className="font-bold">Signature of the Person Responsible for Deduction of Tax</div>
              <div className="text-[9px] text-gray-600 mt-0.5">Designation: DDO / Institutional Head</div>
              <div className="text-[9px] text-gray-500 font-mono">Seal: Govt. Sanskrit School Kuan</div>
            </div>
          </div>
        </div>

        {/* Note Footer */}
        <div className="mt-1 text-center text-[8.5px] text-gray-500 italic">
          * Note: Generated under New Tax Regime provisions u/s 115BAC. Standard Deduction is ₹75,000. Full tax rebate is applicable under Section 87A for net taxable income up to ₹12,00,000.
        </div>
      </div>
    </div>
  );
};
