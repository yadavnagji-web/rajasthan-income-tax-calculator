import React, { useState } from 'react';
import { MonthlyPayRecord, EmployeeProfile } from '../types/taxTypes';

interface TdsPlannerViewProps {
  profile: EmployeeProfile;
  records: MonthlyPayRecord[];
  onUpdateRecord: (index: number, field: keyof MonthlyPayRecord, value: number | string) => void;
  onUpdateAllTds: (records: MonthlyPayRecord[]) => void;
}

export const TdsPlannerView: React.FC<TdsPlannerViewProps> = ({
  profile,
  records,
  onUpdateRecord,
}) => {
  // 1. Calculate Gross Salary & Tax Liability under Budget 2025 New Tax Regime
  const totalGross = records.reduce((s, r) => s + (r.grossSalary || 0), 0);
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, totalGross - standardDeduction);

  // New Regime Slab Calculation
  let grossTax = 0;
  if (taxableIncome > 400000) {
    if (taxableIncome <= 800000) {
      grossTax += (taxableIncome - 400000) * 0.05;
    } else {
      grossTax += 400000 * 0.05;
      if (taxableIncome <= 1200000) {
        grossTax += (taxableIncome - 800000) * 0.10;
      } else {
        grossTax += 400000 * 0.10;
        if (taxableIncome <= 1600000) {
          grossTax += (taxableIncome - 1200000) * 0.15;
        } else {
          grossTax += 400000 * 0.15;
          if (taxableIncome <= 2000000) {
            grossTax += (taxableIncome - 1600000) * 0.20;
          } else {
            grossTax += 400000 * 0.20;
            if (taxableIncome <= 2400000) {
              taxableIncome <= 2400000 ? (grossTax += (taxableIncome - 2000000) * 0.25) : 0;
            } else {
              grossTax += 400000 * 0.25;
              grossTax += (taxableIncome - 2400000) * 0.30;
            }
          }
        }
      }
    }
  }

  // Section 87A rebate for taxable income up to 12 Lakhs
  const rebate87A = taxableIncome <= 1200000 ? grossTax : 0;
  const taxAfterRebate = Math.max(0, grossTax - rebate87A);
  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTaxLiability = taxAfterRebate + cess;

  // 2. TDS Paid so far
  const totalTdsPaid = records.reduce((s, r) => s + (r.itTdsAmount || 0), 0);
  const dueTax = Math.max(0, totalTaxLiability - totalTdsPaid);
  const excessRefund = Math.max(0, totalTdsPaid - totalTaxLiability);

  // Remaining months selection (default Dec, Jan, Feb)
  const [selectedMonthKeys, setSelectedMonthKeys] = useState<string[]>(['dec', 'jan', 'feb']);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleMonthSelection = (key: string) => {
    setSelectedMonthKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Auto distribute due tax across selected months
  const handleAutoDistribute = () => {
    if (selectedMonthKeys.length === 0) {
      alert('कृपया कम से कम 1 शेष माह चुनें जिसमें टैक्स काटना है!');
      return;
    }
    if (dueTax <= 0) {
      alert('कोई बकाया टैक्स नहीं है (Due Tax = ₹0)!');
      return;
    }

    const perMonth = Math.floor(dueTax / selectedMonthKeys.length);
    const remainder = dueTax - perMonth * selectedMonthKeys.length;

    selectedMonthKeys.forEach((key, idx) => {
      const recIdx = records.findIndex(r => r.monthKey === key);
      if (recIdx !== -1) {
        const amt = idx === selectedMonthKeys.length - 1 ? perMonth + remainder : perMonth;
        onUpdateRecord(recIdx, 'itTdsAmount', amt);
      }
    });

    setStatusMessage(`सफलतापूर्वक ₹${dueTax.toLocaleString('en-IN')} का बकाया टैक्स चुने गए ${selectedMonthKeys.length} माहों में वितरित कर दिया गया!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleClearAllTds = () => {
    records.forEach((_, idx) => {
      onUpdateRecord(idx, 'itTdsAmount', 0);
    });
    setStatusMessage('सभी माहों की TDS कटौती शून्य (₹0) कर दी गई।');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Financial Year / Session Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-50/80 border border-indigo-200 px-4 py-2.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-indigo-950">💰 मासिक TDS व बकाया टैक्स नियोजक</span>
          <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-extrabold rounded-full shadow-xs">
            वित्तीय सत्र: {profile.financialYear || '2025-26'}
          </span>
          <span className="text-xs text-indigo-800 font-semibold">
            (कर निर्धारण वर्ष A.Y.: {profile.assessmentYear || '2026-27'})
          </span>
        </div>
        <div className="text-xs text-indigo-900 font-medium">
          कार्मिक: <strong>{profile.empName}</strong> • PAN: <span className="font-mono">{profile.panNumber}</span>
        </div>
      </div>

      {/* 3 Live Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Tax */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            1. कुल देय टैक्स (Total Tax Liability)
          </div>
          <div className="text-3xl font-extrabold text-gray-900 font-mono">
            ₹{totalTaxLiability.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            न्यू टैक्स रिजीम (Budget 2025: 87A छूट ₹12L तक)
          </div>
          <div className="absolute right-3 top-3 text-indigo-100 font-black text-6xl select-none pointer-events-none">
            ₹
          </div>
        </div>

        {/* Card 2: Total TDS Paid */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            2. अब तक काटा गया TDS (Paid Tax)
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono">
            ₹{totalTdsPaid.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            वेतन बिलों से अब तक काटी गई आयकर कटौती का योग
          </div>
          <div className="absolute right-3 top-3 text-emerald-100 font-black text-6xl select-none pointer-events-none">
            ✓
          </div>
        </div>

        {/* Card 3: Due Tax */}
        <div className={`rounded-2xl p-5 border shadow-sm relative overflow-hidden ${
          dueTax > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-emerald-50/60 border-emerald-200'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            3. शेष बकाया टैक्स (Due Tax)
          </div>
          <div className={`text-3xl font-extrabold font-mono ${dueTax > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            ₹{dueTax.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {dueTax > 0 ? (
              <span className="text-amber-800 font-medium">⚠️ शेष महीनों के वेतन से कटौती आवश्यक</span>
            ) : excessRefund > 0 ? (
              <span className="text-blue-700 font-medium">रिफंड योग्य अतिरिक्त कटौती: ₹{excessRefund.toLocaleString('en-IN')}</span>
            ) : (
              <span className="text-emerald-700 font-medium">🎉 पूर्ण करमुक्त! कोई बकाया नहीं (₹0 Tax)</span>
            )}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Auto Split / Planner Tool */}
      {dueTax > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <span>⚡</span> शेष बकाया टैक्स ऑटो-कटौती नियोजक (Due Tax Auto Splitter)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                बकाया <strong>₹{dueTax.toLocaleString('en-IN')}</strong> को आगामी शेष माहों के वेतन में समान रूप से विभाजित करें:
              </p>
            </div>
            <button
              onClick={handleAutoDistribute}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              शेष माहों में समान बांटें (Auto Split)
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {['oct', 'nov', 'dec', 'jan', 'feb'].map(key => {
              const rec = records.find(r => r.monthKey === key);
              if (!rec) return null;
              const isSelected = selectedMonthKeys.includes(key);
              return (
                <label
                  key={key}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => toggleMonthSelection(key)}
                  />
                  <span>{rec.monthName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Month-wise TDS Entry Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span>📅</span> माह-वार TDS (आयकर कटौती) प्रविष्टि व विवरण
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              प्रत्येक माह में काटी गई वास्तविक अथवा प्रस्तावित TDS राशि यहाँ दर्ज करें:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAllTds}
              className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-all"
            >
              सभी TDS शून्य (₹0) करें
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200 font-semibold">
                <th className="py-2.5 px-4 w-12 text-center">क्र.</th>
                <th className="py-2.5 px-4">माह व बिल विवरण</th>
                <th className="py-2.5 px-4 text-center">प्रकार</th>
                <th className="py-2.5 px-4 text-right">सकल वेतन (Gross)</th>
                <th className="py-2.5 px-4 text-right w-44">TDS कटौती (रुपये)</th>
                <th className="py-2.5 px-4 text-right">कुल कटौतियां</th>
                <th className="py-2.5 px-4 text-right">शुद्ध भुगतान (Net)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r, idx) => {
                const totalDed = (r.gpfAmount || 0) + (r.siAmount || 0) + (r.rghsAmount || 0) + (r.gisAmount || 0) + (r.hitkariNidhi || 0) + (r.itTdsAmount || 0);
                const netPay = (r.grossSalary || 0) - totalDed;

                return (
                  <tr key={r.monthKey || idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-2 px-4 text-center text-gray-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-4 font-medium text-gray-900">
                      {r.monthName}
                      {r.tvNo && r.tvNo !== '-' && (
                        <span className="text-[10px] text-gray-400 font-mono block">TV: {r.tvNo}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        r.billType === 'Regular'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : r.billType === 'Surrender'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : r.billType === 'Arrear'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {r.billType || 'Regular'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-medium">
                      ₹{(r.grossSalary || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-400 text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={r.itTdsAmount || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            onUpdateRecord(idx, 'itTdsAmount', val);
                          }}
                          className="w-28 text-right font-mono font-bold text-xs bg-white border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-1 px-2 transition-all"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-gray-600">
                      ₹{totalDed.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{netPay.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold border-t-2 border-gray-300 text-gray-900">
                <td className="py-3 px-4 text-center" colSpan={3}>वार्षिक कुल योग (Annual Total)</td>
                <td className="py-3 px-4 text-right font-mono">₹{totalGross.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800 text-sm">
                  ₹{totalTdsPaid.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono" colSpan={2}>
                  शेष देय टैक्स: <span className="text-amber-700">₹{dueTax.toLocaleString('en-IN')}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
