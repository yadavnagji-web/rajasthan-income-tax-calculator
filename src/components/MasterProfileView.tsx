import React, { useState, useEffect } from 'react';
import { EmployeeProfile } from '../types/taxTypes';

interface MasterProfileViewProps {
  profile: EmployeeProfile;
  onUpdateProfile: (updated: EmployeeProfile) => void;
}

export const MasterProfileView: React.FC<MasterProfileViewProps> = ({
  profile,
  onUpdateProfile
}) => {
  const [formData, setFormData] = useState<EmployeeProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const handleChange = (field: keyof EmployeeProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>👤</span> कार्मिक एवं DDO मास्टर प्रोफाइल (Master Information)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            GA-55 PDF अपलोड करने पर ये विवरण स्वतः भर जाते हैं। आवश्यकतानुसार आप यहाँ संशोधन भी कर सकते हैं।
          </p>
        </div>
        {savedSuccess && (
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-300">
            ✓ प्रोफाइल विवरण सुरक्षित कर लिया गया!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Employee Details */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-indigo-700">
            <span>🔹</span> 1. कार्मिक व्यक्तिगत व सेवा विवरण (Employee Details)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">कार्मिक का पूरा नाम</label>
              <input
                type="text"
                value={formData.empName}
                onChange={e => handleChange('empName', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">कर्मचारी आईडी (Employee ID)</label>
              <input
                type="text"
                value={formData.empId || ''}
                onChange={e => handleChange('empId', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">पद (Designation)</label>
              <input
                type="text"
                value={formData.designation}
                onChange={e => handleChange('designation', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">पे-मैट्रिक्स लेवल (Pay Level)</label>
              <select
                value={formData.payLevel}
                onChange={e => handleChange('payLevel', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-medium bg-white"
              >
                {['L-10', 'L-11', 'L-12', 'L-13', 'L-14', 'L-15', 'L-16'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">PAN नंबर</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={e => handleChange('panNumber', e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">GPF / PRAN नंबर</label>
              <input
                type="text"
                value={formData.pranNumber}
                onChange={e => handleChange('pranNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">SI पॉलिसी नंबर</label>
              <input
                type="text"
                value={formData.siNumber}
                onChange={e => handleChange('siNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">बैंक खाता संख्या</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={e => handleChange('bankAccount', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">वित्तीय सत्र (Financial Year)</label>
              <input
                type="text"
                value={formData.financialYear || '2025-26'}
                onChange={e => handleChange('financialYear', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-bold text-indigo-900 bg-indigo-50/40"
                placeholder="उदा. 2025-26"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">कर निर्धारण वर्ष (Assessment Year)</label>
              <input
                type="text"
                value={formData.assessmentYear || '2026-27'}
                onChange={e => handleChange('assessmentYear', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-bold text-indigo-900 bg-indigo-50/40"
                placeholder="उदा. 2026-27"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">HRA दर (%)</label>
              <select
                value={formData.currentHraRate}
                onChange={e => handleChange('currentHraRate', parseInt(e.target.value, 10))}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-medium bg-white"
              >
                <option value={10}>10% (Category Z - सामान्य क्षेत्र)</option>
                <option value={20}>20% (Category Y - बड़े शहर)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: DDO & Office Details */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-indigo-700">
            <span>🔹</span> 2. कार्यालय एवं DDO विवरण (Office & DDO Information)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">विद्यालय / कार्यालय का नाम</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={e => handleChange('schoolName', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">DDO कोड (DDO Code)</label>
              <input
                type="text"
                value={formData.ddoCode || ''}
                onChange={e => handleChange('ddoCode', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">DDO का पदनाम / नाम</label>
              <input
                type="text"
                value={formData.ddoName}
                onChange={e => handleChange('ddoName', e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">कार्यालय TAN नंबर</label>
              <input
                type="text"
                value={formData.officeTan}
                onChange={e => handleChange('officeTan', e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-indigo-500 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            सुरक्षित करें (Save Profile)
          </button>
        </div>
      </form>
    </div>
  );
};
