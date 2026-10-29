import React from 'react';
import { EmployeeProfile, TaxComparisonResult, TaxDeductionsOld } from '../types/taxTypes';
import { Printer, ShieldCheck, CheckCircle2, Award, FileText } from 'lucide-react';

interface TaxStatementProps {
  profile: EmployeeProfile;
  compResult: TaxComparisonResult;
  deductionsOld: TaxDeductionsOld;
  selectedRegimeForDDO: 'NEW' | 'OLD';
}

export const DdoTaxStatementView: React.FC<TaxStatementProps> = ({
  profile,
  compResult,
  deductionsOld,
  selectedRegimeForDDO
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isOld = selectedRegimeForDDO === 'OLD';

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            आयकर आगणन प्रपत्र (Form 16 Part-B / Tax Estimation Statement)
          </h2>
          <p className="text-xs text-slate-500">
            DDO कार्यालय एवं ट्रेजरी में जमा कराने हेतु राजस्थान का अधिकृत मानक A4 प्रारूप
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-700">
            <span>प्रपत्र हेतु चयनित व्यवस्था:</span>
            <span className={`px-2.5 py-1 rounded text-white ${isOld ? 'bg-amber-600' : 'bg-emerald-700'}`}>
              {isOld ? 'पुरानी कर व्यवस्था (Old Regime)' : 'नई कर व्यवस्था (New Regime)'}
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            प्रपत्र प्रिंट / PDF सेव करें
          </button>
        </div>
      </div>

      {/* A4 Size Printable Statement */}
      <div className="bg-white p-6 md:p-10 rounded-xl border border-slate-300 shadow-sm text-slate-900 printable-area max-w-[850px] mx-auto text-[12.5px] leading-relaxed">
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
          <h1 className="text-lg md:text-xl font-extrabold uppercase text-slate-900">
            कार्यालय: {profile.schoolName || 'राजकीय उच्च माध्यमिक विद्यालय, राजस्थान'}
          </h1>
          <h2 className="text-sm font-bold text-slate-800 uppercase mt-0.5">
            वेतनभोगी कर्मचारी आयकर आगणन एवं कटौती विवरण पत्र (वित्तीय वर्ष {profile.financialYear})
          </h2>
          <p className="text-xs text-slate-600">
            कर निर्धारण वर्ष (Assessment Year): <strong>{profile.assessmentYear}</strong> | नियम: आयकर अधिनियम 1961
          </p>
        </div>

        {/* Part A: Employee Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-50 p-3 rounded border border-slate-300 mb-4 text-xs">
          <div>1. कर्मचारी का नाम: <strong>{profile.empName || 'श्री / श्रीमती कार्मिक'}</strong></div>
          <div>2. पद (Designation): <strong>{profile.designation || 'अध्यापक / व्याख्याता'}</strong></div>
          <div>3. स्थायी खाता संख्या (PAN): <strong className="font-mono">{profile.panNumber || 'ABCDE1234F'}</strong></div>
          <div>4. PRAN / GPF खाता संख्या: <strong className="font-mono">{profile.pranNumber || '1100XXXXXXXX'}</strong></div>
          <div>5. पे-मैट्रिक्स लेवल: <strong>{profile.payLevel} (बेसिक: ₹{profile.currentBasic.toLocaleString('en-IN')})</strong></div>
          <div>6. राज्य बीमा पॉलिसी (SI No): <strong className="font-mono">{profile.siNumber || 'SI-XXXXXX'}</strong></div>
          <div>7. कार्यालय TAN नंबर: <strong className="font-mono">{profile.officeTan || 'JPRRXXXXX'}</strong></div>
          <div>8. चुनी गई कर व्यवस्था: <strong className="text-emerald-800 uppercase">{selectedRegimeForDDO} TAX REGIME</strong></div>
        </div>

        {/* Part B: Numerical Tax Calculation Table */}
        <table className="w-full border-collapse border border-slate-400 mb-4 text-xs">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold">
              <th className="border border-slate-400 p-2 text-center w-12">क्र. सं.</th>
              <th className="border border-slate-400 p-2 text-left">आय एवं कटौती का विवरण (Particulars)</th>
              <th className="border border-slate-400 p-2 text-right w-36">राशि (रुपये में)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-400 p-1.5 text-center font-bold">1</td>
              <td className="border border-slate-400 p-1.5">सकल वेतन (Gross Salary as per PayManager GA-55)</td>
              <td className="border border-slate-400 p-1.5 text-right font-mono font-bold">₹{compResult.grossTotalIncome.toLocaleString('en-IN')}</td>
            </tr>

            {/* Deductions breakdown */}
            {isOld ? (
              <>
                <tr className="bg-slate-50">
                  <td className="border border-slate-400 p-1.5 text-center font-bold">2</td>
                  <td className="border border-slate-400 p-1.5">कम करें: मानक कटौती (Standard Deduction u/s 16(ia))</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono text-red-700 font-bold">- ₹50,000</td>
                </tr>
                {compResult.old_sec24b_homeLoan > 0 && (
                  <tr>
                    <td className="border border-slate-400 p-1.5 text-center font-bold">3</td>
                    <td className="border border-slate-400 p-1.5">कम करें: गृह ऋण ब्याज (Home Loan Interest u/s 24(b))</td>
                    <td className="border border-slate-400 p-1.5 text-right font-mono text-red-700">- ₹{compResult.old_sec24b_homeLoan.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-semibold">
                  <td className="border border-slate-400 p-1.5 text-center font-bold">4</td>
                  <td className="border border-slate-400 p-1.5">वेतन से सकल करयोग्य आय (Gross Income before Chapter VI-A)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono font-bold">
                    ₹{(compResult.grossTotalIncome - 50000 - compResult.old_sec24b_homeLoan).toLocaleString('en-IN')}
                  </td>
                </tr>
                {/* Chapter VI-A */}
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">5</td>
                  <td className="border border-slate-400 p-1.5">
                    <strong>अध्याय VI-A के तहत स्वीकृत कटौतियां:</strong>
                    <div className="pl-3 pt-1 text-[11px] text-slate-600 space-y-0.5">
                      <div>• धारा 80C (GPF: ₹{compResult.old_sec80C_gpf.toLocaleString('en-IN')}, SI: ₹{compResult.old_sec80C_si.toLocaleString('en-IN')}, अन्य: ₹{compResult.old_sec80C_others.toLocaleString('en-IN')}) [अधिकतम ₹1,50,000]: <strong>₹{compResult.old_sec80C_totalAllowed.toLocaleString('en-IN')}</strong></div>
                      {compResult.old_sec80CCD1B > 0 && <div>• धारा 80CCD(1B) NPS अतिरिक्त अंशदान: <strong>₹{compResult.old_sec80CCD1B.toLocaleString('en-IN')}</strong></div>}
                      {compResult.old_sec80D > 0 && <div>• धारा 80D (RGHS कटौती एवं स्वास्थ्य बीमा): <strong>₹{compResult.old_sec80D.toLocaleString('en-IN')}</strong></div>}
                      {compResult.old_sec80U_divyang > 0 && <div>• धारा 80U (स्वयं दिव्यांग कार्मिक विशेष छूट): <strong>₹{compResult.old_sec80U_divyang.toLocaleString('en-IN')}</strong></div>}
                      {compResult.old_sec80DD_dependent > 0 && <div>• धारा 80DD (आश्रित दिव्यांग परिजन देख-रेख): <strong>₹{compResult.old_sec80DD_dependent.toLocaleString('en-IN')}</strong></div>}
                      {compResult.old_otherDeductions > 0 && <div>• अन्य अध्याय VI-A कटौतियां (80E, 80G आदि): <strong>₹{compResult.old_otherDeductions.toLocaleString('en-IN')}</strong></div>}
                    </div>
                  </td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono text-red-700 font-bold">
                    - ₹{(compResult.old_totalDeductions - 50000 - compResult.old_sec24b_homeLoan).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className="bg-emerald-50 font-bold text-slate-900">
                  <td className="border border-slate-400 p-1.5 text-center">6</td>
                  <td className="border border-slate-400 p-1.5">शुद्ध करयोग्य आय (Net Taxable Income)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono text-emerald-950 font-extrabold">
                    ₹{compResult.old_taxableIncome.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">7</td>
                  <td className="border border-slate-400 p-1.5">स्लैब अनुसार परिकलित आयकर (Tax before Rebate)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono">₹{compResult.old_taxBeforeRebate.toLocaleString('en-IN')}</td>
                </tr>
                {compResult.old_rebate87A > 0 && (
                  <tr>
                    <td className="border border-slate-400 p-1.5 text-center font-bold">8</td>
                    <td className="border border-slate-400 p-1.5">कम करें: धारा 87A के तहत कर छूट (Tax Rebate u/s 87A)</td>
                    <td className="border border-slate-400 p-1.5 text-right font-mono text-emerald-700 font-bold">- ₹{compResult.old_rebate87A.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">9</td>
                  <td className="border border-slate-400 p-1.5">स्वास्थ्य एवं शिक्षा उपकर (Health & Education Cess @ 4%)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono">₹{compResult.old_cess.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-slate-200 font-extrabold text-slate-900 text-sm">
                  <td className="border border-slate-400 p-2 text-center">10</td>
                  <td className="border border-slate-400 p-2">कुल देय आयकर (Net Total Tax Payable - Old Regime)</td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-emerald-950">
                    ₹{compResult.old_totalTaxPayable.toLocaleString('en-IN')}
                  </td>
                </tr>
              </>
            ) : (
              // NEW REGIME ROWS
              <>
                <tr className="bg-slate-50">
                  <td className="border border-slate-400 p-1.5 text-center font-bold">2</td>
                  <td className="border border-slate-400 p-1.5">कम करें: मानक कटौती (Standard Deduction u/s 16(ia) - New Regime)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono text-red-700 font-bold">- ₹75,000</td>
                </tr>
                <tr className="bg-emerald-50 font-bold text-slate-900">
                  <td className="border border-slate-400 p-1.5 text-center">3</td>
                  <td className="border border-slate-400 p-1.5">शुद्ध करयोग्य आय (Net Taxable Income u/s 115BAC)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono text-emerald-950 font-extrabold">
                    ₹{compResult.new_taxableIncome.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">4</td>
                  <td className="border border-slate-400 p-1.5">न्यू स्लैब अनुसार परिकलित आयकर (Tax before Rebate)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono">₹{compResult.new_taxBeforeRebate.toLocaleString('en-IN')}</td>
                </tr>
                {compResult.new_rebate87A > 0 && (
                  <tr>
                    <td className="border border-slate-400 p-1.5 text-center font-bold">5</td>
                    <td className="border border-slate-400 p-1.5">कम करें: धारा 87A के तहत पूर्ण कर छूट (Rebate u/s 87A - ₹7 लाख तक)</td>
                    <td className="border border-slate-400 p-1.5 text-right font-mono text-emerald-700 font-bold">- ₹{compResult.new_rebate87A.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">6</td>
                  <td className="border border-slate-400 p-1.5">स्वास्थ्य एवं शिक्षा उपकर (Health & Education Cess @ 4%)</td>
                  <td className="border border-slate-400 p-1.5 text-right font-mono">₹{compResult.new_cess.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-slate-200 font-extrabold text-slate-900 text-sm">
                  <td className="border border-slate-400 p-2 text-center">7</td>
                  <td className="border border-slate-400 p-2">कुल देय आयकर (Net Total Tax Payable - New Regime)</td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-emerald-950">
                    ₹{compResult.new_totalTaxPayable.toLocaleString('en-IN')}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Declaration & Signature Boxes */}
        <div className="mt-8 border-t border-slate-400 pt-3 text-xs text-slate-700 space-y-4">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] leading-relaxed">
            <strong>कर्मचारी घोषणा (Self Declaration):</strong> मैं प्रमाणित करता/करती हूँ कि इस विवरण पत्र में दर्शायी गई आय एवं कटौतियों की समस्त प्रविष्टियां मेरे सर्वोत्तम ज्ञान और विश्वास के अनुसार सत्य, पूर्ण एवं सही हैं। मैंने वित्तीय वर्ष {profile.financialYear} हेतु आधिकारिक रूप से <strong>{isOld ? 'पुरानी कर व्यवस्था (Old Regime)' : 'नई कर व्यवस्था (New Regime)'}</strong> का चयन किया है।
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6">
            <div className="text-center">
              <p className="text-[11px] text-slate-500">स्थान व दिनांक:</p>
              <div className="mt-8 border-t border-slate-400 pt-1 font-bold">हस्ताक्षर करदाता कर्मचारी</div>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-500">दस्तावेज सत्यापन:</p>
              <div className="mt-8 border-t border-slate-400 pt-1 font-bold">हस्ताक्षर बिल प्रभारी / लिपिक</div>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-500">कार्यालय स्वीकृति:</p>
              <div className="mt-8 border-t border-slate-400 pt-1 font-bold">हस्ताक्षर मय मोहर DDO</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
