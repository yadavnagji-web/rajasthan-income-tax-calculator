import React, { useState } from 'react';
import { 
  EmployeeProfile, 
  MonthlyPayRecord, 
  TaxDeductionsOld, 
  computeTaxComparison,
  TaxComparisonResult
} from '../types/taxTypes';
import { PAY_MATRIX_LEVELS, getRajasthanGpfMonthly, getRajasthanSiSlab, getRajasthanRghsMonthly, FINANCIAL_MONTHS } from '../data/rajasthanPayData';
import { 
  Calculator, 
  Building2, 
  User, 
  Percent, 
  HelpCircle, 
  ArrowRight, 
  TrendingDown, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles,
  ChevronDown,
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
  onSelectRegimeForDDO: (regime: 'NEW' | 'OLD') => void;
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
  onSelectRegimeForDDO,
  onNavigateTab
}) => {
  const [showAdvancedDeductions, setShowAdvancedDeductions] = useState(false);

  // Recalculate full 12 months based on level and basic
  const handleApplyBasicPay = (basic: number, level: string) => {
    const defaultSi = getRajasthanSiSlab(basic).min;
    const defaultRghs = getRajasthanRghsMonthly(basic);
    const defaultGpf = getRajasthanGpfMonthly(basic);
    const hraPercent = profile.cityCategory === 'Y' ? 16 : 8;

    const newRecords: MonthlyPayRecord[] = FINANCIAL_MONTHS.map((m, idx) => {
      // Basic can increment in July for some employees, keep flat by default
      const daAmount = Math.round((basic * m.daPercent) / 100);
      const hraAmount = Math.round((basic * hraPercent) / 100);
      const gis = m.key === 'apr' ? 350 : 0;
      const gross = basic + daAmount + hraAmount;
      const totalDed = defaultGpf + defaultSi + defaultRghs + gis;

      return {
        monthName: m.name,
        monthKey: m.key,
        basicPay: basic,
        daRate: m.daPercent,
        daAmount,
        hraRate: hraPercent,
        hraAmount,
        daArrear: 0,
        bonus: m.key === 'oct' ? 6774 : 0, // Diwali Bonus in October by default
        plSurrender: 0,
        otherAllowances: 0,
        grossSalary: gross + (m.key === 'oct' ? 6774 : 0),
        gpfAmount: defaultGpf,
        siAmount: defaultSi,
        rghsAmount: defaultRghs,
        gisAmount: gis,
        itTdsAmount: 0,
        otherDeductions: 0,
        totalDeductions: totalDed,
        netPayable: (gross + (m.key === 'oct' ? 6774 : 0)) - totalDed
      };
    });

    setRecords(newRecords);
    setProfile(prev => ({ ...prev, currentBasic: basic, payLevel: level }));
  };

  const handleUpdateDeduction = (field: keyof TaxDeductionsOld, val: number) => {
    setDeductionsOld(prev => ({ ...prev, [field]: val }));
  };

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
              सर्वश्रेष्ठ कर विकल्प अनुशंसा (Best Regime Recommendation)
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
              onClick={() => {
                onSelectRegimeForDDO(compResult.betterRegime === 'OLD' ? 'OLD' : 'NEW');
                onNavigateTab('ddoStatement');
              }}
              className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs md:text-sm font-extrabold shadow-md hover:bg-slate-100 transition-all"
            >
              📄 DDO टैक्स प्रपत्र डाउनलोड करें ➔
            </button>
            <button
              onClick={() => onNavigateTab('ga55')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs md:text-sm font-bold backdrop-blur-sm transition-all"
            >
              📑 GA-55 लेजर देखें
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
              1. कर्मचारी एवं विद्यालय विवरण (Office & Employee Info)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">कर्मचारी का नाम:</label>
                <input
                  type="text"
                  value={profile.empName}
                  onChange={(e) => setProfile({ ...profile, empName: e.target.value })}
                  placeholder="उदा. रमेश कुमार यादव"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">पद (Designation):</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  placeholder="उदा. अध्यापक L-10 / वरिष्ठ अध्यापक"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">विद्यालय / कार्यालय का नाम:</label>
                <input
                  type="text"
                  value={profile.schoolName}
                  onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                  placeholder="उदा. राउप्रावि / राउमावि..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">स्थायी खाता संख्या (PAN):</label>
                <input
                  type="text"
                  value={profile.panNumber}
                  onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">PRAN / GPF Number:</label>
                <input
                  type="text"
                  value={profile.pranNumber}
                  onChange={(e) => setProfile({ ...profile, pranNumber: e.target.value })}
                  placeholder="1100XXXXXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">राज्य बीमा पॉलिसी (SI No):</label>
                <input
                  type="text"
                  value={profile.siNumber}
                  onChange={(e) => setProfile({ ...profile, siNumber: e.target.value })}
                  placeholder="RJ-SI-XXXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            {/* City Category and Senior Citizen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs md:text-sm">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block font-medium text-slate-700 mb-1">मकान किराया भत्ता (HRA Class):</label>
                <select
                  value={profile.cityCategory}
                  onChange={(e) => {
                    const cat = e.target.value as 'Y' | 'Z';
                    setProfile({ ...profile, cityCategory: cat });
                    handleApplyBasicPay(profile.currentBasic, profile.payLevel);
                  }}
                  className="w-full p-2 bg-white rounded border border-slate-300 font-medium"
                >
                  <option value="Z">Z-Class (8% HRA - अधिकांश ग्रामीण व सामान्य शहर)</option>
                  <option value="Y">Y-Class (16% HRA - जयपुर, जोधपुर, कोटा, बीकानेर, अजमेर)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">वरिष्ठ नागरिक (Senior Citizen):</span>
                  <span className="text-[11px] text-slate-500">आयु 60 वर्ष या अधिक (Old छूट ₹3 लाख)</span>
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

          {/* Pay Matrix Picker Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-700" />
                2. पे-मैट्रिक्स से मूल वेतन (Basic Pay) चयन
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                7th Pay Commission (Level L-1 से L-16)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">पे मैट्रिक्स लेवल चुनें:</label>
                <select
                  value={profile.payLevel}
                  onChange={(e) => {
                    const newLvl = e.target.value;
                    const firstBasic = PAY_MATRIX_LEVELS[newLvl]?.[0] || 33800;
                    handleApplyBasicPay(firstBasic, newLvl);
                  }}
                  className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-300 font-bold text-slate-800"
                >
                  {Object.keys(PAY_MATRIX_LEVELS).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl} {lvl === 'L-10' ? '(IIIrd Grade Teacher)' : lvl === 'L-11' ? '(IInd Grade Teacher)' : lvl === 'L-12' ? '(Lecturer)' : lvl === 'L-14' ? '(Principal)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">वर्तमान मूल वेतन (Basic Pay):</label>
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
              <span className="text-emerald-700">स्वतः DA, HRA, SI, GPF व RGHS सेट हो गया है</span>
            </div>
          </div>

          {/* Disability Section 80U & 80DD Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <span className="text-base">♿</span>
                3. दिव्यांग कार्मिक एवं आश्रित छूट (Section 80U & 80DD)
              </h3>
              <button
                onClick={() => onNavigateTab('rules')}
                className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
              >
                <Info className="w-3.5 h-3.5" />
                नियम देखें
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              {/* 80U Divyang Self */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 block">धारा 80U: स्वयं दिव्यांग सरकारी कर्मचारी (Self Divyang)</strong>
                    <span className="text-slate-500 text-[11px]">40% या अधिक दिव्यांगता पर सीधी फ्लैट छूट</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.isDivyangSelf}
                    onChange={(e) => setProfile({ ...profile, isDivyangSelf: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded"
                  />
                </div>

                {profile.isDivyangSelf && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 items-center">
                    <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="divyangSelf"
                        checked={profile.divyangSeveritySelf === '40to79'}
                        onChange={() => setProfile({ ...profile, divyangSeveritySelf: '40to79' })}
                        className="accent-emerald-600"
                      />
                      <span>40% से 79% दिव्यांगता (छूट: <strong>₹75,000</strong>)</span>
                    </label>

                    <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="divyangSelf"
                        checked={profile.divyangSeveritySelf === '80plus'}
                        onChange={() => setProfile({ ...profile, divyangSeveritySelf: '80plus' })}
                        className="accent-emerald-600"
                      />
                      <span>80% या अधिक गंभीर दिव्यांगता (छूट: <strong>₹1,25,000</strong>)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 80DD Divyang Dependent */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 block">धारा 80DD: आश्रित दिव्यांग परिजन (Dependent Relative)</strong>
                    <span className="text-slate-500 text-[11px]">आश्रित माता-पिता, पति/पत्नी, बच्चे के इलाज व देखरेख हेतु</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.hasDivyangDependent}
                    onChange={(e) => setProfile({ ...profile, hasDivyangDependent: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded"
                  />
                </div>

                {profile.hasDivyangDependent && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 items-center">
                    <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="divyangDep"
                        checked={profile.divyangSeverityDependent === '40to79'}
                        onChange={() => setProfile({ ...profile, divyangSeverityDependent: '40to79' })}
                        className="accent-emerald-600"
                      />
                      <span>40% से 79% (छूट: <strong>₹75,000</strong>)</span>
                    </label>

                    <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="divyangDep"
                        checked={profile.divyangSeverityDependent === '80plus'}
                        onChange={() => setProfile({ ...profile, divyangSeverityDependent: '80plus' })}
                        className="accent-emerald-600"
                      />
                      <span>80% या अधिक गंभीर (छूट: <strong>₹1,25,000</strong>)</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deductions Inputs (80C, 80D, Home Loan) */}
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
                <label className="block text-slate-600 mb-1 font-medium">80C: LIC / PLI डाक जीवन बीमा:</label>
                <input
                  type="number"
                  value={deductionsOld.sec80C_LicPli || ''}
                  onChange={(e) => handleUpdateDeduction('sec80C_LicPli', Number(e.target.value))}
                  placeholder="वार्षिक प्रीमियम ₹"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

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
                <label className="block text-slate-600 mb-1 font-medium">80C: होम लोन मूलधन (Principal Repay):</label>
                <input
                  type="number"
                  value={deductionsOld.sec80C_HomeLoanPrincipal || ''}
                  onChange={(e) => handleUpdateDeduction('sec80C_HomeLoanPrincipal', Number(e.target.value))}
                  placeholder="वार्षिक मूलधन ₹"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
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
                  <label className="block text-slate-600 mb-1 font-medium">80D: माता-पिता का मेडिक्लेम प्रीमियम:</label>
                  <input
                    type="number"
                    value={deductionsOld.sec80D_MediclaimParents || ''}
                    onChange={(e) => handleUpdateDeduction('sec80D_MediclaimParents', Number(e.target.value))}
                    placeholder="अधिकतम ₹25k / ₹50k"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">80E: उच्च शिक्षा ऋण का ब्याज (Edu Loan):</label>
                  <input
                    type="number"
                    value={deductionsOld.sec80E_EduLoanInterest || ''}
                    onChange={(e) => handleUpdateDeduction('sec80E_EduLoanInterest', Number(e.target.value))}
                    placeholder="असीमित छूट"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">80G: मुख्यमंत्री/प्रधानमंत्री राहत कोष दान:</label>
                  <input
                    type="number"
                    value={deductionsOld.sec80G_Donations || ''}
                    onChange={(e) => handleUpdateDeduction('sec80G_Donations', Number(e.target.value))}
                    placeholder="100% अथवा 50% छूट"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Comparative Tax Slabs Summary Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Comparison Cards: New vs Old */}
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
                  <span>सकल आय (Gross Salary):</span>
                  <span className="font-mono font-medium">₹{compResult.grossTotalIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>मानक कटौती (Std. Deduction):</span>
                  <span className="font-mono text-red-600 font-medium">- ₹75,000</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-dashed border-slate-200 pt-1.5">
                  <span>कर योग्य आय (Taxable Income):</span>
                  <span className="font-mono text-emerald-800">₹{compResult.new_taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>परिकलित आयकर (Tax before Rebate):</span>
                  <span className="font-mono">₹{compResult.new_taxBeforeRebate.toLocaleString('en-IN')}</span>
                </div>
                {compResult.new_rebate87A > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>धारा 87A पूर्ण छूट (Rebate):</span>
                    <span className="font-mono">- ₹{compResult.new_rebate87A.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>उपकर (Health & Edu Cess 4%):</span>
                  <span className="font-mono">₹{compResult.new_cess.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-900 font-extrabold text-base border-t-2 border-slate-300 pt-2.5">
                  <span>कुल देय आयकर:</span>
                  <span className="font-mono text-xl text-emerald-800">
                    ₹{compResult.new_totalTaxPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectRegimeForDDO('NEW');
                  onNavigateTab('ddoStatement');
                }}
                className="w-full mt-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                यह न्यू रिजीम चुनें व DDO प्रपत्र देखें ➔
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
                  <span>सकल आय (Gross Salary):</span>
                  <span className="font-mono font-medium">₹{compResult.grossTotalIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>मानक कटौती (Std. Deduction):</span>
                  <span className="font-mono text-red-600 font-medium">- ₹50,000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>80C (GPF + SI + अन्य बचत):</span>
                  <span className="font-mono text-red-600 font-medium">- ₹{compResult.old_sec80C_totalAllowed.toLocaleString('en-IN')}</span>
                </div>
                {(compResult.old_sec80CCD1B + compResult.old_sec80D + compResult.old_sec24b_homeLoan + compResult.old_sec80U_divyang + compResult.old_sec80DD_dependent) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>अन्य कटौतियां (80CCD, 80D, 80U, Home Loan):</span>
                    <span className="font-mono text-red-600 font-medium">
                      - ₹{(compResult.old_totalDeductions - 50000 - compResult.old_sec80C_totalAllowed).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold border-t border-dashed border-slate-200 pt-1.5">
                  <span>कर योग्य आय (Taxable Income):</span>
                  <span className="font-mono text-amber-900">₹{compResult.old_taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>परिकलित आयकर (Tax before Rebate):</span>
                  <span className="font-mono">₹{compResult.old_taxBeforeRebate.toLocaleString('en-IN')}</span>
                </div>
                {compResult.old_rebate87A > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>धारा 87A छूट (Rebate u/s 87A):</span>
                    <span className="font-mono">- ₹{compResult.old_rebate87A.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>उपकर (Health & Edu Cess 4%):</span>
                  <span className="font-mono">₹{compResult.old_cess.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-900 font-extrabold text-base border-t-2 border-slate-300 pt-2.5">
                  <span>कुल देय आयकर:</span>
                  <span className="font-mono text-xl text-amber-900">
                    ₹{compResult.old_totalTaxPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectRegimeForDDO('OLD');
                  onNavigateTab('ddoStatement');
                }}
                className="w-full mt-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                यह ओल्ड रिजीम चुनें व DDO प्रपत्र देखें ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
