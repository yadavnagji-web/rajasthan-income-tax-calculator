import { useState, useMemo } from 'react';
import type { 
  EmployeeProfile, 
  MonthlyPayRecord, 
  TaxDeductionsOld 
} from './types/taxTypes';
import { computeTaxComparison } from './types/taxTypes';
import { 
  DEFAULT_EXCEL_PROFILE, 
  DEFAULT_EXCEL_DEDUCTIONS, 
  DEFAULT_EXCEL_RECORDS,
  BLANK_PROFILE,
  BLANK_DEDUCTIONS
} from './data/defaultExcelData';
import { 
  getRajasthanGpfMonthly, 
  getRajasthanSiSlab, 
  getRajasthanRghsMonthly, 
  generateRajasthanGa55Records,
  SUPPORTED_FINANCIAL_YEARS 
} from './data/rajasthanPayData';
import { MasterDataView } from './components/MasterDataView';
import { OtherDeductionSheetView } from './components/OtherDeductionSheetView';
import { Ga55LedgerView } from './components/Ga55LedgerView';
import { DdoTaxStatementView } from './components/DdoTaxStatementView';
import { TaxRulesView } from './components/TaxRulesView';
import { DocumentsChecklistBox } from './components/DocumentsChecklistBox';
import { TaxSavingTipsView } from './components/TaxSavingTipsView';
import { Calculator, FileSpreadsheet, FileText, BookOpen, Share2, RotateCcw, ShieldCheck, Database, ListPlus, CheckSquare, Lightbulb, Sparkles } from 'lucide-react';

