import React, { useState } from 'react';
import { MonthlyPayRecord, EmployeeProfile, CustomColumn } from '../types/taxTypes';

interface Ga55LedgerViewProps {
  profile: EmployeeProfile;
  records: MonthlyPayRecord[];
  customColumns: CustomColumn[];
  onAddCustomColumn: (col: CustomColumn) => void;
  onRemoveCustomColumn: (columnId: string) => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onUpdateRecord: (index: number, field: keyof MonthlyPayRecord | string, value: any) => void;
  onResetRecords: () => void;
}

export const Ga55LedgerView: React.FC<Ga55LedgerViewProps> = ({
  profile,
  records,
  customColumns,
  onAddCustomColumn,
  onRemoveCustomColumn,
  onAddRow,
  onDeleteRow,
  onUpdateRecord,
  onResetRecords
}) => {
  const [isEditable, setIsEditable] = useState(false);
  const [showAddColModal, setShowAddColModal] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<'deduction' | 'allowance'>('deduction');

  // 1. Compute Individual Column Totals for Allowances
  const totalBasic = records.reduce((s, r) => s + (r.basicPay || 0), 0);
  const totalDa = records.reduce((s, r) => s + (r.daAmount || 0), 0);
  const totalHra = records.reduce((s, r) => s + (r.hraAmount || 0), 0);
  const totalSplPay = records.reduce((s, r) => s + (r.splPay || 0), 0);
  const totalCca = records.reduce((s, r) => s + (r.ccaAmount || 0), 0);
  const totalBonus = records.reduce((s, r) => s + (r.bonus || 0), 0);
  const totalSurrender = records.reduce((s, r) => s + (r.plSurrender || 0), 0);
  const totalDaArrear = records.reduce((s, r) => s + (r.daArrear || 0), 0);
  const totalOtherAllowances = records.reduce((s, r) => s + (r.otherAllowances || 0), 0);

  // Custom allowances totals
  const customAllowances = customColumns.filter(c => c.type === 'allowance');
  const customAllowanceTotals: Record<string, number> = {};
  customAllowances.forEach(col => {
    customAllowanceTotals[col.id] = records.reduce((s, r) => s + (Number(r.customFields?.[col.id]) || 0), 0);
  });

  const totalGross = records.reduce((s, r) => s + (r.grossSalary || 0), 0);

  // 2. Compute Individual Column Totals for EVERY Deduction
  const totalGpf = records.reduce((s, r) => s + (r.gpfAmount || 0), 0);
  const totalGpfLoan = records.reduce((s, r) => s + (r.gpfLoan || 0), 0);
  const totalSi = records.reduce((s, r) => s + (r.siAmount || 0), 0);
  const totalSiLoan = records.reduce((s, r) => s + (r.siLoan || 0), 0);
  const totalRghs = records.reduce((s, r) => s + (r.rghsAmount || 0), 0);
  const totalGis = records.reduce((s, r) => s + (r.gisAmount || 0), 0);
  const totalLic = records.reduce((s, r) => s + (r.licSalary || 0), 0);
  const totalPli = records.reduce((s, r) => s + (r.pliAmount || 0), 0);
  const totalTds = records.reduce((s, r) => s + (r.itTdsAmount || 0), 0);
  const totalHitkari = records.reduce((s, r) => s + (r.hitkariNidhi || 0), 0);
  const totalOtherDed = records.reduce((s, r) => s + (r.otherDeductions || 0), 0);

  // Custom deductions totals
  const customDeductions = customColumns.filter(c => c.type === 'deduction');
  const customDeductionTotals: Record<string, number> = {};
  customDeductions.forEach(col => {
    customDeductionTotals[col.id] = records.reduce((s, r) => s + (Number(r.customFields?.[col.id]) || 0), 0);
  });

  const totalDed = records.reduce((s, r) => s + (r.totalDeductions || 0), 0);
  const totalNet = totalGross - totalDed;

  // 3. Dynamic Column Visibility Filters
  // Each allowance and deduction is ONLY displayed if present in this GA-55 (or when in edit mode)
  const showBasic = true;
  const showDa = true;
  const showHra = totalHra > 0 || isEditable;
  const showSplPay = totalSplPay > 0 || isEditable;
  const showCca = totalCca > 0 || isEditable;
  const showBonus = totalBonus > 0 || isEditable;
  const showSurrender = totalSurrender > 0 || isEditable;
  const showDaArrear = totalDaArrear > 0 || isEditable;
  const showOtherAllowances = totalOtherAllowances > 0 || isEditable;
  const activeCustomAllowances = customAllowances.filter(c => isEditable || (customAllowanceTotals[c.id] || 0) > 0);

  const showGpf = totalGpf > 0 || isEditable;
  const showGpfLoan = totalGpfLoan > 0 || isEditable;
  const showSi = totalSi > 0 || isEditable;
  const showSiLoan = totalSiLoan > 0 || isEditable;
  const showRghs = totalRghs > 0 || isEditable;
  const showGis = totalGis > 0 || isEditable;
  const showLic = totalLic > 0 || isEditable;
  const showPli = totalPli > 0 || isEditable;
  const showTds = totalTds > 0 || isEditable;
  const showHitkari = totalHitkari > 0 || isEditable;
  const showOtherDed = totalOtherDed > 0 || isEditable;
  const activeCustomDeductions = customDeductions.filter(c => isEditable || (customDeductionTotals[c.id] || 0) > 0);

  const allowanceColCount =
    (showBasic ? 1 : 0) +
    (showDa ? 1 : 0) +
    (showHra ? 1 : 0) +
    (showSplPay ? 1 : 0) +
    (showCca ? 1 : 0) +
    (showBonus ? 1 : 0) +
    (showSurrender ? 1 : 0) +
    (showDaArrear ? 1 : 0) +
    (showOtherAllowances ? 1 : 0) +
    activeCustomAllowances.length;

  const deductionColCount =
    (showGpf ? 1 : 0) +
    (showGpfLoan ? 1 : 0) +
    (showSi ? 1 : 0) +
    (showSiLoan ? 1 : 0) +
    (showRghs ? 1 : 0) +
    (showGis ? 1 : 0) +
    (showLic ? 1 : 0) +
    (showPli ? 1 : 0) +
    (showTds ? 1 : 0) +
    (showHitkari ? 1 : 0) +
    (showOtherDed ? 1 : 0) +
    activeCustomDeductions.length;

  // 4. Dynamic Row Filter: Shows all 14 rows / valid records in GA-55
  const visibleRecords = records
    .map((rec, originalIdx) => ({ rec, originalIdx }))
    .filter(({ rec }) =>
      isEditable ||
      rec.billType === 'Other' ||
      rec.monthKey.startsWith('custom_') ||
      (rec.grossSalary > 0 || rec.totalDeductions > 0)
    );

  const handlePrint = () => {
    window.print();
  };

  const handleAddRowClick = () => {
    setIsEditable(true);
    onAddRow();
  };

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColLabel.trim()) return;

    const colId = `custom_${Date.now()}`;
    onAddCustomColumn({
      id: colId,
      label: newColLabel.trim(),
      type: newColType
    });

    setNewColLabel('');
    setShowAddColModal(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-5 mb-8">
      {/* Dynamic 1-Page A4 Landscape Print Style */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 3.5mm 4.5mm !important;
          }
          html, body {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .ga55-landscape-container {
            width: 100% !important;
            max-width: 289mm !important;
            height: 201mm !important;
            max-height: 201mm !important;
            padding: 2.5mm 3.5mm !important;
            margin: 0 auto !important;
            border: 1.5px solid #000 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .ga55-table-wrap {
            flex-grow: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          .ga55-landscape-container table {
            width: 100% !important;
            height: 100% !important;
            font-size: 9.5px !important;
            line-height: 1.15 !important;
            border-collapse: collapse !important;
          }
          .ga55-landscape-container th {
            padding: 2px 2.5px !important;
            font-size: 8.5px !important;
            font-weight: bold !important;
          }
          .ga55-landscape-container td {
            padding: 2px 2.5px !important;
            font-size: 9px !important;
          }
          .ga55-landscape-container input {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            font-size: inherit !important;
          }
        }
      `}</style>

      {/* Action Toolbar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-gray-200 print:hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span>📑</span> GA-55A वार्षिक वेतन लेजर विवरण (Details Sheet)
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
              सत्र: {profile.financialYear || '2026-27'}
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              (सकल वेतन: ₹{totalGross.toLocaleString('en-IN')} | कुल कटौती: ₹{totalDed.toLocaleString('en-IN')})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            GA-55 के अनुसार प्रत्येक भत्ता एवं कटौती (SI ऋण, GPF ऋण, LIC, PLI आदि) अलग-अलग कॉलम में सटीक प्रदर्शित हैं।
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditable(!isEditable)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
              isEditable
                ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            <span>{isEditable ? '✓ संपादन समाप्त' : '✏️ मैन्युअल संपादन'}</span>
          </button>

          {isEditable && (
            <>
              <button
                onClick={handleAddRowClick}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 transition-all"
                title="अतिरिक्त बिल या एरियर पंक्ति जोड़ें"
              >
                <span>➕ बिल पंक्ति जोड़ें</span>
              </button>

              <button
                onClick={() => setShowAddColModal(true)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-300 transition-all"
                title="विशेष भत्ता या कटौती कॉलम जोड़ें"
              >
                <span>➕ नया कॉलम जोड़ें</span>
              </button>
            </>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <span>🖨️ A4 Landscape प्रिंट</span>
          </button>
        </div>
      </div>

      {/* Add Custom Column Modal */}
      {showAddColModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">नया कस्टम कॉलम जोड़ें</h3>
              <button onClick={() => setShowAddColModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateColumn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">कॉलम का नाम (उदा. कोर्ट आदेश, अग्रिम वेतन आदि)</label>
                <input
                  type="text"
                  required
                  placeholder="कॉलम शीर्षक लिखें"
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">कॉलम का प्रकार</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl p-2 text-xs"
                >
                  <option value="deduction">कटौती (Deduction)</option>
                  <option value="allowance">परिलब्धि / भत्ता (Allowance)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddColModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm"
                >
                  कॉलम जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main GA-55 Document Container */}
      <div className="ga55-landscape-container font-sans text-gray-900 bg-white">
        {/* Header Block */}
        <div className="text-center border-b border-gray-800 pb-1 mb-1">
          <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900">
            कार्यालय: {profile.schoolName || 'Govt. School / Office'}
          </div>
          <div className="text-sm sm:text-base font-black tracking-tight text-gray-900 my-0.5">
            प्रपत्र GA-55 A : वार्षिक वेतन विवरण एवं आयकर लेजर (GA-55 Salary Ledger)
          </div>
          <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-gray-700 font-semibold px-1">
            <span>वित्तीय वर्ष: <strong>{profile.financialYear || '2026-27'}</strong></span>
            <span>कर निर्धारण वर्ष: <strong>{profile.assessmentYear || '2027-28'}</strong></span>
            <span>IFMS 3.0 / पे-मैनेजर GA-55 मानकानुसार</span>
          </div>
        </div>

        {/* Employee & DDO Master Info Box */}
        <div className="grid grid-cols-2 gap-2 border border-gray-800 p-1.5 mb-1 bg-gray-50/70 text-[10px] sm:text-[11px]">
          <div className="space-y-0.5">
            <div>कार्मिक नाम: <strong className="text-xs">{profile.empName}</strong> ({profile.empId || 'RJDU201015007204'})</div>
            <div>पद व वेतनमान: <strong>{profile.designation}</strong> • पे-मैट्रिक्स लेवल: <strong>{profile.payLevel || 'L-11'}</strong></div>
            <div>PAN: <strong className="font-mono">{profile.panNumber}</strong> | बैंक खाता: <span className="font-mono">{profile.bankAccount}</span></div>
          </div>
          <div className="text-right space-y-0.5">
            <div>कार्यालय/विद्यालय: <strong>{profile.schoolName}</strong></div>
            <div>DDO कोड: <strong>{profile.ddoCode || '38402'}</strong> | TAN: <strong className="font-mono">{profile.officeTan || 'JDHG20338D'}</strong></div>
            <div>GPF / PRAN नं.: <strong className="font-mono">{profile.pranNumber}</strong> | SI पॉलिसी: <span className="font-mono">{profile.siNumber || '-'}</span></div>
          </div>
        </div>

        {/* Ledger Table Container */}
        <div className="ga55-table-wrap overflow-x-auto my-0.5">
          <table className="w-full border-collapse border border-gray-800 text-[9.5px] sm:text-[10.5px]">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-800 text-center font-bold">
                <th rowSpan={2} className="border-r border-gray-800 p-1 w-6">क्र.</th>
                <th rowSpan={2} className="border-r border-gray-800 p-1 w-28 sm:w-36 text-left">माह व बिल विवरण</th>
                <th colSpan={allowanceColCount} className="border-r border-gray-800 p-0.5 bg-blue-50">
                  परिलब्धियां (Allowances - Rs.)
                </th>
                <th rowSpan={2} className="border-r border-gray-800 p-1 w-18 sm:w-22 bg-blue-100 font-extrabold">सकल वेतन (Gross)</th>
                <th colSpan={deductionColCount} className="border-r border-gray-800 p-0.5 bg-amber-50">
                  कटौतियां (Deductions - Rs.)
                </th>
                <th rowSpan={2} className="border-r border-gray-800 p-1 w-18 sm:w-22 bg-amber-100 font-extrabold">कुल कटौती</th>
                <th rowSpan={2} className="border-r border-gray-800 p-1 w-18 sm:w-22 bg-emerald-100 font-extrabold">शुद्ध देय (Net Pay)</th>
                <th rowSpan={2} className="p-1 w-16 sm:w-22">बिल नं. / TV नं.</th>
                {isEditable && <th rowSpan={2} className="p-1 w-8 text-center bg-red-100 text-red-800 font-bold print:hidden">हटाएं</th>}
              </tr>
              <tr className="bg-gray-100 border-b border-gray-800 text-center font-bold text-[8.5px] sm:text-[9.5px]">
                {/* Allowances Headers */}
                {showBasic && <th className="border-r border-gray-800 p-0.5">मूल वेतन</th>}
                {showDa && <th className="border-r border-gray-800 p-0.5">DA</th>}
                {showHra && <th className="border-r border-gray-800 p-0.5">HRA</th>}
                {showSplPay && <th className="border-r border-gray-800 p-0.5 text-blue-900">विशेष वेतन</th>}
                {showCca && <th className="border-r border-gray-800 p-0.5 text-blue-900">CCA</th>}
                {showBonus && <th className="border-r border-gray-800 p-0.5 text-indigo-800">तदर्थ बोनस</th>}
                {showSurrender && <th className="border-r border-gray-800 p-0.5 text-purple-800">PL सरेंडर</th>}
                {showDaArrear && <th className="border-r border-gray-800 p-0.5 text-amber-800">DA एरियर</th>}
                {showOtherAllowances && <th className="border-r border-gray-800 p-0.5 text-slate-800">अन्य भत्ते</th>}
                {activeCustomAllowances.map(c => (
                  <th key={c.id} className="border-r border-gray-800 p-0.5 bg-blue-100/70 text-blue-900">
                    <div className="flex items-center justify-between gap-0.5">
                      <span>{c.label}</span>
                      {isEditable && (
                        <button onClick={() => onRemoveCustomColumn(c.id)} className="text-red-600 font-black px-0.5 print:hidden">✕</button>
                      )}
                    </div>
                  </th>
                ))}

                {/* Deductions Headers: Separate for every single deduction */}
                {showGpf && <th className="border-r border-gray-800 p-0.5">GPF (2004)</th>}
                {showGpfLoan && <th className="border-r border-gray-800 p-0.5 text-amber-950">GPF ऋण (GPFL)</th>}
                {showSi && <th className="border-r border-gray-800 p-0.5">राज्य बीमा (SI)</th>}
                {showSiLoan && <th className="border-r border-gray-800 p-0.5 text-amber-950">SI ऋण (SIL)</th>}
                {showRghs && <th className="border-r border-gray-800 p-0.5">RGHS</th>}
                {showGis && <th className="border-r border-gray-800 p-0.5">GIS</th>}
                {showLic && <th className="border-r border-gray-800 p-0.5 text-teal-900">LIC (वेतन)</th>}
                {showPli && <th className="border-r border-gray-800 p-0.5 text-teal-900">PLI</th>}
                {showTds && <th className="border-r border-gray-800 p-0.5 text-red-700">आयकर (TDS)</th>}
                {showHitkari && <th className="border-r border-gray-800 p-0.5 text-amber-900">हितकारी निधि</th>}
                {showOtherDed && <th className="border-r border-gray-800 p-0.5 text-slate-800">अन्य कटौती</th>}
                {activeCustomDeductions.map(c => (
                  <th key={c.id} className="border-r border-gray-800 p-0.5 bg-amber-100/70 text-amber-950">
                    <div className="flex items-center justify-between gap-0.5">
                      <span>{c.label}</span>
                      {isEditable && (
                        <button onClick={() => onRemoveCustomColumn(c.id)} className="text-red-600 font-black px-0.5 print:hidden">✕</button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map(({ rec: r, originalIdx }, displayIdx) => (
                <tr
                  key={r.monthKey || originalIdx}
                  className={`border-b border-gray-300 text-right ${
                    r.billType === 'Surrender' ? 'bg-purple-50/60 font-medium' : r.billType === 'Arrear' ? 'bg-amber-50/60 font-medium' : displayIdx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                  }`}
                >
                  <td className="border-r border-gray-800 p-0.5 sm:p-1 text-center font-mono font-medium">{displayIdx + 1}</td>
                  <td className="border-r border-gray-800 p-0.5 sm:p-1 text-left font-semibold">
                    {isEditable ? (
                      <input
                        type="text"
                        className="w-full border p-0.5 rounded text-xs"
                        value={r.monthName}
                        onChange={(e) => onUpdateRecord(originalIdx, 'monthName', e.target.value)}
                      />
                    ) : (
                      <>
                        {r.monthName}
                        {r.billType && r.billType !== 'Regular' && (
                          <span className="text-[8px] px-1 py-0.5 ml-1 rounded bg-gray-200 text-gray-800 font-sans">{r.billType}</span>
                        )}
                      </>
                    )}
                  </td>

                  {/* Allowances Columns */}
                  {showBasic && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.basicPay || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'basicPay', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.basicPay || 0).toLocaleString('en-IN')
                      )}
                    </td>
                  )}

                  {showDa && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.daAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'daAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.daAmount || 0).toLocaleString('en-IN')
                      )}
                    </td>
                  )}

                  {showHra && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.hraAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'hraAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.hraAmount || 0) > 0 ? (r.hraAmount || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showSplPay && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-blue-900">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.splPay || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'splPay', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.splPay || 0) > 0 ? (r.splPay || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showCca && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-blue-900">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.ccaAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'ccaAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.ccaAmount || 0) > 0 ? (r.ccaAmount || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showBonus && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-indigo-900 font-bold">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.bonus || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'bonus', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.bonus || 0) > 0 ? (r.bonus || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showSurrender && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-purple-900 font-bold">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.plSurrender || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'plSurrender', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.plSurrender || 0) > 0 ? (r.plSurrender || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showDaArrear && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-amber-900 font-bold">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.daArrear || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'daArrear', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.daArrear || 0) > 0 ? (r.daArrear || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showOtherAllowances && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-slate-900">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.otherAllowances || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'otherAllowances', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.otherAllowances || 0) > 0 ? (r.otherAllowances || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {activeCustomAllowances.map(c => {
                    const val = Number(r.customFields?.[c.id]) || 0;
                    return (
                      <td key={c.id} className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-blue-950 bg-blue-50/40">
                        {isEditable ? (
                          <input
                            type="number"
                            className="w-full text-right border p-0.5 rounded text-xs"
                            value={val || ''}
                            onChange={(e) => onUpdateRecord(originalIdx, c.id, parseFloat(e.target.value) || 0)}
                          />
                        ) : (
                          val > 0 ? val.toLocaleString('en-IN') : '-'
                        )}
                      </td>
                    );
                  })}

                  {/* Gross Salary */}
                  <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono font-black text-blue-950 bg-blue-50/60">
                    {(r.grossSalary || 0).toLocaleString('en-IN')}
                  </td>

                  {/* Deductions Columns */}
                  {showGpf && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.gpfAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'gpfAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.gpfAmount || 0) > 0 ? (r.gpfAmount || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showGpfLoan && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-amber-950 font-bold">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.gpfLoan || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'gpfLoan', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.gpfLoan || 0) > 0 ? (r.gpfLoan || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showSi && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.siAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'siAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.siAmount || 0) > 0 ? (r.siAmount || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showSiLoan && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-amber-950 font-bold">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.siLoan || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'siLoan', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.siLoan || 0) > 0 ? (r.siLoan || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showRghs && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.rghsAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'rghsAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.rghsAmount || 0) > 0 ? (r.rghsAmount || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showGis && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.gisAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'gisAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.gisAmount || 0) > 0 ? (r.gisAmount || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showLic && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-teal-900 font-bold">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.licSalary || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'licSalary', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.licSalary || 0) > 0 ? (r.licSalary || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showPli && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-teal-900 font-bold">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.pliAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'pliAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.pliAmount || 0) > 0 ? (r.pliAmount || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showTds && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-red-700 font-bold">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.itTdsAmount || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'itTdsAmount', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.itTdsAmount || 0) > 0 ? (r.itTdsAmount || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showHitkari && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-amber-900">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.hitkariNidhi || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'hitkariNidhi', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.hitkariNidhi || 0) > 0 ? (r.hitkariNidhi || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {showOtherDed && (
                    <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-slate-800">
                      {isEditable ? (
                        <input
                          type="number"
                          className="w-full text-right border p-0.5 rounded text-xs"
                          value={r.otherDeductions || ''}
                          onChange={(e) => onUpdateRecord(originalIdx, 'otherDeductions', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        (r.otherDeductions || 0) > 0 ? (r.otherDeductions || 0).toLocaleString('en-IN') : '-'
                      )}
                    </td>
                  )}

                  {activeCustomDeductions.map(c => {
                    const val = Number(r.customFields?.[c.id]) || 0;
                    return (
                      <td key={c.id} className="border-r border-gray-800 p-0.5 sm:p-1 font-mono text-amber-950 bg-amber-50/40">
                        {isEditable ? (
                          <input
                            type="number"
                            className="w-full text-right border p-0.5 rounded text-xs"
                            value={val || ''}
                            onChange={(e) => onUpdateRecord(originalIdx, c.id, parseFloat(e.target.value) || 0)}
                          />
                        ) : (
                          val > 0 ? val.toLocaleString('en-IN') : '-'
                        )}
                      </td>
                    );
                  })}

                  {/* Total Deductions & Net Pay */}
                  <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono font-bold text-amber-950 bg-amber-50/60">
                    {(r.totalDeductions || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="border-r border-gray-800 p-0.5 sm:p-1 font-mono font-black text-emerald-950 bg-emerald-50/70">
                    {(r.netPayable || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-0.5 sm:p-1 text-center font-mono text-[9px] text-gray-700">
                    {isEditable ? (
                      <input
                        type="text"
                        className="w-full text-center border p-0.5 rounded text-xs"
                        value={r.billNo ? `${r.billNo}${r.tvNo && r.tvNo !== '-' ? ' / ' + r.tvNo : ''}` : (r.tvNo || '-')}
                        onChange={(e) => onUpdateRecord(originalIdx, 'tvNo', e.target.value)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center leading-tight">
                        {r.billNo && <span className="font-semibold text-gray-900">{r.billNo}</span>}
                        {r.tvNo && r.tvNo !== '-' && <span className="text-[8px] text-gray-500 font-normal">{r.tvNo}</span>}
                        {!r.billNo && (!r.tvNo || r.tvNo === '-') && <span>-</span>}
                      </div>
                    )}
                  </td>

                  {isEditable && (
                    <td className="p-0.5 sm:p-1 text-center print:hidden">
                      <button
                        onClick={() => onDeleteRow(originalIdx)}
                        className="text-red-500 hover:text-red-700 font-bold px-1 text-xs"
                        title="यह पंक्ति हटाएं"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 border-t-2 border-gray-800 font-black text-right text-[10px] sm:text-xs">
                <td colSpan={2} className="border-r border-gray-800 p-1 text-center uppercase tracking-wide">
                  कुल वार्षिक योग (Grand Total)
                </td>
                {showBasic && <td className="border-r border-gray-800 p-1 font-mono">₹{totalBasic.toLocaleString('en-IN')}</td>}
                {showDa && <td className="border-r border-gray-800 p-1 font-mono">₹{totalDa.toLocaleString('en-IN')}</td>}
                {showHra && <td className="border-r border-gray-800 p-1 font-mono">₹{totalHra.toLocaleString('en-IN')}</td>}
                {showSplPay && <td className="border-r border-gray-800 p-1 font-mono text-blue-900">₹{totalSplPay.toLocaleString('en-IN')}</td>}
                {showCca && <td className="border-r border-gray-800 p-1 font-mono text-blue-900">₹{totalCca.toLocaleString('en-IN')}</td>}
                {showBonus && <td className="border-r border-gray-800 p-1 font-mono text-indigo-900">₹{totalBonus.toLocaleString('en-IN')}</td>}
                {showSurrender && <td className="border-r border-gray-800 p-1 font-mono text-purple-900">₹{totalSurrender.toLocaleString('en-IN')}</td>}
                {showDaArrear && <td className="border-r border-gray-800 p-1 font-mono text-amber-900">₹{totalDaArrear.toLocaleString('en-IN')}</td>}
                {showOtherAllowances && <td className="border-r border-gray-800 p-1 font-mono text-slate-900">₹{totalOtherAllowances.toLocaleString('en-IN')}</td>}

                {activeCustomAllowances.map(c => (
                  <td key={c.id} className="border-r border-gray-800 p-1 font-mono text-blue-900 bg-blue-100">
                    ₹{(customAllowanceTotals[c.id] || 0).toLocaleString('en-IN')}
                  </td>
                ))}

                <td className="border-r border-gray-800 p-1 font-mono text-blue-950 bg-blue-100 font-black">
                  ₹{totalGross.toLocaleString('en-IN')}
                </td>

                {showGpf && <td className="border-r border-gray-800 p-1 font-mono">₹{totalGpf.toLocaleString('en-IN')}</td>}
                {showGpfLoan && <td className="border-r border-gray-800 p-1 font-mono text-amber-950">₹{totalGpfLoan.toLocaleString('en-IN')}</td>}
                {showSi && <td className="border-r border-gray-800 p-1 font-mono">₹{totalSi.toLocaleString('en-IN')}</td>}
                {showSiLoan && <td className="border-r border-gray-800 p-1 font-mono text-amber-950">₹{totalSiLoan.toLocaleString('en-IN')}</td>}
                {showRghs && <td className="border-r border-gray-800 p-1 font-mono">₹{totalRghs.toLocaleString('en-IN')}</td>}
                {showGis && <td className="border-r border-gray-800 p-1 font-mono">₹{totalGis.toLocaleString('en-IN')}</td>}
                {showLic && <td className="border-r border-gray-800 p-1 font-mono text-teal-900">₹{totalLic.toLocaleString('en-IN')}</td>}
                {showPli && <td className="border-r border-gray-800 p-1 font-mono text-teal-900">₹{totalPli.toLocaleString('en-IN')}</td>}
                {showTds && <td className="border-r border-gray-800 p-1 font-mono text-red-800 font-black">₹{totalTds.toLocaleString('en-IN')}</td>}
                {showHitkari && <td className="border-r border-gray-800 p-1 font-mono text-amber-900">₹{totalHitkari.toLocaleString('en-IN')}</td>}
                {showOtherDed && <td className="border-r border-gray-800 p-1 font-mono text-slate-800">₹{totalOtherDed.toLocaleString('en-IN')}</td>}

                {activeCustomDeductions.map(c => (
                  <td key={c.id} className="border-r border-gray-800 p-1 font-mono text-amber-950 bg-amber-100">
                    ₹{(customDeductionTotals[c.id] || 0).toLocaleString('en-IN')}
                  </td>
                ))}

                <td className="border-r border-gray-800 p-1 font-mono text-amber-900 bg-amber-100 font-black">
                  ₹{totalDed.toLocaleString('en-IN')}
                </td>
                <td className="border-r border-gray-800 p-1 font-mono text-emerald-950 bg-emerald-100 font-black">
                  ₹{totalNet.toLocaleString('en-IN')}
                </td>
                <td className="p-1 text-center font-sans font-bold text-gray-800">GA-55 OK</td>
                {isEditable && <td className="p-1 text-center print:hidden">-</td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Signatures */}
        <div className="flex justify-between items-end mt-1.5 pt-1.5 border-t border-gray-300 text-[10px] sm:text-[11px]">
          <div>
            <div className="font-medium text-gray-800">प्रमाणित किया जाता है कि उपर्युक्त विवरण PayManager / IFMS 3.0 रिकॉर्ड व सेवा पुस्तिका के अनुसार सही है।</div>
            <div className="mt-0.5 text-gray-600 font-mono text-[10px]">
              सत्र: <strong>{profile.financialYear || '2026-27'}</strong> • दिनांक: {new Date().toLocaleDateString('en-IN')} • कार्यालय: {profile.schoolName?.substring(0, 40)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">हस्ताक्षर कार्मिक / वेतन आहरण एवं वितरण अधिकारी (DDO)</div>
            <div className="text-gray-500 text-[9px]">कार्यालय मोहर सहित</div>
          </div>
        </div>
      </div>
    </div>
  );
};
