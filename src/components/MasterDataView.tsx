import React, { useState } from 'react';
import { EmployeeProfile, TaxDeductionsOld, TaxComparisonResult } from '../types/taxTypes';
import { PAY_MATRIX_LEVELS } from '../data/rajasthanPayData';
import { Building, User, Calendar, CreditCard, Shield, Percent, HelpCircle, Save, CheckCircle2 } from 'lucide-react';

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
  onApplyMaster
}) => {
  const [hasSurrender, setHasSurrender] = useState('NO');
  const [surrenderMonth, setSurrenderMonth] = useState('');
  const [hasBonus, setHasBonus] = useState('YES');
  const [ccaRate, setCcaRate] = useState('NA');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onApplyMaster();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
              यहाँ भरी गई जानकारी GA-55, Other Deductions, और Computation Sheet (Old/New) में स्वतः भर जाएगी।
            </p>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs md:text-sm font-extrabold shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>डेटा लागू करें व सहेजें</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>मास्टर डेटा सफलतापूर्वक अपडेट हो गया है! GA-55 एवं गणना प्रपत्र स्वतः तैयार हैं।</span>
        </div>
      )}

      {/* Form Grid (Excel yellow cells layout) */}
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
                <label className="block text-slate-700 mb-1 font-semibold">कार्यालय का TAN % :</label>
                <input
                  type="text"
                  value={profile.officeTan}
                  onChange={(e) => setProfile({ ...profile, officeTan: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">DDO का नाम % :</label>
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
                <label className="block text-slate-700 mb-1 font-semibold">कार्मिक का नाम % :</label>
                <input
                  type="text"
                  value={profile.empName}
                  onChange={(e) => setProfile({ ...profile, empName: e.target.value })}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">कार्मिक का पद % :</label>
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
                <label className="block text-slate-700 mb-1 font-semibold">कार्मिक का PAN % :</label>
                <input
                  type="text"
                  value={profile.panNumber}
                  onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase() })}
                  maxLength={10}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">बैंक खाता संख्या % :</label>
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
                <label className="block text-slate-700 mb-1 font-semibold">पे लेवल (Pay Level) % :</label>
                <select
                  value={profile.payLevel}
                  onChange={(e) => setProfile({ ...profile, payLevel: e.target.value })}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                >
                  {Object.keys(PAY_MATRIX_LEVELS).map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">मार्च 2024 का मूल वेतन % :</label>
                <select
                  value={profile.currentBasic}
                  onChange={(e) => setProfile({ ...profile, currentBasic: Number(e.target.value) })}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono font-bold text-amber-950"
                >
                  {(PAY_MATRIX_LEVELS[profile.payLevel] || []).map((b) => (
                    <option key={b} value={b}>₹{b.toLocaleString('en-IN')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">HRA की दर (Rate of HRA) :</label>
                <select
                  value={profile.currentHraRate}
                  onChange={(e) => setProfile({ ...profile, currentHraRate: Number(e.target.value) })}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-medium"
                >
                  <option value={9}>0.09 (9% - Z श्रेणी पूर्व)</option>
                  <option value={10}>0.10 (10% - Z श्रेणी संशोधित)</option>
                  <option value={16}>0.16 (16% - Y श्रेणी)</option>
                  <option value={18}>0.18 (18% - Y श्रेणी संशोधित)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">राज्य बीमा (SI) मासिक कटौती % :</label>
                <input
                  type="number"
                  value={siMonthly}
                  onChange={(e) => setSiMonthly(Number(e.target.value))}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            {/* Questions from Excel Sheet */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">समूह दुर्घटना बीमा (GIS) प्रीमियम % :</label>
                <select
                  value={gisAmount}
                  onChange={(e) => setGisAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-medium"
                >
                  <option value={0}>0 (कोई कटौती नहीं)</option>
                  <option value={700}>700 (स्लैब ₹700)</option>
                  <option value={1400}>1400 (स्लैब ₹1400)</option>
                  <option value={2100}>2100 (स्लैब ₹2100)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">क्या आपको बोनस मिला है? :</label>
                <select
                  value={hasBonus}
                  onChange={(e) => setHasBonus(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                >
                  <option value="YES">YES (हाँ - ₹6,774)</option>
                  <option value="NO">NO (नहीं)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">क्या 2024-25 में सरेंडर (PL) लिया है? :</label>
                <select
                  value={hasSurrender}
                  onChange={(e) => setHasSurrender(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg font-bold"
                >
                  <option value="NO">NO (नहीं)</option>
                  <option value="YES">YES (हाँ)</option>
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
  );
};