type TabKey = 'master' | 'otherDeduction' | 'ga55' | 'taxOld' | 'taxNew' | 'tips' | 'checklist' | 'rules';

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('master');

  // Master Profile
  const [profile, setProfile] = useState<EmployeeProfile>(DEFAULT_EXCEL_PROFILE);

  // Other Deductions Sheet
  const [deductionsOld, setDeductionsOld] = useState<TaxDeductionsOld>(DEFAULT_EXCEL_DEDUCTIONS);

  // Monthly Records for GA-55
  const [records, setRecords] = useState<MonthlyPayRecord[]>(DEFAULT_EXCEL_RECORDS);

  // Master Sheet Specific Variables
  const [gisAmount, setGisAmount] = useState<number>(700);
  const [siMonthly, setSiMonthly] = useState<number>(5000);

  // Re-generate records when master data is applied (Rajasthan 7th CPC standards)
  const handleApplyMasterData = () => {
    const newRecords = generateRajasthanGa55Records(profile, gisAmount, siMonthly);
    setRecords(newRecords);
  };

  // Handler for manual cell edits in GA-55 (Supports both number & string month name)
  const handleUpdateRecord = (index: number, field: keyof MonthlyPayRecord, value: number | string) => {
    setRecords(prev => {
      const updated = [...prev];
      if (field === 'monthName') {
        updated[index] = { ...updated[index], monthName: String(value) };
        return updated;
      }
      const numVal = Number(value) || 0;
      const r = { ...updated[index], [field]: numVal };
      
      const gross = (r.basicPay || 0) + (r.daAmount || 0) + (r.hraAmount || 0) + (r.splPay || 0) + (r.ccaAmount || 0) + (r.bonus || 0) + (r.daArrear || 0) + (r.plSurrender || 0) + (r.otherAllowances || 0);
      const totalDed = (r.gpfAmount || 0) + (r.gpfLoan || 0) + (r.siAmount || 0) + (r.siLoan || 0) + (r.rghsAmount || 0) + (r.gisAmount || 0) + (r.licSalary || 0) + (r.itTdsAmount || 0) + (r.hitkariNidhi || 0) + (r.otherDeductions || 0);
      
      r.grossSalary = gross;
      r.totalDeductions = totalDed;
      r.netPayable = gross - totalDed;
      
      updated[index] = r;
      return updated;
    });
  };

  // Reset to 100% Blank Production State
  const handleResetRecords = () => {
    setProfile(BLANK_PROFILE);
    setDeductionsOld(BLANK_DEDUCTIONS);
    setGisAmount(0);
    setSiMonthly(0);
    setRecords(generateRajasthanGa55Records(BLANK_PROFILE, 0, 0));
  };

  // Live active documents counter for Checklist
  const activeDocsCount = useMemo(() => {
    let count = 1; // GA-55 statement always
    if (deductionsOld.sec80C_TuitionFee && deductionsOld.sec80C_TuitionFee > 0) count++;
    if (deductionsOld.actualRentPaid12M && deductionsOld.actualRentPaid12M > 0) count++;
    if ((deductionsOld.sec24b_HomeLoanInterest && deductionsOld.sec24b_HomeLoanInterest > 0) || 
        (deductionsOld.sec80C_HomeLoanPrincipal && deductionsOld.sec80C_HomeLoanPrincipal > 0)) count++;
    if (deductionsOld.sec80C_LicPli && deductionsOld.sec80C_LicPli > 0) count++;
    if (deductionsOld.sec80C_PpfSsy && deductionsOld.sec80C_PpfSsy > 0) count++;
    if (deductionsOld.sec80C_NscElssFd && deductionsOld.sec80C_NscElssFd > 0) count++;
    if (deductionsOld.sec80CCD1B_NpsAdditional && deductionsOld.sec80CCD1B_NpsAdditional > 0) count++;
    if (profile.isDivyangSelf) count++;
    if (profile.hasDivyangDependent) count++;
    if ((deductionsOld.sec80D_MediclaimSelf && deductionsOld.sec80D_MediclaimSelf > 0) || 
        (deductionsOld.sec80D_MediclaimParents && deductionsOld.sec80D_MediclaimParents > 0)) count++;
    if (deductionsOld.sec80E_EduLoanInterest && deductionsOld.sec80E_EduLoanInterest > 0) count++;
    if (deductionsOld.sec80G_Donations && deductionsOld.sec80G_Donations > 0) count++;
    if (deductionsOld.sec89_ReliefArrears && deductionsOld.sec89_ReliefArrears > 0) count++;
    return count;
  }, [deductionsOld, profile]);

  // Annual Totals from records
  const totalBasic12M = useMemo(() => records.reduce((s, r) => s + (r.basicPay || 0), 0), [records]);
  const totalDA12M = useMemo(() => records.reduce((s, r) => s + (r.daAmount || 0), 0), [records]);
  const totalHRA12M = useMemo(() => records.reduce((s, r) => s + (r.hraAmount || 0), 0), [records]);
  const annualGross = useMemo(() => records.reduce((s, r) => s + (r.grossSalary || 0), 0), [records]);
  const annualGpf = useMemo(() => records.reduce((s, r) => s + (r.gpfAmount || 0), 0), [records]);
  const annualSi = useMemo(() => records.reduce((s, r) => s + (r.siAmount || 0), 0), [records]);
  const annualRghs = useMemo(() => records.reduce((s, r) => s + (r.rghsAmount || 0), 0), [records]);

  // Comparison Results (matching Excel exactly)
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
    if (window.confirm('क्या आप फॉर्म रीसेट करके मूल एक्सेल डेटा पर लौटना चाहते हैं?')) {
      handleResetRecords();
    }
  };

  const handleShareWhatsApp = () => {
    const text = `📊 *राजस्थान कार्मिक इनकम टैक्स कैलकुलेटर (Master Excel Format)*\nसकल आय: ₹${compResult.grossTotalIncome.toLocaleString('en-IN')}\n📜 Old Tax: ₹${compResult.old_totalTaxPayable.toLocaleString('en-IN')}\n✨ New Tax: ₹${compResult.new_totalTaxPayable.toLocaleString('en-IN')}\n💡 बचत: Prefer Old Regime (बचत ₹${(compResult.new_totalTaxPayable - compResult.old_totalTaxPayable).toLocaleString('en-IN')})\n\n👉 अभी अपना टैक्स जांचें: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Application Navbar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shadow-md">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm md:text-base tracking-tight text-white">
                  राजस्थान कार्मिक आयकर कैलकुलेटर
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                  FY {profile.financialYear} • AY {profile.assessmentYear}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                मास्टर डेटा • GA-55A लेजर • कटौतियां • DDO गणना प्रपत्र • टैक्स सेविंग गाइड
              </p>
            </div>
          </div>

          {/* Quick Header Buttons & Financial Year Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetRecords}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700 shadow-sm"
              title="फॉर्म पूरी तरह खाली करें"
            >
              <span>🧹</span>
              <span>फॉर्म रीसेट करें</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-300 font-medium">FY:</span>
              <select
                value={profile.financialYear}
                onChange={(e) => {
                  const fy = e.target.value;
                  const sYear = parseInt(fy.split('-')[0], 10) || 2024;
                  const aYear = sYear + 1;
                  const ay = `${aYear}-${String(aYear + 1).slice(-2)}`;
                  const updatedProfile = { ...profile, financialYear: fy, assessmentYear: ay };
                  setProfile(updatedProfile);
                  setRecords(generateRajasthanGa55Records(updatedProfile, gisAmount, siMonthly));
                }}
                className="bg-slate-900 text-amber-300 text-xs font-bold rounded px-2 py-0.5 border border-slate-600 focus:outline-none"
              >
                {SUPPORTED_FINANCIAL_YEARS.map(y => (
                  <option key={y.fy} value={y.fy}>{y.fy}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              title="व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>शेयर</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar (EXACT SEQUENCE REQUESTED BY USER) */}
        <div className="bg-slate-800/90 border-t border-slate-700/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex overflow-x-auto gap-1.5 py-2 text-xs md:text-sm font-bold scrollbar-none">
            {/* 1. Master Data */}
            <button
              onClick={() => setActiveTab('master')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'master'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>1. Master Sheet</span>
            </button>

            {/* 2. Other Deduction Sheet */}
            <button
              onClick={() => setActiveTab('otherDeduction')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'otherDeduction'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ListPlus className="w-4 h-4" />
              <span>2. Other Deduction</span>
            </button>

            {/* 3. GA55A Sheet */}
            <button
              onClick={() => setActiveTab('ga55')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ga55'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>3. GA 55A Sheet</span>
            </button>

            {/* 4. Tax (Old Regime) */}
            <button
              onClick={() => setActiveTab('taxOld')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'taxOld'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>4. Tax (Old Regime)</span>
              <span className="text-[10px] bg-white/20 px-1 rounded font-mono">₹{compResult.old_totalTaxPayable.toLocaleString('en-IN')}</span>
            </button>

            {/* 5. Tax (New Regime) */}
            <button
              onClick={() => setActiveTab('taxNew')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'taxNew'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>5. Tax (New Regime)</span>
              <span className="text-[10px] bg-white/20 px-1 rounded font-mono">₹{compResult.new_totalTaxPayable.toLocaleString('en-IN')}</span>
            </button>

            {/* 6. Tax Saving Tips */}
            <button
              onClick={() => setActiveTab('tips')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'tips'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-amber-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>6. 💡 टैक्स बचत टिप्स</span>
            </button>

            {/* 7. Live Checklist */}
            <button
              onClick={() => setActiveTab('checklist')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'checklist'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>7. आवश्यक रसीदें</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'checklist' ? 'bg-white text-indigo-900' : 'bg-indigo-500/30 text-indigo-300'}`}>
                {activeDocsCount}
              </span>
            </button>

            {/* 8. Rules Directory */}
            <button
              onClick={() => setActiveTab('rules')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-slate-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>8. नियम निर्देशिका</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex-1">
        {activeTab === 'master' && (
          <MasterDataView
            profile={profile}
            setProfile={setProfile}
            deductions={deductionsOld}
            setDeductions={setDeductionsOld}
            gisAmount={gisAmount}
            setGisAmount={setGisAmount}
            siMonthly={siMonthly}
            setSiMonthly={setSiMonthly}
            onApplyMaster={handleApplyMasterData}
            compResult={compResult}
          />
        )}

        {activeTab === 'otherDeduction' && (
          <OtherDeductionSheetView
            profile={profile}
            deductions={deductionsOld}
            setDeductions={setDeductionsOld}
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
            compResult={compResult}
          />
        )}

        {activeTab === 'taxOld' && (
          <DdoTaxStatementView
            profile={profile}
            compResult={compResult}
            deductionsOld={deductionsOld}
            totalBasic12M={totalBasic12M}
            totalDA12M={totalDA12M}
            totalHRA12M={totalHRA12M}
            initialRegime="OLD"
          />
        )}

        {activeTab === 'taxNew' && (
          <DdoTaxStatementView
            profile={profile}
            compResult={compResult}
            deductionsOld={deductionsOld}
            totalBasic12M={totalBasic12M}
            totalDA12M={totalDA12M}
            totalHRA12M={totalHRA12M}
            initialRegime="NEW"
          />
        )}

        {activeTab === 'tips' && (
          <TaxSavingTipsView
            profile={profile}
            deductions={deductionsOld}
            compResult={compResult}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'checklist' && (
          <DocumentsChecklistBox
            profile={profile}
            deductions={deductionsOld}
            compResult={compResult}
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
