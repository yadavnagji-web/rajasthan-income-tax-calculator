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
  DEFAULT_EXCEL_RECORDS 
} from './data/defaultExcelData';
import { getRajasthanGpfMonthly, getRajasthanSiSlab, getRajasthanRghsMonthly, FINANCIAL_MONTHS } from './data/rajasthanPayData';
import { MasterDataView } from './components/MasterDataView';
import { OtherDeductionSheetView } from './components/OtherDeductionSheetView';
import { Ga55LedgerView } from './components/Ga55LedgerView';
import { DdoTaxStatementView } from './components/DdoTaxStatementView';
import { TaxRulesView } from './components/TaxRulesView';
import { DocumentsChecklistBox } from './components/DocumentsChecklistBox';
import { Calculator, FileSpreadsheet, FileText, BookOpen, Share2, RotateCcw, ShieldCheck, Database, ListPlus, CheckSquare } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'master' | 'otherDeduction' | 'ga55' | 'ddoStatement' | 'checklist' | 'rules'>('master');

  // Master Profile
  const [profile, setProfile] = useState<EmployeeProfile>(DEFAULT_EXCEL_PROFILE);

  // Other Deductions Sheet
  const [deductionsOld, setDeductionsOld] = useState<TaxDeductionsOld>(DEFAULT_EXCEL_DEDUCTIONS);

  // Monthly Records for GA-55
  const [records, setRecords] = useState<MonthlyPayRecord[]>(DEFAULT_EXCEL_RECORDS);

  // Master Sheet Specific Variables
  const [gisAmount, setGisAmount] = useState<number>(700);
  const [siMonthly, setSiMonthly] = useState<number>(5000);

  // Re-generate records when master data is applied
  const handleApplyMasterData = () => {
    const basic = profile.currentBasic;
    const defaultRghs = getRajasthanRghsMonthly(basic);
    const defaultGpf = 2850;
    const hraRate = profile.currentHraRate;

    const newRecords: MonthlyPayRecord[] = FINANCIAL_MONTHS.map((m, idx) => {
      const curBasic = idx >= 4 ? (profile.payLevel === 'L-11' ? 49300 : basic) : basic;
      const daAmount = Math.round((curBasic * m.daPercent) / 100);
      const curHraRate = idx >= 8 ? (profile.currentHraRate >= 16 ? 18 : 10) : hraRate;
      const hraAmount = Math.round((curBasic * curHraRate) / 100);
      const gis = m.key === 'apr' ? gisAmount : 0;
      const bonus = m.key === 'oct' ? 6774 : 0;
      const daArrear = m.key === 'oct' ? 5916 : 0;
      const gross = curBasic + daAmount + hraAmount + bonus + daArrear;
      const gpfTotal = defaultGpf + (m.key === 'oct' ? 5916 + 1694 : 0);
      const siTotal = idx >= 7 ? 10000 : siMonthly;
      const totalDed = gpfTotal + siTotal + defaultRghs + gis;

      return {
        monthName: m.name,
        monthKey: m.key,
        basicPay: curBasic,
        daRate: m.daPercent,
        daAmount,
        hraRate: curHraRate,
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

    setRecords(newRecords);
  };

  // Handler for manual cell edits in GA-55
  const handleUpdateRecord = (index: number, field: keyof MonthlyPayRecord, value: number) => {
    setRecords(prev => {
      const updated = [...prev];
      const r = { ...updated[index], [field]: value };
      
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
    setRecords(DEFAULT_EXCEL_RECORDS);
    setProfile(DEFAULT_EXCEL_PROFILE);
    setDeductionsOld(DEFAULT_EXCEL_DEDUCTIONS);
    setGisAmount(700);
    setSiMonthly(5000);
  };

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
                  राजस्थान कार्मिक आयकर कैलकुलेटर (FY 2024-25 / AY 2025-26)
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                  मास्टर एक्सेल शीट हुबहू संस्करण
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Master Data • GA-55A • Other Deductions • Computation Sheet (Old/New) • Live Checklist
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
              title="डिफ़ॉल्ट एक्सेल डेटा पर रीसेट करें"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>रीसेट</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar (EXACT SHEET TABS AS IN USER'S EXCEL) */}
        <div className="bg-slate-800/90 border-t border-slate-700/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex overflow-x-auto gap-1.5 py-2 text-xs md:text-sm font-bold scrollbar-none">
            {/* Sheet 1: Master Data */}
            <button
              onClick={() => setActiveTab('master')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'master'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>1. Master Sheet (मास्टर डेटा)</span>
            </button>

            {/* Sheet 2: GA55A Sheet */}
            <button
              onClick={() => setActiveTab('ga55')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ga55'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>2. GA 55A Sheet (सैलरी लेजर)</span>
            </button>

            {/* Sheet 3: Other Deduction Sheet */}
            <button
              onClick={() => setActiveTab('otherDeduction')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'otherDeduction'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ListPlus className="w-4 h-4" />
              <span>3. Other Deduction Sheet (बिंदु 1-36)</span>
            </button>

            {/* Sheet 4: Computation Sheet (Old/New) */}
            <button
              onClick={() => setActiveTab('ddoStatement')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ddoStatement'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>4. Computation Sheet (Old/New Tax)</span>
            </button>

            {/* Live Checklist */}
            <button
              onClick={() => setActiveTab('checklist')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'checklist'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>5. आवश्यक रसीदें चेकलिस्ट (Live)</span>
            </button>

            {/* Rules Directory */}
            <button
              onClick={() => setActiveTab('rules')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-slate-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>6. नियम निर्देशिका (80U, 80D, 80C)</span>
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

        {activeTab === 'otherDeduction' && (
          <OtherDeductionSheetView
            profile={profile}
            deductions={deductionsOld}
            setDeductions={setDeductionsOld}
            compResult={compResult}
            onNavigateTab={setActiveTab}
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
