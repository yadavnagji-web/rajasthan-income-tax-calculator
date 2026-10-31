import { useState, useEffect } from 'react';
import { EmployeeProfile, MonthlyPayRecord, CustomColumn } from './types/taxTypes';
import { emptyEmployeeProfile, generateEmptyRecords } from './data/sampleGa55Data';
import { Ga55UploadCard } from './components/Ga55UploadCard';
import { Ga55LedgerView } from './components/Ga55LedgerView';
import { Form16PartBView } from './components/Form16PartBView';
import { TdsPlannerView } from './components/TdsPlannerView';
import { MasterProfileView } from './components/MasterProfileView';

type TabKey = 'ga55' | 'form16' | 'tdsPlanner' | 'master';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('ga55');
  // Starts in 100% BLANK state on load. Populated ONLY when user uploads GA-55 PDF or manually edits.
  const [profile, setProfile] = useState<EmployeeProfile>(emptyEmployeeProfile);
  const [records, setRecords] = useState<MonthlyPayRecord[]>([]);
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor full screen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // In-website Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // When GA-55 PDF is uploaded
  const handleGa55DataLoaded = (
    newProfile: Partial<EmployeeProfile>,
    newRecords: MonthlyPayRecord[],
    meta?: any
  ) => {
    setProfile(prev => ({
      ...prev,
      ...newProfile,
      currentHraRate: meta?.hraPercent || prev.currentHraRate
    }));
    setRecords(newRecords);
  };

  // Reset to initial clean empty state
  const handleResetAll = () => {
    setProfile(emptyEmployeeProfile);
    setRecords([]);
    setCustomColumns([]);
  };

  // Initialize empty month rows for manual entry
  const handleInitBlankRows = () => {
    if (records.length === 0) {
      setRecords(generateEmptyRecords());
    }
  };

  // Add custom column (Allowance or Deduction)
  const handleAddCustomColumn = (col: CustomColumn) => {
    setCustomColumns(prev => [...prev, col]);
  };

  // Remove custom column
  const handleRemoveCustomColumn = (columnId: string) => {
    setCustomColumns(prev => prev.filter(c => c.id !== columnId));
    setRecords(prev => prev.map(r => {
      if (!r.customFields) return r;
      const nextFields = { ...r.customFields };
      delete nextFields[columnId];
      return { ...r, customFields: nextFields };
    }));
  };

  // Add custom row (e.g. Arrear, Bonus, or additional bill)
  const handleAddRow = () => {
    setRecords(prev => {
      const newIdx = prev.length + 1;
      const newRow: MonthlyPayRecord = {
        monthKey: `custom_row_${Date.now()}`,
        monthName: `बिल #${newIdx}`,
        billType: 'Regular',
        basicPay: 0,
        daAmount: 0,
        hraAmount: 0,
        splPay: 0,
        ccaAmount: 0,
        bonus: 0,
        daArrear: 0,
        plSurrender: 0,
        otherAllowances: 0,
        grossSalary: 0,
        gpfAmount: 0,
        gpfLoan: 0,
        siAmount: 0,
        siLoan: 0,
        rghsAmount: 0,
        gisAmount: 0,
        licSalary: 0,
        pliAmount: 0,
        itTdsAmount: 0,
        hitkariNidhi: 0,
        otherDeductions: 0,
        totalDeductions: 0,
        netPayable: 0,
        billNo: '',
        tvNo: '-'
      };
      return [...prev, newRow];
    });
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    setRecords(prev => prev.filter((_, idx) => idx !== index));
  };

  // Handle cell edit in GA-55 or TDS Planner
  const handleUpdateRecord = (index: number, field: keyof MonthlyPayRecord | string, value: any) => {
    setRecords(prev => {
      const updated = [...prev];
      const r = { ...updated[index] };

      if (typeof field === 'string' && field.startsWith('custom_')) {
        r.customFields = {
          ...(r.customFields || {}),
          [field]: Number(value) || 0
        };
      } else {
        (r as any)[field] = value;
      }

      // Recompute row totals if financial fields change
      const basic = Number(r.basicPay) || 0;
      const da = Number(r.daAmount) || 0;
      const hra = Number(r.hraAmount) || 0;
      const spl = Number(r.splPay) || 0;
      const cca = Number(r.ccaAmount) || 0;
      const bonus = Number(r.bonus) || 0;
      const daArr = Number(r.daArrear) || 0;
      const plSurr = Number(r.plSurrender) || 0;
      const otherAll = Number(r.otherAllowances) || 0;

      // Custom allowances
      let customAllowances = 0;
      let customDeductions = 0;
      if (r.customFields) {
        customColumns.forEach(c => {
          const val = Number(r.customFields?.[c.id]) || 0;
          if (c.type === 'allowance') {
            customAllowances += val;
          } else {
            customDeductions += val;
          }
        });
      }

      r.grossSalary = basic + da + hra + spl + cca + bonus + daArr + plSurr + otherAll + customAllowances;

      const gpf = Number(r.gpfAmount) || 0;
      const gpfLoan = Number(r.gpfLoan) || 0;
      const si = Number(r.siAmount) || 0;
      const siLoan = Number(r.siLoan) || 0;
      const rghs = Number(r.rghsAmount) || 0;
      const gis = Number(r.gisAmount) || 0;
      const lic = Number(r.licSalary) || 0;
      const pli = Number(r.pliAmount) || 0;
      const tds = Number(r.itTdsAmount) || 0;
      const hitkari = Number(r.hitkariNidhi) || 0;
      const otherDed = Number(r.otherDeductions) || 0;

      r.totalDeductions = gpf + gpfLoan + si + siLoan + rghs + gis + lic + pli + tds + hitkari + otherDed + customDeductions;
      r.netPayable = r.grossSalary - r.totalDeductions;

      updated[index] = r;
      return updated;
    });
  };

  const handleUpdateAllTds = (newRecords: MonthlyPayRecord[]) => {
    setRecords(newRecords);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-md font-black">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight">
                  राजस्थान Estimated GA-55 व Form 16 ऑटो टैक्स सिस्टम
                </h1>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  न्यू टैक्स रिजीम
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                IFMS 3.0 पे-मैनेजर Estimated GA-55 विश्लेषण • 100% सटीक गणना
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all active:scale-95"
              title="फुलस्क्रीन चालू/बंद करें"
            >
              <span>{isFullscreen ? '🗗 सामान्य स्क्रीन' : '⛶ फुलस्क्रीन'}</span>
            </button>

            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
              title="डेटा रीसेट करें"
            >
              <span>↺ रीसेट</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {/* Top: 1-Click GA-55 PDF Uploader */}
        <div className="print:hidden">
          <Ga55UploadCard
            onDataLoaded={handleGa55DataLoaded}
            currentProfile={profile}
          />
        </div>

        {/* Compact Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-5 bg-white rounded-xl shadow-xs p-1 gap-1 overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab('ga55')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'ga55'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📑</span>
            <span>GA-55 लेजर</span>
          </button>

          <button
            onClick={() => setActiveTab('form16')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'form16'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📜</span>
            <span>Form 16</span>
          </button>

          <button
            onClick={() => setActiveTab('tdsPlanner')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'tdsPlanner'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>💰</span>
            <span>TDS नियोजक</span>
          </button>

          <button
            onClick={() => setActiveTab('master')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'master'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>👤</span>
            <span>कार्मिक प्रोफाइल</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'ga55' && (
          <Ga55LedgerView
            profile={profile}
            records={records}
            customColumns={customColumns}
            onAddCustomColumn={handleAddCustomColumn}
            onRemoveCustomColumn={handleRemoveCustomColumn}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            onUpdateRecord={handleUpdateRecord}
            onResetRecords={handleResetAll}
            onInitBlankRows={handleInitBlankRows}
          />
        )}

        {activeTab === 'form16' && (
          <Form16PartBView
            profile={profile}
            records={records}
          />
        )}

        {activeTab === 'tdsPlanner' && (
          <TdsPlannerView
            profile={profile}
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onUpdateAllTds={handleUpdateAllTds}
          />
        )}

        {activeTab === 'master' && (
          <MasterProfileView
            profile={profile}
            onUpdateProfile={setProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">
            राजस्थान राज्य कार्मिक व शिक्षक वेतन एवं आयकर प्रपत्र प्रणाली • न्यू टैक्स रिजीम
          </p>
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-950 text-[11px] leading-relaxed max-w-4xl mx-auto">
            <strong>महत्वपूर्ण नोट व अस्वीकरण:</strong> यह सुविधा केवल कर्मचारियों के सहयोग के लिए बनाई गई है। इसके निर्माण में पूर्ण सावधानी रखी गई है, फिर भी किसी भी प्रकार की त्रुटि रहने पर निर्माता और ब्लॉगर की कोई ज़िम्मेदारी नहीं होगी। अतः अंतिम डेटा आयकर नियमों व अपने आहरण एवं वितरण अधिकारी (DDO) के अनुसार मिलान करके ही उपयोग में लें।
          </div>
          <p className="text-[11px] text-gray-400">
            100% क्लाइंट-साइड सुरक्षा: आपकी PDF अथवा वेतन जानकारी किसी भी बाहरी सर्वर पर अपलोड नहीं होती।
          </p>
        </div>
      </footer>
    </div>
  );
}
