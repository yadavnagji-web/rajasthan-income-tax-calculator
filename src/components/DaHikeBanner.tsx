import React, { useState, useEffect } from 'react';
import { getLatestDaRateInfo } from '../utils/daTrackerService';

interface DaHikeBannerProps {
  basicPay: number;
  onApplyCustomDa: (rate: number, fromMonth: string) => void;
  onResetToAutoDa: () => void;
}

export const DaHikeBanner: React.FC<DaHikeBannerProps> = ({
  basicPay,
  onApplyCustomDa,
  onResetToAutoDa
}) => {
  const [currentRate, setCurrentRate] = useState<number>(63);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [showManualPanel, setShowManualPanel] = useState<boolean>(false);
  const [customRateInput, setCustomRateInput] = useState<number>(63);
  const [fromMonth, setFromMonth] = useState<string>('dec');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    getLatestDaRateInfo().then(info => {
      setCurrentRate(info.currentRate);
      setCustomRateInput(info.currentRate);
    });
  }, []);

  const handleApplyManual = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(customRateInput);
    if (!rate || rate < 0 || rate > 150) {
      alert('कृपया एक वैध DA प्रतिशत (जैसे 63, 64 या 65) दर्ज करें!');
      return;
    }
    setCurrentRate(rate);
    setIsManualMode(true);
    onApplyCustomDa(rate, fromMonth);
    setSuccessMsg(`मैन्युअल रूप से ${rate}% DA सफलतापूर्वक लागू कर दिया गया!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleResetToAuto = () => {
    getLatestDaRateInfo().then(info => {
      setCurrentRate(info.currentRate);
      setCustomRateInput(info.currentRate);
      setIsManualMode(false);
      onResetToAutoDa();
      setSuccessMsg('ऑटो-सिंक मोड पुनः सक्रिय: प्रमाणित आधिकारिक आदेशानुसार गणना बहाल।');
      setTimeout(() => setSuccessMsg(null), 4000);
    });
  };

  // 4 months arrear (July, August, September, October) at 3%
  const arrear4Months = Math.round(basicPay * 0.03 * 4);
  const monthlyDaAmount = Math.round(basicPay * (currentRate / 100));

  return (
    <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-4 text-white shadow-md mb-6 relative overflow-hidden border border-emerald-700/50">
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-xl shadow-inner">
            ⚡
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide ${
                isManualMode ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500 text-slate-950'
              }`}>
                {isManualMode ? 'मैन्युअल DA मोड' : 'ऑटो डीए अद्यतन प्रणाली'}
              </span>
              <h3 className="text-sm sm:text-base font-bold tracking-tight">
                महंगाई भत्ता (DA): वर्तमान दर {currentRate}% (दिसंबर वेतन से नकद भुगतान)
              </h3>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManualPanel(!showManualPanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all active:scale-95"
          >
            <span>⚙️</span>
            <span>{showManualPanel ? 'पैनल छिपाएं' : 'मैन्युअल DA बदलें'}</span>
          </button>

          <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className={`w-2 h-2 rounded-full ${isManualMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className="text-emerald-200 font-medium">
              {isManualMode ? 'मैन्युअल सक्रिय' : 'ऑटो-सिंक सक्रिय'}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Override Panel */}
      {showManualPanel && (
        <form onSubmit={handleApplyManual} className="mt-4 pt-4 border-t border-white/20 bg-black/20 p-3.5 rounded-xl text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <span>🛠️</span> मैन्युअल DA दर संशोधन टूल (यदि कभी स्वतः अपडेट न हो पाए):
            </span>
            {isManualMode && (
              <button
                type="button"
                onClick={handleResetToAuto}
                className="text-[11px] text-emerald-300 hover:text-emerald-200 underline font-medium"
              >
                ↺ ऑटो-सिंक पर रीसेट करें
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 mb-1 font-medium">DA दर दर्ज करें (%)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="150"
                  step="1"
                  value={customRateInput}
                  onChange={e => setCustomRateInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono font-bold text-white text-sm"
                  required
                />
                <span className="text-gray-300 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-medium">किस माह से लागू करें</label>
              <select
                value={fromMonth}
                onChange={e => setFromMonth(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs font-medium"
              >
                <option value="dec">दिसंबर से (डिफ़ॉल्ट नकद)</option>
                <option value="jan">जनवरी से</option>
                <option value="nov">नवंबर से</option>
                <option value="oct">अक्टूबर से</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black py-2 px-3 rounded-lg shadow-md transition-all active:scale-95 text-xs"
              >
                ✓ {customRateInput}% DA लागू करें
              </button>
            </div>
          </div>
        </form>
      )}

      {successMsg && (
        <div className="mt-3 p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Breakdown chips */}
      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-white/10 rounded-lg p-2">
          <span className="text-emerald-200 text-[11px] block">मार्च - अप्रैल DA</span>
          <span className="font-bold text-sm">58%</span>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <span className="text-emerald-200 text-[11px] block">मई - अक्टूबर DA</span>
          <span className="font-bold text-sm">60%</span>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <span className="text-emerald-200 text-[11px] block">3% DA एरियर (Jul-Oct GPF)</span>
          <span className="font-bold text-sm text-yellow-300">₹{arrear4Months.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <span className="text-emerald-200 text-[11px] block">नकद वेतन DA दर ({currentRate}%)</span>
          <span className="font-bold text-sm text-emerald-300">₹{monthlyDaAmount.toLocaleString('en-IN')}/माह</span>
        </div>
      </div>
    </div>
  );
};
