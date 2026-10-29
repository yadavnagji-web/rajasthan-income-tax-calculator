import { useState, useMemo } from 'react';
import type { 
  EmployeeProfile, 
  MonthlyPayRecord, 
  TaxDeductionsOld 
} from './types/taxTypes';
import { computeTaxComparison } from './types/taxTypes';
import { FINANCIAL_MONTHS, getRajasthanGpfMonthly, getRajasthanSiSlab, getRajasthanRghsMonthly } from './data/rajasthanPayData';
import { CalculatorView } from './components/CalculatorView';
import { Ga55LedgerView } from './components/Ga55LedgerView';
import { DdoTaxStatementView } from './components/DdoTaxStatementView';
import { TaxRulesView } from './components/TaxRulesView';
import { Calculator, FileSpreadsheet, FileText, BookOpen, Share2, RotateCcw, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'ga55' | 'ddoStatement' | 'rules'>('calculator');

  // Employee Profile initialized with Rajasthan defaults
  const [profile, setProfile] = useState<EmployeeProfile>({
    empName: 'Nagji Yadav',
    designation: 'TEACHER',
    schoolName: 'Govt.Praveshika Sanskrit School kunwa',
    panNumber: 'AHHPY4147Q',
    pranNumber: '1100XXXXXXXX',
    siNumber: 'RJ-SI-XXXXXX',
    ddoName: 'JEEVRAJ PARMAR',
    officeTan: 'JDHG20338D',
    bankAccount: '15000100003153',
    mobileNo: '9982151938',
    payLevel: 'L-11',
    currentBasic: 47900,
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    cityCategory: 'Z',
    currentHraRate: 9,
    isSeniorCitizen: false,
    isDivyangSelf: false,
    divyangSeveritySelf: '40to79',
    hasDivyangDependent: false,
    divyangSeverityDependent: '40to79'
  });

  // Old Regime Deductions
  const [deductionsOld, setDeductionsOld] = useState<TaxDeductionsOld>({
    actualRentPaid12M: 53000,
    hraExemptionClaimed: 0,
    sec16ii_Entertainment: 0,
    sec16iii_ProfessionalTax: 0,
    incomeFromHouseProperty: 0,
    sec24b_HomeLoanInterest: 200000,
    municipalTaxPaid: 0,
    bankSavingInterest: 0,
    fdOtherInterest: 0,
    otherIncomeSources: 0,
    sec80C_LicPli: 0,
    sec80C_PpfSsy: 0,
    sec80C_TuitionFee: 0,
    sec80C_HomeLoanPrincipal: 50000,
    sec80C_NscElssFd: 0,
    sec80C_OtherItems: 0,
    sec80CCD1_GovtPensionEmp: 0,
    sec80CCD2_EmployerNPS: 0,
    sec80CCD1B_NpsAdditional: 0,
    sec80CCC_PensionPlan: 0,
    sec80D_MediclaimSelf: 0,
    sec80D_MediclaimParents: 0,
    sec80D_ParentsSenior: false,
    sec80DDB_MedicalTreatment: 0,
    sec80E_EduLoanInterest: 0,
    sec80G_Donations: 0,
    sec80GGC_PoliticalDonation: 0,
    sec80TTA_InterestRebate: 0,
    sec80TTB_SeniorInterestRebate: 0,
    sec89_ReliefArrears: 0,
    otherDeductionsChapVIA: 0
  });

  // Reset Records Helper
  const generateInitialRecords = (basic: number) => {
    const defaultSi = 5000;
    const defaultRghs = getRajasthanRghsMonthly(basic);
    const defaultGpf = 2850;
    const hraPercent = 9;

    return FINANCIAL_MONTHS.map((m, idx) => {
      // Step increment in July if teacher (from 47900 to 49300)
      const curBasic = idx >= 4 ? 49300 : basic;
      const daAmount = Math.round((curBasic * m.daPercent) / 100);
      const hraAmount = Math.round((curBasic * (idx >= 8 ? 10 : hraPercent)) / 100);
      const gis = m.key === 'apr' ? 700 : 0;
      const bonus = m.key === 'oct' ? 6774 : 0;
      const daArrear = m.key === 'oct' ? 5916 : 0;
      const gross = curBasic + daAmount + hraAmount + bonus + daArrear;
      const gpfTotal = defaultGpf + (m.key === 'oct' ? 5916 + 1694 : 0);
      const siTotal = idx >= 7 ? 10000 : defaultSi;
      const totalDed = gpfTotal + siTotal + defaultRghs + gis;

      return {
        monthName: m.name,
        monthKey: m.key,
        basicPay: curBasic,
        daRate: m.daPercent,
        daAmount,
        hraRate: idx >= 8 ? 10 : hraPercent,
        hraAmount,
        splPay: 0,
        ccaAmount: 0,
        daArrear,
        bonus,
        plSurrender: 0,
        otherAllowances: 0,
        grossSalary: gross,
        gpfAmount: gpfTotal,
        gpfLoan: 0,
        siAmount: siTotal,
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
  };

  const [records, setRecords] = useState<MonthlyPayRecord[]>(() => generateInitialRecords(47900));

  // Handler for manual cell edits in GA-55
  const handleUpdateRecord = (index: number, field: keyof MonthlyPayRecord, value: number) => {
    setRecords(prev => {
      const updated = [...prev];
      const r = { ...updated[index], [field]: value };
      
      // Auto re-compute gross and deductions
      const gross = (r.basicPay || 0) + (r.daAmount || 0) + (r.hraAmount || 0) + (r.splPay || 0) + (r.ccaAmount || 0) + (r.bonus || 0) + (r.daArrear || 0) + (r.plSurrender || 0) + (r.otherAllowances || 0);
      const totalDed = (r.gpfAmount || 0) + (r.gpfLoan || 0) + (r.siAmount || 0) + (r.siLoan || 0) + (r.rghsAmount || 0) + (r.gisAmount || 0) + (r.licSalary || 0) + (r.itTdsAmount || 0) + (r.hitkariNidhi || 0) + (r.otherDeductions || 0);
      
      r.grossSalary = gross;
      r.totalDeductions = totalDed;
      r.netPayable = gross - totalDed;
      
      updated[index] = r;
      return updated;
    });
  };

  const handleResetRecords = () => {
    setRecords(generateInitialRecords(profile.currentBasic));
  };

  // Annual Totals from records
  const totalBasic12M = useMemo(() => records.reduce((s, r) => s + (r.basicPay || 0), 0), [records]);
  const totalDA12M = useMemo(() => records.reduce((s, r) => s + (r.daAmount || 0), 0), [records]);
  const totalHRA12M = useMemo(() => records.reduce((s, r) => s + (r.hraAmount || 0), 0), [records]);
  const annualGross = useMemo(() => records.reduce((s, r) => s + (r.grossSalary || 0), 0), [records]);
  const annualGpf = useMemo(() => records.reduce((s, r) => s + (r.gpfAmount || 0), 0), [records]);
  const annualSi = useMemo(() => records.reduce((s, r) => s + (r.siAmount || 0), 0), [records]);
  const annualRghs = useMemo(() => records.reduce((s, r) => s + (r.rghsAmount || 0), 0), [records]);

  // Comparison Results
  const compResult = useMemo(() => {
    return computeTaxComparison(
      totalBasic12M,
      totalDA12M,
      totalHRA12M,
      annualGross,
      profile,
      deductionsOld,
      annualGpf,
      annualSi,
      annualRghs
    );
  }, [totalBasic12M, totalDA12M, totalHRA12M, annualGross, profile, deductionsOld, annualGpf, annualSi, annualRghs]);

  const handleResetForm = () => {
    if (window.confirm('क्या आप फॉर्म रीसेट करके नया हिसाब लगाना चाहते हैं?')) {
      window.location.reload();
    }
  };

  const handleShareWhatsApp = () => {
    const text = `📊 *राजस्थान कार्मिक इनकम टैक्स कैलकुलेटर 2024-25 (New vs Old Regime)*\nसकल आय: ₹${compResult.grossTotalIncome.toLocaleString('en-IN')}\n✨ New Regime Tax: ₹${compResult.new_totalTaxPayable.toLocaleString('en-IN')}\n📜 Old Regime Tax: ₹${compResult.old_totalTaxPayable.toLocaleString('en-IN')}\n💡 अनुशंसा: ${compResult.savingSuggestion}\n\n👉 अभी अपना टैक्स जांचें: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Application Navbar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm md:text-base tracking-tight text-white">
                  राजस्थान कार्मिक आयकर कैलकुलेटर (FY 2024-25)
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  100% PayManager GA-55 मानक
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                1 Page A4 GA-55 • 1 Page A4 DDO आयकर प्रपत्र • आवश्यक दस्तावेज चेकलिस्ट
              </p>
            </div>
          </div>

          {/* Quick Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              title="व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>शेयर</span>
            </button>
            <button
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all border border-slate-700"
              title="फॉर्म रीसेट करें"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>रीसेट</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-800/80 border-t border-slate-700/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex overflow-x-auto gap-2 py-2 text-xs md:text-sm font-bold scrollbar-none">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>1. टैक्स गणना व दस्तावेज चेकलिस्ट</span>
            </button>

            <button
              onClick={() => setActiveTab('ga55')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ga55'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>2. GA-55 सैलरी लेजर (A4 Page 1)</span>
            </button>

            <button
              onClick={() => setActiveTab('ddoStatement')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ddoStatement'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. DDO आयकर प्रपत्र (A4 Page 2)</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>4. आयकर धाराएं व नियम निर्देशिका (80U, 80D, 80C)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex-1">
        {activeTab === 'calculator' && (
          <CalculatorView
            profile={profile}
            setProfile={setProfile}
            records={records}
            setRecords={setRecords}
            deductionsOld={deductionsOld}
            setDeductionsOld={setDeductionsOld}
            compResult={compResult}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'ga55' && (
          <Ga55LedgerView
            profile={profile}
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onResetRecords={handleResetRecords}
          />
        )}

        {activeTab === 'ddoStatement' && (
          <DdoTaxStatementView
            profile={profile}
            compResult={compResult}
            deductionsOld={deductionsOld}
            totalBasic12M={totalBasic12M}
            totalDA12M={totalDA12M}
            totalHRA12M={totalHRA12M}
          />
        )}

        {activeTab === 'rules' && (
          <TaxRulesView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-5 mt-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-white font-bold">राजस्थान शिक्षक व कर्मचारी आयकर डिजिटल उपयोगिता</p>
              <p className="text-slate-500 text-[11px]">100% ऑफ़लाइन क्लाइंट-साइड सुरक्षा • आपका कोई भी वित्तीय डेटा सर्वर पर स्टोर नहीं होता</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <a href="https://creativeteachers.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 underline">
              creativeteachers.in
            </a>
            <a href="https://paymanager.raj.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
              PayManager GoR
            </a>
            <a href="https://incometax.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
              Income Tax India
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
