import React, { useState, useMemo } from 'react';
import { 
  EmployeeProfile, 
  MonthlyPayRecord, 
  TaxDeductionsOld, 
  computeTaxComparison 
} from './types/taxTypes';
import { FINANCIAL_MONTHS, getRajasthanGpfMonthly, getRajasthanSiSlab, getRajasthanRghsMonthly } from './data/rajasthanPayData';
import { CalculatorView } from './components/CalculatorView';
import { Ga55LedgerView } from './components/Ga55LedgerView';
import { DdoTaxStatementView } from './components/DdoTaxStatementView';
import { TaxRulesView } from './components/TaxRulesView';
import { Calculator, FileSpreadsheet, FileText, BookOpen, Share2, Printer, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'ga55' | 'ddoStatement' | 'rules'>('calculator');
  const [selectedRegimeForDDO, setSelectedRegimeForDDO] = useState<'NEW' | 'OLD'>('NEW');

  // Employee Profile
  const [profile, setProfile] = useState<EmployeeProfile>({
    empName: '',
    designation: 'तृतीय श्रेणी अध्यापक (Level 10)',
    schoolName: 'राजकीय उच्च प्राथमिक विद्यालय',
    panNumber: '',
    pranNumber: '',
    siNumber: '',
    ddoName: 'प्रधानाचार्य / संस्था प्रधान',
    officeTan: '',
    payLevel: 'L-10',
    currentBasic: 38000,
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    cityCategory: 'Z',
    isSeniorCitizen: false,
    isDivyangSelf: false,
    divyangSeveritySelf: '40to79',
    hasDivyangDependent: false,
    divyangSeverityDependent: '40to79'
  });

  // Old Regime Deductions
  const [deductionsOld, setDeductionsOld] = useState<TaxDeductionsOld>({
    sec80C_LicPli: 0,
    sec80C_PpfSsy: 0,
    sec80C_TuitionFee: 0,
    sec80C_HomeLoanPrincipal: 0,
    sec80C_NscElssFd: 0,
    sec80CCD1B_NpsAdditional: 0,
    sec80D_MediclaimSelf: 0,
    sec80D_MediclaimParents: 0,
    sec80D_ParentsSenior: false,
    sec24b_HomeLoanInterest: 0,
    sec80E_EduLoanInterest: 0,
    sec80G_Donations: 0,
    sec80DDB_MedicalTreatment: 0,
    otherDeductionsChapVIA: 0
  });

  // Initial Monthly Pay Records setup
  const [records, setRecords] = useState<MonthlyPayRecord[]>(() => {
    const basic = 38000;
    const defaultSi = getRajasthanSiSlab(basic).min;
    const defaultRghs = getRajasthanRghsMonthly(basic);
    const defaultGpf = getRajasthanGpfMonthly(basic);
    const hraPercent = 8; // Z-class default

    return FINANCIAL_MONTHS.map((m) => {
      const daAmount = Math.round((basic * m.daPercent) / 100);
      const hraAmount = Math.round((basic * hraPercent) / 100);
      const gis = m.key === 'apr' ? 350 : 0;
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
        daArrear: 0,
        bonus,
        plSurrender: 0,
        otherAllowances: 0,
        grossSalary: gross,
        gpfAmount: defaultGpf,
        siAmount: defaultSi,
        rghsAmount: defaultRghs,
        gisAmount: gis,
        itTdsAmount: 0,
        otherDeductions: 0,
        totalDeductions: totalDed,
        netPayable: gross - totalDed
      };
    });
  });

  // Annual Totals from records
  const annualGross = useMemo(() => records.reduce((s, r) => s + r.grossSalary, 0), [records]);
  const annualGpf = useMemo(() => records.reduce((s, r) => s + r.gpfAmount, 0), [records]);
  const annualSi = useMemo(() => records.reduce((s, r) => s + r.siAmount, 0), [records]);
  const annualRghs = useMemo(() => records.reduce((s, r) => s + r.rghsAmount, 0), [records]);

  // Comparison Results
  const compResult = useMemo(() => {
    return computeTaxComparison(
      annualGross,
      profile,
      deductionsOld,
      annualGpf,
      annualSi,
      annualRghs
    );
  }, [annualGross, profile, deductionsOld, annualGpf, annualSi, annualRghs]);

  const handleResetForm = () => {
    if (window.confirm('क्या आप फॉर्म रीसेट करके नया हिसाब लगाना चाहते हैं?')) {
      window.location.reload();
    }
  };

  const handleShareWhatsApp = () => {
    const text = `📊 *राजस्थान कार्मिक इनकम टैक्स कैलकुलेटर (New vs Old Regime)*\nसकल आय: ₹${compResult.grossTotalIncome.toLocaleString('en-IN')}\n✨ New Regime Tax: ₹${compResult.new_totalTaxPayable.toLocaleString('en-IN')}\n📜 Old Regime Tax: ₹${compResult.old_totalTaxPayable.toLocaleString('en-IN')}\n💡 अनुशंसा: ${compResult.savingSuggestion}\n\n👉 अभी अपना टैक्स जांचें: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Application Navbar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white">
                  राजस्थान कार्मिक इनकम टैक्स कैलकुलेटर
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  New vs Old (100% Accurate)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                पे-मैनेजर GA-55 लेजर • DDO प्रपत्र Form 16 • धारा अनुसार आयकर छूट नियम (80U, 80D, 80C)
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>टैक्स कैलकुलेटर (New vs Old)</span>
            </button>

            <button
              onClick={() => setActiveTab('ga55')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ga55'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>GA-55 सैलरी लेजर</span>
            </button>

            <button
              onClick={() => setActiveTab('ddoStatement')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ddoStatement'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>DDO आयकर प्रपत्र (Form 16)</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📖 आयकर धाराएं व छूट नियम (80U, 80D, 80C)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeTab === 'calculator' && (
          <CalculatorView
            profile={profile}
            setProfile={setProfile}
            records={records}
            setRecords={setRecords}
            deductionsOld={deductionsOld}
            setDeductionsOld={setDeductionsOld}
            compResult={compResult}
            onSelectRegimeForDDO={setSelectedRegimeForDDO}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'ga55' && (
          <Ga55LedgerView
            profile={profile}
            records={records}
          />
        )}

        {activeTab === 'ddoStatement' && (
          <DdoTaxStatementView
            profile={profile}
            compResult={compResult}
            deductionsOld={deductionsOld}
            selectedRegimeForDDO={selectedRegimeForDDO}
          />
        )}

        {activeTab === 'rules' && (
          <TaxRulesView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-white font-bold">राजस्थान शिक्षक व कर्मचारी आयकर डिजिटल पोर्टल</p>
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
