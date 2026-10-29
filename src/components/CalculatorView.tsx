import React, { useState } from 'react';
import { 
  EmployeeProfile, 
  MonthlyPayRecord, 
  TaxDeductionsOld, 
  TaxComparisonResult
} from '../types/taxTypes';
import { PAY_MATRIX_LEVELS, getRajasthanGpfMonthly, getRajasthanSiSlab, getRajasthanRghsMonthly, FINANCIAL_MONTHS } from '../data/rajasthanPayData';
import { DocumentsChecklistBox } from './DocumentsChecklistBox';
import { 
  Calculator, 
  Building2, 
  Percent, 
  Sparkles,
  Info
} from 'lucide-react';

interface CalculatorViewProps {
  profile: EmployeeProfile;
  setProfile: React.Dispatch<React.SetStateAction<EmployeeProfile>>;
  records: MonthlyPayRecord[];
  setRecords: React.Dispatch<React.SetStateAction<MonthlyPayRecord[]>>;
  deductionsOld: TaxDeductionsOld;
  setDeductionsOld: React.Dispatch<React.SetStateAction<TaxDeductionsOld>>;
  compResult: TaxComparisonResult;
  onNavigateTab: (tab: 'ga55' | 'ddoStatement' | 'rules') => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  profile,
  setProfile,
  records,
  setRecords,
  deductionsOld,
  setDeductionsOld,
  compResult,
  onNavigateTab
}) => {
  const [showAdvancedDeductions, setShowAdvancedDeductions] = useState(false);

  // Recalculate full 12 months based on level and basic
  const handleApplyBasicPay = (basic: number, level: string, hraRateOverride?: number) => {
    const defaultSi = getRajasthanSiSlab(basic).min;
    const defaultRghs = getRajasthanRghsMonthly(basic);
    const defaultGpf = getRajasthanGpfMonthly(basic);
    const hraPercent = hraRateOverride !== undefined ? hraRateOverride : (profile.currentHraRate || (profile.cityCategory === 'Y' ? 16 : 9));

    const newRecords: MonthlyPayRecord[] = FINANCIAL_MONTHS.map((m) => {
      const daAmount = Math.round((basic * m.daPercent) / 100);
      const hraAmount = Math.round((basic * hraPercent) / 100);
      const gis = m.key === 'apr' ? 700 : 0;
      const bonus = m.key === 'oct' ? 6774 : 0;
      const gross = basic + daAmount + hraAmount + bonus;
      const totalDed = defaultGpf + defaultSi + defaultRghs + gis;

      return {
        monthName: m.name,
        monthKey: m.key,
        basicPay: basic,
        daRate: m.daPercent,
        daAmount,
        hraRate: hraPercent,
        hraAmount,
        splPay: 0,
        ccaAmount: 0,
        daArrear: 0,
        bonus,
        plSurrender: 0,
        otherAllowances: 0,
        grossSalary: gross,
        gpfAmount: defaultGpf,
        gpfLoan: 0,
        siAmount: defaultSi,
        siLoan: 0,
        rghsAmount: defaultRghs,
        gisAmount: gis,
        licSalary: 0,
        itTdsAmount: 0,
        hitkariNidhi: 0,
        otherDeductions: 0,
        totalDeductions: totalDed,
        netPayable: gross - totalDed
      };
    });

    setRecords(newRecords);
    setProfile(prev => ({ ...prev, currentBasic: basic, payLevel: level }));
  };

  const handleUpdateDeduction = (field: keyof TaxDeductionsOld, val: number) => {
    setDeductionsOld(prev => ({ ...prev, [field]: val }));
  };

  const totalHRA12M = records ? records.reduce((s, r) => s + (r.hraAmount || 0), 0) : 0;

  return (
    <div className="space-y-6">
      {/* Visual Recommendation Banner */}
      <div className={`p-5 rounded-2xl border shadow-sm transition-all ${
        compResult.betterRegime === 'NEW'
          ? 'bg-gradient-to-r from-emerald-500 to-teal-700 text-white border-emerald-400'
          : compResult.betterRegime === 'OLD'
          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400'
          : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-400'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              सर्वश्रेष्ठ कर व्यवस्था अनुशंसा (Recommended Tax Regime)
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              {compResult.savingSuggestion}
            </h2>
            <p className="text-white/90 text-xs md:text-sm">
              सकल वेतन: ₹{compResult.grossTotalIncome.toLocaleString('en-IN')} | न्यू टैक्स: ₹{compResult.new_totalTaxPayable.toLocaleString('en-IN')} | ओल्ड टैक्स: ₹{compResult.old_totalTaxPayable.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('ddoStatement')}
              className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs md:text-sm font-extrabold shadow-md hover:bg-slate-100 transition-all"
            >
              📄 DDO टैक्स प्रपत्र डाउनलोड (1 Page A4) ➔
            </button>
            <button
              onClick={() => onNavigateTab('ga55')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs md:text-sm font-bold backdrop-blur-sm transition-all"
            >
              📑 GA-55 लेजर (1 Page A4)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Employee Basic Details Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              1. कार्यालय एवं कार्मिक विवरण (Master Details)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">कार्यालय / विद्यालय का नाम:</label>
                <input
                  type="text"
                  value={profile.schoolName}
                  onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                  placeholder="उदा. Govt.Praveshika Sanskrit School kunwa"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">कार्यालय का TAN नंबर:</label>
                <input
                  type="text"
                  value={profile.officeTan}
                  onChange={(e) => setProfile({ ...profile, officeTan: e.target.value.toUpperCase() })}
                  placeholder="उदा. JDHG20338D"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">कार्मिक का नाम:</label>
                <input
                  type="text"
                  value={profile.empName}
                  onChange={(e) => setProfile({ ...profile, empName: e.target.value })}
                  placeholder="उदा. Nagji Yadav"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">कार्मिक का पद (Post):</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  placeholder="उदा. TEACHER / LECTURER"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">DDO का नाम:</label>
                <input
                  type="text"
                  value={profile.ddoName}
                  onChange={(e) => setProfile({ ...profile, ddoName: e.target.value })}
                  placeholder="उदा. JEEVRAJ PARMAR"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">स्थायी खाता संख्या (PAN):</label>
                <input
                  type="text"
                  value={profile.panNumber}
                  onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase() })}
                  placeholder="AHHPY4147Q"
                  maxLength={10}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">बैंक खाता संख्या (Bank A/c):</label>
                <input
                  type="text"
                  value={profile.bankAccount}
                  onChange={(e) => setProfile({ ...profile, bankAccount: e.target.value })}
                  placeholder="15000100003153"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">मोबाइल नंबर (Mobile No):</label>
                <input
                  type="text"
                  value={profile.mobileNo}
                  onChange={(e) => setProfile({ ...profile, mobileNo: e.target.value })}
                  placeholder="9982151938"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs md:text-sm">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block font-medium text-slate-700 mb-1">मकान किराया भत्ता दर (Current HRA Rate):</label>
                <select
                  value={profile.currentHraRate}
                  onChange={(e) => {
                    const rate = Number(e.target.value);
                    setProfile({ ...profile, currentHraRate: rate, cityCategory: rate === 16 ? 'Y' : 'Z' });
                    handleApplyBasicPay(profile.currentBasic, profile.payLevel, rate);
                  }}
                  className="w-full p-2 bg-white rounded border border-slate-300 font-medium"
                >
                  <option value={9}>9% (सामान्य दर - Z श्रेणी)</option>
                  <option value={10}>10% (संशोधित दर)</option>
                  <option value={8}>8% (पूर्व दर)</option>
                  <option value={16}>16% / 18% (Y श्रेणी - जयपुर, जोधपुर, कोटा आदि)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">वरिष्ठ नागरिक (Senior Citizen):</span>
                  <span className="text-[11px] text-slate-500">आयु 60 वर्ष या अधिक (Old में ₹3 लाख छूट)</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.isSeniorCitizen}
                  onChange={(e) => setProfile({ ...profile, isSeniorCitizen: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </div>
            </div>
          </div>

          {/* Pay Matrix Picker Box (CLEAN L-1 TO L-24 WITHOUT CADRE LABELS) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-700" />
                2. राजस्थान 7th Pay Matrix (L-1 से L-24)
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded">
                सरकारी मानक पे-स्लैब
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">पे मैट्रिक्स लेवल (Pay Level):</label>
                <select
                  value={profile.payLevel}
                  onChange={(e) => {
                    const newLvl = e.target.value;
                    const firstBasic = PAY_MATRIX_LEVELS[newLvl]?.[0] || 47900;
                    handleApplyBasicPay(firstBasic, newLvl);
                  }}
                  className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-300 font-bold text-slate-800"
                >
                  {Object.keys(PAY_MATRIX_LEVELS).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">मूल वेतन (Basic Pay):</label>
                <select
                  value={profile.currentBasic}
                  onChange={(e) => handleApplyBasicPay(Number(e.target.value), profile.payLevel)}
                  className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-300 font-mono font-bold text-emerald-800"
                >
                  {(PAY_MATRIX_LEVELS[profile.payLevel] || []).map((b) => (
                    <option key={b} value={b}>
                      ₹{b.toLocaleString('en-IN')} प्रतिमाह
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span>वार्षिक मूल वेतन (12 माह): <strong>₹{(profile.currentBasic * 12).toLocaleString('en-IN')}</strong></span>
              <span className="text-emerald-700">GA-55 में DA, HRA, SI, GPF व RGHS स्वतः अपडेट हो गया है</span>
            </div>
          </div>

          {/* HRA Exemption Calculator Input (Sec 10(13A)) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <span>🏠</span>
                3. मकान किराया छूट गणना (HRA Exemption Sec 10(13A))
              </h3>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">
                  कर्मचारी द्वारा 12 माह में चुकाया गया कुल वास्तविक किराया (Total Rent Paid):
                </label>
                <input
                  type="number"
                  value={deductionsOld.actualRentPaid12M || ''}
                  onChange={(e) => handleUpdateDeduction('actualRentPaid12M', Number(e.target.value))}
                  placeholder="वार्षिक किराया ₹ (उदा. ₹53,000 या ₹60,000)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              {compResult.calculatedHraExemption > 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1">
                  <div className="font-bold">✅ आपको मिलने वाली कुल HRA कर छूट: ₹{compResult.calculatedHraExemption.toLocaleString('en-IN')}</div>
                  <div className="text-slate-600">
                    इसके लिए आपको DDO को <strong>₹{compResult.minRentReceiptRequired.toLocaleString('en-IN')}</strong> (अर्थात ₹{Math.round(compResult.minRentReceiptRequired / 12)}/माह) की किराया रसीदें प्रस्तुत करनी होंगी।
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs">
                  यदि आप किराए के मकान में रहते हैं तो ऊपर 12 माह का कुल किराया भरें। टूल धारा 10(13A) के अनुसार स्वतः करमुक्त HRA और आवश्यक रसीद राशि की गणना कर देगा।
                </div>
              )}
            </div>
          </div>

          {/* Deductions Inputs (80C, 80D, Home Loan, Divyang) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-700" />
                4. आयकर कटौतियां एवं बचत (Old Regime Deductions)
              </h3>
              <button
                onClick={() => setShowAdvancedDeductions(!showAdvancedDeductions)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
              >
                {showAdvancedDeductions ? 'कम विवरण छुपाएं ▲' : 'अन्य सभी धाराएं खोलें ▼'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">80C: बच्चों की स्कूल ट्यूशन फीस (2 बच्चे):</label>
                <input
                  type="number"
                  value={deductionsOld.sec80C_TuitionFee || ''}
                  onChange={(e) => handleUpdateDeduction('sec80C_TuitionFee', Number(e.target.value))}
                  placeholder="वार्षिक ट्यूशन फीस ₹"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">80C: होम लोन मूलधन (Principal Repay):</label>
                <input
                  type="number"
                  value={deductionsOld.sec80C_HomeLoanPrincipal || ''}
                  onChange={(e) => handleUpdateDeduction('sec80C_HomeLoanPrincipal', Number(e.target.value))}
                  placeholder="वार्षिक मूलधन ₹ (उदा. ₹50,000)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">24(b): गृह ऋण ब्याज (Home Loan Interest):</label>
                <input
                  type="number"
                  value={deductionsOld.sec24b_HomeLoanInterest || ''}
                  onChange={(e) => handleUpdateDeduction('sec24b_HomeLoanInterest', Number(e.target.value))}
                  placeholder="अधिकतम ₹2,00,000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">80C: LIC / PLI डाक जीवन बीमा:</label>
                <input
                  type="number"
                  value={deductionsOld.sec80C_LicPli || ''}
                  onChange={(e) => handleUpdateDeduction('sec80C_LicPli', Number(e.target.value))}
                  placeholder="वेतन के अतिरिक्त LIC प्रीमियम ₹"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">80C: PPF / सुकन्या समृद्धि (SSY):</label>
                <input
                  type="number"
                  value={deductionsOld.sec80C_PpfSsy || ''}
                  onChange={(e) => handleUpdateDeduction('sec80C_PpfSsy', Number(e.target.value))}
                  placeholder="वार्षिक जमा राशि ₹"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">80CCD(1B): NPS अतिरिक्त ₹50,000 छूट:</label>
                <input
                  type="number"
                  value={deductionsOld.sec80CCD1B_NpsAdditional || ''}
                  onChange={(e) => handleUpdateDeduction('sec80CCD1B_NpsAdditional', Number(e.target.value))}
                  placeholder="अधिकतम ₹50,000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            {/* Disability Toggles */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs md:text-sm">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <strong className="text-slate-800 block">धारा 80U: स्वयं दिव्यांग सरकारी कर्मचारी छूट</strong>
                  <span className="text-[11px] text-slate-500">फ्लैट ₹75,000 (40-79%) अथवा ₹1,25,000 (80%+)</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.isDivyangSelf}
                  onChange={(e) => setProfile({ ...profile, isDivyangSelf: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <strong className="text-slate-800 block">धारा 80DD: आश्रित दिव्यांग परिजन (Dependent Divyang)</strong>
                  <span className="text-[11px] text-slate-500">आश्रित परिजन के इलाज व देखरेख हेतु</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.hasDivyangDependent}
                  onChange={(e) => setProfile({ ...profile, hasDivyangDependent: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </div>
            </div>

            {/* Advanced Section Dropdown */}
            {showAdvancedDeductions && (
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">80D: निजी मेडिक्लेम (स्वयं व परिवार):</label>
                  <input
                    type="number"
                    value={deductionsOld.sec80D_MediclaimSelf || ''}
                    onChange={(e) => handleUpdateDeduction('sec80D_MediclaimSelf', Number(e.target.value))}
                    placeholder="RGHS के अतिरिक्त प्रीमियम ₹"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">80E: उच्च शिक्षा ऋण का ब्याज (Edu Loan):</label>
                  <input
                    type="number"
                    value={deductionsOld.sec80E_EduLoanInterest || ''}
                    onChange={(e) => handleUpdateDeduction('sec80E_EduLoanInterest', Number(e.target.value))}
                    placeholder="असीमित छूट ₹"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC DOCUMENTS CHECKLIST BOX (ADDED AS PER USER REQUEST) */}
          <DocumentsChecklistBox
            profile={profile}
            deductions={deductionsOld}
            compResult={compResult}
            totalHRA12M={totalHRA12M}
          />
        </div>

        {/* Right Column: Comparative Tax Slabs Summary Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-1 gap-4 sticky top-4">
            {/* New Regime Card */}
            <div className={`p-5 rounded-2xl border shadow-sm transition-all ${
              compResult.betterRegime === 'NEW'
                ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  ✨ नई कर व्यवस्था (New Regime)
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  Sec 115BAC
                </span>
              </div>

              <div className="space-y-2 text-xs md:text-sm border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>सकल वेतन (Gross Salary):</span>
                  <span className="font-mono font-medium">{compResult.grossTotalIncome}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>मानक कटौती (Std. Deduction):</span>
                  <span className="font-mono text-red-600 font-medium">- 75,000</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-dashed border-slate-200 pt-1.5">
                  <span>कर योग्य आय (Taxable Income):</span>
                  <span className="font-mono text-emerald-800">{compResult.new_taxableIncome}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>परिकलित आयकर (Tax before Rebate):</span>
                  <span className="font-mono">{compResult.new_taxBeforeRebate}</span>
                </div>
                {compResult.new_rebate87A > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>धारा 87A पूर्ण छूट (Rebate):</span>
                    <span className="font-mono">- {compResult.new_rebate87A}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>उपकर (Health & Edu Cess 4%):</span>
                  <span className="font-mono">{compResult.new_cess}</span>
                </div>

                <div className="flex justify-between items-center text-slate-900 font-extrabold text-base border-t-2 border-slate-300 pt-2.5">
                  <span>कुल देय आयकर:</span>
                  <span className="font-mono text-xl text-emerald-800">
                    ₹{compResult.new_totalTaxPayable}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('ddoStatement')}
                className="w-full mt-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                DDO आयकर प्रपत्र (New Regime) देखें ➔
              </button>
            </div>

            {/* Old Regime Card */}
            <div className={`p-5 rounded-2xl border shadow-sm transition-all ${
              compResult.betterRegime === 'OLD'
                ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  📜 पुरानी कर व्यवस्था (Old Regime)
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                  Exemptions Allowed
                </span>
              </div>

              <div className="space-y-2 text-xs md:text-sm border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>सकल वेतन (Gross Salary):</span>
                  <span className="font-mono font-medium">{compResult.grossTotalIncome}</span>
                </div>
                {compResult.calculatedHraExemption > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>HRA छूट धारा 10(13A):</span>
                    <span className="font-mono text-red-600 font-medium">- {compResult.calculatedHraExemption}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>मानक कटौती (Std. Deduction):</span>
                  <span className="font-mono text-red-600 font-medium">- 50,000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>80C (GPF + SI + अन्य बचत):</span>
                  <span className="font-mono text-red-600 font-medium">- {compResult.old_sec80C_totalAllowed}</span>
                </div>
                {compResult.old_sec24b_homeLoan > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>होम लोन ब्याज धारा 24(b):</span>
                    <span className="font-mono text-red-600 font-medium">- {compResult.old_sec24b_homeLoan}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold border-t border-dashed border-slate-200 pt-1.5">
                  <span>कर योग्य आय (Taxable Income):</span>
                  <span className="font-mono text-amber-900">{compResult.old_taxableIncome}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>परिकलित आयकर (Tax before Rebate):</span>
                  <span className="font-mono">{compResult.old_taxBeforeRebate}</span>
                </div>
                {compResult.old_rebate87A > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>धारा 87A छूट (Rebate u/s 87A):</span>
                    <span className="font-mono">- {compResult.old_rebate87A}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>उपकर (Health & Edu Cess 4%):</span>
                  <span className="font-mono">{compResult.old_cess}</span>
                </div>

                <div className="flex justify-between items-center text-slate-900 font-extrabold text-base border-t-2 border-slate-300 pt-2.5">
                  <span>कुल देय आयकर:</span>
                  <span className="font-mono text-xl text-amber-900">
                    ₹{compResult.old_totalTaxPayable}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('ddoStatement')}
                className="w-full mt-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                DDO आयकर प्रपत्र (Old Regime) देखें ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
