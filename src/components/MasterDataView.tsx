import React, { useState } from 'react';
import { EmployeeProfile, TaxDeductionsOld, TaxComparisonResult } from '../types/taxTypes';
import { PAY_MATRIX_LEVELS, getNextPayMatrixSlab, SUPPORTED_FINANCIAL_YEARS } from '../data/rajasthanPayData';
import { Building, User, Calendar, CreditCard, Shield, Percent, HelpCircle, Save, CheckCircle2, TrendingUp } from 'lucide-react';
import { LiveTaxSummaryCard } from './LiveTaxSummaryCard';

interface MasterDataProps {
  profile: EmployeeProfile;
  setProfile: React.Dispatch<React.SetStateAction<EmployeeProfile>>;
  deductions: TaxDeductionsOld;
  setDeductions: React.Dispatch<React.SetStateAction<TaxDeductionsOld>>;
  gisAmount: number;
  setGisAmount: (amt: number) => void;
  siMonthly: number;
  setSiMonthly: (amt: number) => void;
  onApplyMaster: () => void;
  compResult: TaxComparisonResult;
}

export const MasterDataView: React.FC<MasterDataProps> = ({
  profile,
  setProfile,
  deductions,
  setDeductions,
  gisAmount,
  setGisAmount,
  siMonthly,
  setSiMonthly,
  onApplyMaster,
  compResult
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const startYear = profile.financialYear.split('-')[0] || '2024';
  const nextJulyBasic = getNextPayMatrixSlab(profile.payLevel, profile.currentBasic);

  const handleSave = () => {
    onApplyMaster();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFinancialYearChange = (fy: string) => {
    const sYear = parseInt(fy.split('-')[0], 10) || 2024;
    const aYear = sYear + 1;
    const ay = `${aYear}-${String(aYear + 1).slice(-2)}`;
    setProfile(prev => ({
      ...prev,
      financialYear: fy,
      assessmentYear: ay
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 p-5 rounded-2xl shadow-md border border-amber-400">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-black/10 rounded-full text-xs font-bold uppercase mb-1">
              <span>📋</span>
              <span>MASTER DATA SHEET (मास्टर डेटा शीट)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              मास्टर डेटा प्रविष्टि (सभी पीले सेल भरें)
            </h2>
            <p className="text-xs md:text-sm font-medium text-amber-950">
              वित्तीय वर्ष {profile.financialYear} • कर निर्धारण वर्ष {profile.assessmentYear} • राजस्थान वित्त विभाग व पे-मैनेजर मानकानुसार
            </p>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs md:text-sm font-extrabold shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>डेटा लागू करें व GA-55 सिंक करें</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>मास्टर डेटा सफलतापूर्वक अपडेट हो गया है! GA-55A, Other Deductions, और Tax Computation Sheet स्वतः सिंक हो गई हैं।</span>
        </div>
      )}

      {/* Financial Year Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-slate-900 font-extrabold text-sm md:text-base">
              वित्तीय वर्ष चुनें (Select Financial Year) :
            </label>
            <p className="text-xs text-slate-500">
              किसी भी वित्तीय वर्ष का चयन करने पर पूरा कैलकुलेटर व प्रपत्र उसी वर्ष के अनुसार समायोजित हो जाएगा।
            </p>
          </div>
        </div>

        <select
          value={profile.financialYear}
          onChange={(e) => handleFinancialYearChange(e.target.value)}
          className="px-4 py-2.5 bg-amber-50 border-2 border-amber-500 text-slate-900 font-extrabold rounded-xl text-sm focus:ring-2 focus:ring-amber-500 shadow-inner"
        >
          {SUPPORTED_FINANCIAL_YEARS.map((y) => (
            <option key={y.fy} value={y.fy}>{y.label}</option>
          ))}
        </select>
      </div>

      {/* Form Grid & Live Tax Summary Widget (Capture 1 & 2 layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Columns: Office, Employee & Salary Settings */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Office & Employee Identity Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm md:text-base border-b pb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                कार्यालय एवं कार्मिक विवरण (Office & Personnel)
              </h3>

              <div className="space-y-3 text-xs md:text-sm">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    कार्यालय का नाम (Office Name) :
                  </label>
                  <input
                    type="text"
                    value={profile.schoolName}
                    onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                    className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">कार्यालय का TAN :</label>
                    <input
                      type="text"
                      value={profile.officeTan}
                      onChange={(e) => setProfile({ ...profile, officeTan: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">DDO का नाम :</label>
                    <input
                      type="text"
                      value={profile.ddoName}
                      onChange={(e) => setProfile({ ...profile, ddoName: e.target.value })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">कार्मिक का नाम :</label>
                    <input
                      type="text"
                      value={profile.empName}
                      onChange={(e) => setProfile({ ...profile, empName: e.target.value })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">कार्मिक का पद :</label>
                    <input
                      type="text"
                      value={profile.designation}
                      onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">कार्मिक का PAN :</label>
                    <input
                      type="text"
                      value={profile.panNumber}
                      onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase() })}
                      maxLength={10}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono uppercase font-bold text-amber-950"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">बैंक खाता संख्या :</label>
                    <input
                      type="text"
                      value={profile.bankAccount}
                      onChange={(e) => setProfile({ ...profile, bankAccount: e.target.value })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">मोबाइल नंबर (Mobile No) :</label>
                    <input
                      type="text"
                      value={profile.mobileNo}
                      onChange={(e) => setProfile({ ...profile, mobileNo: e.target.value })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">SI Number :</label>
                    <input
                      type="text"
                      value={profile.siNumber}
                      onChange={(e) => setProfile({ ...profile, siNumber: e.target.value })}
                      placeholder="RJ-SI-XXXXXX"
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">GPF / PRAN Number :</label>
                    <input
                      type="text"
                      value={profile.pranNumber}
                      onChange={(e) => setProfile({ ...profile, pranNumber: e.target.value })}
                      placeholder="RJ-GPF-XXXXX"
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">DDO का पद (Designation) :</label>
                    <input
                      type="text"
                      value={profile.ddoDesignation || 'Head Master'}
                      onChange={(e) => setProfile({ ...profile, ddoDesignation: e.target.value })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Salary, Slabs & Specific Questions Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm md:text-base border-b pb-2 flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-600" />
                पे-मैट्रिक्स, वेतन एवं भत्ते सेटिंग्स
              </h3>

              <div className="space-y-3 text-xs md:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">पे लेवल (Pay Level L-1 to L-24) :</label>
                    <select
                      value={profile.payLevel}
                      onChange={(e) => {
                        const newLvl = e.target.value;
                        const slabs = PAY_MATRIX_LEVELS[newLvl] || [];
                        const newBasic = slabs.length > 0 ? slabs[0] : profile.currentBasic;
                        setProfile({ ...profile, payLevel: newLvl, currentBasic: newBasic });
                      }}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                    >
                      {Object.keys(PAY_MATRIX_LEVELS).map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">
                      मार्च {startYear} का मूल वेतन (Basic Pay ₹) :
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={profile.currentBasic || ''}
                        onChange={(e) => setProfile({ ...profile, currentBasic: Number(e.target.value) })}
                        placeholder="मूल वेतन टाइप करें"
                        className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono font-bold text-amber-950 focus:ring-2 focus:ring-amber-500"
                      />
                      <select
                        value={profile.currentBasic}
                        onChange={(e) => setProfile({ ...profile, currentBasic: Number(e.target.value) })}
                        className="p-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-xs font-semibold text-slate-700 max-w-[130px]"
                        title="पे-मैट्रिक्स स्लैब से चुनें"
                      >
                        <option value={0}>स्लैब चुनें</option>
                        {(PAY_MATRIX_LEVELS[profile.payLevel] || []).map((b) => (
                          <option key={b} value={b}>₹{b.toLocaleString('en-IN')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rajasthan Govt 7th CPC July Increment Live Box */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                      वार्षिक वेतन वृद्धि (1 जुलाई को स्वतः अगला स्लैब):
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[11px]">
                      राजस्थान 7th CPC
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">
                    मार्च वेतन: <strong>₹{profile.currentBasic.toLocaleString('en-IN')}</strong> ➔ 1 जुलाई को देय वेतन: <strong className="text-emerald-700 text-sm">₹{nextJulyBasic.toLocaleString('en-IN')}</strong>
                  </p>
                  <div className="flex items-center gap-4 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.hasIncrement !== false}
                        onChange={(e) => setProfile({ ...profile, hasIncrement: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>वार्षिक वेतन वृद्धि लागू है (हाँ)</span>
                    </label>
                    <span className="text-slate-400">|</span>
                    <div className="flex items-center gap-1">
                      <span>माह:</span>
                      <select
                        value={profile.incrementMonth || 'jul'}
                        onChange={(e) => setProfile({ ...profile, incrementMonth: e.target.value as any })}
                        className="px-2 py-0.5 bg-white border border-emerald-300 rounded font-medium text-xs"
                      >
                        <option value="jul">जुलाई (मानक)</option>
                        <option value="jan">जनवरी</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">HRA की दर % (Rate of HRA) :</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={profile.currentHraRate || ''}
                        onChange={(e) => setProfile({ ...profile, currentHraRate: Number(e.target.value) })}
                        placeholder="HRA % दर्ज करें"
                        className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono font-bold text-amber-950"
                      />
                      <select
                        value={profile.currentHraRate}
                        onChange={(e) => setProfile({ ...profile, currentHraRate: Number(e.target.value) })}
                        className="p-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 max-w-[130px]"
                        title="मानक HRA चुनें"
                      >
                        <option value={0}>0% (शासकीय आवास)</option>
                        <option value={9}>9% (Z पूर्व)</option>
                        <option value={10}>10% (Z संशोधित)</option>
                        <option value={16}>16% (Y पूर्व)</option>
                        <option value={18}>18% (Y संशोधित)</option>
                        <option value={20}>20% (X श्रेणी)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">राज्य बीमा (SI) मासिक कटौती :</label>
                    <input
                      type="number"
                      value={siMonthly || ''}
                      onChange={(e) => setSiMonthly(Number(e.target.value))}
                      placeholder="0"
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Questions from Excel Sheet with dynamic year */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">समूह दुर्घटना बीमा (GIS) प्रीमियम :</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={gisAmount || ''}
                        onChange={(e) => setGisAmount(Number(e.target.value))}
                        placeholder="0"
                        className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono font-bold text-amber-950"
                      />
                      <select
                        value={gisAmount}
                        onChange={(e) => setGisAmount(Number(e.target.value))}
                        className="p-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 max-w-[110px]"
                        title="मानक GIS स्लैब चुनें"
                      >
                        <option value={0}>₹0</option>
                        <option value={700}>₹700</option>
                        <option value={1400}>₹1400</option>
                        <option value={2100}>₹2100</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">
                      क्या {profile.financialYear} में बोनस मिला है? :
                    </label>
                    <select
                      value={profile.hasBonus !== false ? 'YES' : 'NO'}
                      onChange={(e) => setProfile({ ...profile, hasBonus: e.target.value === 'YES' })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                    >
                      <option value="YES">YES (हाँ - ₹6,774 तदर्थ बोनस)</option>
                      <option value="NO">NO (नहीं)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">
                      क्या {profile.financialYear} में सरेंडर (PL) लिया है? :
                    </label>
                    <select
                      value={profile.hasSurrender ? 'YES' : 'NO'}
                      onChange={(e) => setProfile({ ...profile, hasSurrender: e.target.value === 'YES' })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                    >
                      <option value="NO">NO (नहीं)</option>
                      <option value="YES">YES (हाँ - 15 दिन उपार्जित अवकाश)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">वरिष्ठ नागरिक (60-80 आयु वर्ग)? :</label>
                    <select
                      value={profile.isSeniorCitizen ? 'YES' : 'NO'}
                      onChange={(e) => setProfile({ ...profile, isSeniorCitizen: e.target.value === 'YES' })}
                      className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                    >
                      <option value="NO">NO (सामान्य नागरिक)</option>
                      <option value="YES">YES (वरिष्ठ नागरिक - ₹3 लाख छूट)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Live Tax Summary Widget (Capture 1 & 2) */}
        <div className="lg:sticky lg:top-4 space-y-3">
          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow">
            <span>⚡ लाइव टैक्स परिणाम (Live Tax Calculation)</span>
          </div>
          <LiveTaxSummaryCard
            compResult={compResult}
            actualRentPaid={deductions.actualRentPaid12M}
          />
        </div>
      </div>
    </div>
  );
};
