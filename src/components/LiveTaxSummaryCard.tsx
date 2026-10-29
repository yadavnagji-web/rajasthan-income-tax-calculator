import React from 'react';
import { TaxComparisonResult } from '../types/taxTypes';

interface LiveTaxSummaryCardProps {
  compResult: TaxComparisonResult;
  taxDeposited?: number;
  actualRentPaid?: number;
  showInPage?: boolean;
}

export const LiveTaxSummaryCard: React.FC<LiveTaxSummaryCardProps> = ({
  compResult,
  taxDeposited = 0,
  actualRentPaid = 0,
  showInPage = true
}) => {
  const isOldBetter = compResult.old_totalTaxPayable <= compResult.new_totalTaxPayable;
  const savingAmount = Math.abs(compResult.new_totalTaxPayable - compResult.old_totalTaxPayable);
  const betterText = isOldBetter ? 'Prefer Old Tax Regime' : 'Prefer New Tax Regime';
  const payableRegimeText = isOldBetter 
    ? 'Income Tax Payable (Old Tax Regime)' 
    : 'Income Tax Payable (New Tax Regime)';
  const payableAmount = isOldBetter 
    ? compResult.old_totalTaxPayable 
    : compResult.new_totalTaxPayable;

  return (
    <div className="w-full max-w-sm mx-auto shadow-md rounded-xl overflow-hidden border-2 border-slate-700 bg-white text-xs select-none">
      {/* 1. GROSS SALARY Header & Value */}
      <div className="border-b border-slate-700 text-center">
        <div className="py-1 font-extrabold text-blue-700 tracking-wider text-[11px] bg-slate-50 uppercase">
          GROSS SALARY
        </div>
        <div className="py-1.5 font-mono font-black text-red-600 text-base md:text-lg border-t border-slate-700 bg-white">
          {compResult.grossTotalIncome.toLocaleString('en-IN')}
        </div>
      </div>

      {/* 2. TOTAL TAX Block with curved TAX arc */}
      <div className="relative border-b border-slate-700">
        <div className="py-1 text-center font-extrabold text-white text-[11px] bg-[#4a7ebb] uppercase tracking-wider">
          TOTAL TAX
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-700 text-center">
          {/* Old Tax Regime */}
          <div className="py-1 bg-white">
            <div className="font-extrabold text-blue-800 text-[11px]">Old Tax Regime</div>
            <div className="font-mono font-black text-red-600 text-sm md:text-base">
              {compResult.old_totalTaxPayable.toLocaleString('en-IN')}
            </div>
          </div>

          {/* New Tax Regime */}
          <div className="py-1 bg-white">
            <div className="font-extrabold text-blue-800 text-[11px]">New Tax Regime</div>
            <div className="font-mono font-black text-red-600 text-sm md:text-base">
              {compResult.new_totalTaxPayable.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Tax Deposited */}
          <div className="py-1 bg-white">
            <div className="font-extrabold text-blue-800 text-[11px]">Tax Deposited</div>
            <div className="font-mono font-black text-red-600 text-sm">
              {taxDeposited.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Decorative Curved Arc on the right side labeled 'T A X' as in Excel screenshot */}
        <div className="absolute right-1 top-8 bottom-8 flex items-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <svg width="28" height="90" viewBox="0 0 28 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 4 5 C 24 25, 24 65, 4 85 C 18 65, 18 25, 4 5 Z" fill="#b9e8c9" stroke="#1d4ed8" strokeWidth="1.2" />
              <text x="12" y="32" fill="#0f172a" fontSize="10" fontWeight="900" fontFamily="sans-serif">T</text>
              <text x="12" y="47" fill="#0f172a" fontSize="10" fontWeight="900" fontFamily="sans-serif">A</text>
              <text x="12" y="62" fill="#0f172a" fontSize="10" fontWeight="900" fontFamily="sans-serif">X</text>
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Cyan Box: Rebate Under Section 80C */}
      <div className="bg-[#29c5cf] border-b border-slate-700 text-center py-2 px-3 text-slate-950 font-bold leading-tight">
        <div className="text-[10.5px]">
          Rebate Under Section 80C, 80CCC, 80CCD(1)
        </div>
        <div className="font-mono font-black text-sm md:text-base mt-0.5">
          {compResult.old_sec80C_totalAllowed.toLocaleString('en-IN')}
        </div>
      </div>

      {/* 4. Peach Box: मकान किराया छूट के लिए रसीद की आवश्यकता */}
      <div className="bg-[#fbd5b5] border-b border-slate-700 text-center py-2 px-3 text-slate-900 font-bold leading-tight">
        <div className="text-[10.5px]">
          मकान किराया छूट के लिए रसीद की आवश्यकता
        </div>
        <div className="font-mono font-black text-sm md:text-base mt-0.5 text-slate-950">
          {actualRentPaid > 0 ? compResult.minRentReceiptRequired.toLocaleString('en-IN') : '0'}
        </div>
      </div>

      {/* 5. Bottom Capture 2 Strip: Income Tax Payable & Saving */}
      <div className="bg-[#fcd5b4] divide-y divide-slate-700 font-bold text-center">
        <div className="grid grid-cols-12 py-1.5 px-2">
          <div className="col-span-8 text-left font-black text-[#5b2b82] text-[11px]">
            {payableRegimeText}
          </div>
          <div className="col-span-4 text-right font-mono font-black text-[#5b2b82] text-xs">
            {payableAmount.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="grid grid-cols-12 py-1.5 px-2 bg-[#fbd5b5]">
          <div className="col-span-7 text-left font-black text-[#5b2b82] text-[11px]">
            {betterText}
          </div>
          <div className="col-span-5 text-right font-mono font-black text-[#5b2b82] text-xs">
            Tax Saving = {savingAmount.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};
