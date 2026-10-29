import React, { useState } from 'react';
import { TaxComparisonResult, EmployeeProfile, TaxDeductionsOld } from '../types/taxTypes';
import { Lightbulb, TrendingDown, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, DollarSign, Sparkles } from 'lucide-react';

interface TaxSavingTipsProps {
  profile: EmployeeProfile;
  deductions: TaxDeductionsOld;
  compResult: TaxComparisonResult;
  onNavigateTab: (tab: any) => void;
}

export const TaxSavingTipsView: React.FC<TaxSavingTipsProps> = ({
  profile,
  deductions,
  compResult,
  onNavigateTab
}) => {
  const currentOldTax = compResult.old_totalTaxPayable;
  const currentTaxable = compResult.old_taxableIncome;
  const targetThreshold = 500000; // Old regime 87A rebate ceiling

  // Excess income above 5 lakh that attracts tax
  const excessAbove5L = Math.max(0, currentTaxable - targetThreshold);

  // Available room in 80C
  const raw80C = compResult.old_sec80C_gpf + compResult.old_sec80C_si + 
    (deductions.sec80C_HomeLoanPrincipal || 0) + (deductions.sec80C_LicPli || 0) + 
    (deductions.sec80C_TuitionFee || 0) + (deductions.sec80C_PpfSsy || 0) + 
    (deductions.sec80C_NscElssFd || 0) + (deductions.sec80C_OtherItems || 0);
  const remaining80C = Math.max(0, 150000 - raw80C);

  // Available room in 80CCD(1B) NPS
  const currentNps = deductions.sec80CCD1B_NpsAdditional || 0;
  const remainingNps = Math.max(0, 50000 - currentNps);

  // Available room in 80D Mediclaim
  const currentMediclaim = (deductions.sec80D_MediclaimSelf || 0) + (deductions.sec80D_MediclaimParents || 0);
  const maxMediclaim = 50000;
  const remainingMediclaim = Math.max(0, maxMediclaim - currentMediclaim);

  // Simulator state
  const [simNps, setSimNps] = useState(remainingNps > 0 ? Math.min(excessAbove5L, remainingNps) : 0);
  const [sim80C, setSim80C] = useState(0);
  const [sim80D, setSim80D] = useState(0);

  const simulatedAdditionalDed = simNps + sim80C + sim80D;
  const simulatedTaxable = Math.max(0, currentTaxable - simulatedAdditionalDed);
  let simulatedTax = 0;
  if (simulatedTaxable > targetThreshold) {
    const taxPart = 12500 + (simulatedTaxable - 500000) * 0.20;
    simulatedTax = Math.round(taxPart * 1.04);
  }
  const simulatedSaving = Math.max(0, currentOldTax - simulatedTax);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white p-5 rounded-2xl shadow-md border border-amber-500">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-black/20 rounded-full text-xs font-bold uppercase mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>TAX SAVING ADVISOR • वित्तीय वर्ष {profile.financialYear}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              पुरानी कर व्यवस्था (Old Tax Regime) में टैक्स शून्य (Zero) कैसे करें?
            </h2>
            <p className="text-xs md:text-sm text-amber-100">
              राजस्थान शिक्षक व कार्मिकों के लिए वैध आयकर कटौतियों द्वारा देय टैक्स को न्यूनतम या शून्य करने का संपूर्ण ब्लूप्रिंट
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('otherDeduction')}
            className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow hover:bg-slate-100 flex items-center gap-1.5"
          >
            <span>कटौतियां भरें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target & Status Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-900">
        {/* Card 1: Current Tax */}
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm space-y-1 text-center">
          <span className="text-xs text-slate-500 font-semibold uppercase">वर्तमान देय आयकर (Old Regime)</span>
          <div className="text-2xl font-black text-red-600 font-mono">
            ₹{currentOldTax.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-600">
            कर योग्य आय: ₹{currentTaxable.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 2: Target Threshold */}
        <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-400 shadow-sm space-y-1 text-center">
          <span className="text-xs text-emerald-800 font-bold uppercase">शून्य टैक्स का लक्ष्य (Zero Tax Target)</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            ₹5,00,000
          </div>
          <p className="text-[11px] text-emerald-900 font-medium">
            5 लाख तक धारा 87A के तहत ₹12,500 की 100% छूट मिलती है
          </p>
        </div>

        {/* Card 3: Tax Gap */}
        <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-400 shadow-sm space-y-1 text-center">
          <span className="text-xs text-amber-900 font-bold uppercase">टैक्स शून्य करने हेतु आवश्यक कटौती</span>
          <div className="text-2xl font-black text-amber-700 font-mono">
            ₹{excessAbove5L.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-950 font-bold">
            {excessAbove5L > 0 
              ? `केवल ₹${excessAbove5L.toLocaleString('en-IN')} की अतिरिक्त छूट लेते ही आपका टैक्स ₹0 हो जाएगा!`
              : 'बधाई हो! आपकी कर योग्य आय पहले से ही ₹5 लाख से कम है, आपका टैक्स शून्य है!'}
          </p>
        </div>
      </div>

      {/* Action Plan Pathways */}
      <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b pb-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>टैक्स बचाने के 5 सबसे आसान व अधिकृत रास्ते (Rajasthan Govt Approved)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Pathway 1: NPS Tier 1 80CCD(1B) */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 text-sm">1. NPS Tier-1 अतिरिक्त अंशदान (Sec 80CCD(1B))</span>
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">सर्वाधिक अनुशंसित</span>
            </div>
            <p className="text-slate-700">
              धारा 80C के ₹1.5 लाख के अतिरिक्त <strong>₹50,000</strong> तक की सीधी छूट।
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-blue-200 font-mono space-y-1 text-[11px]">
              <div>वर्तमान दावा: ₹{currentNps.toLocaleString('en-IN')}</div>
              <div>शेष उपलब्ध छूट: <strong className="text-blue-700">₹{remainingNps.toLocaleString('en-IN')}</strong></div>
              <div>संभावित टैक्स बचत: <strong>₹{Math.round(remainingNps * 0.208).toLocaleString('en-IN')}</strong></div>
            </div>
            <p className="text-[10.5px] text-slate-500">
              👉 CRA NSDL पोर्टल या बैंक शाखा से अपने PRAN में सीधे ₹50,000 तक जमा कराएं।
            </p>
          </div>

          {/* Pathway 2: Section 80C Remaining */}
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-sm">2. धारा 80C की शेष सीमा का पूर्ण उपयोग</span>
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">अधिकतम ₹1.5 लाख</span>
            </div>
            <p className="text-slate-700">
              GPF, SI, GIS के बाद बची हुई राशि में बच्चों की स्कूल ट्यूशन फीस, PPF, सुकन्या समृद्धि या 5-वर्षीय टैक्स सेवर FD।
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 font-mono space-y-1 text-[11px]">
              <div>वर्तमान कुल 80C: ₹{compResult.old_sec80C_totalAllowed.toLocaleString('en-IN')}</div>
              <div>शेष गुंजाइश: <strong className="text-emerald-700">₹{remaining80C.toLocaleString('en-IN')}</strong></div>
            </div>
            <p className="text-[10.5px] text-slate-500">
              👉 यदि आपके दो बच्चे स्कूल/कॉलेज में हैं तो उनकी वास्तविक Tuition Fee रसीदें संलग्न करें।
            </p>
          </div>

          {/* Pathway 3: Mediclaim 80D */}
          <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 text-sm">3. स्वास्थ्य बीमा व RGHS (धारा 80D)</span>
              <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold">₹25,000 से ₹75,000</span>
            </div>
            <p className="text-slate-700">
              स्वयं व परिवार के लिए ₹25,000 तथा वरिष्ठ नागरिक माता-पिता के स्वास्थ्य बीमा पर अतिरिक्त ₹50,000 तक की छूट।
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-purple-200 font-mono space-y-1 text-[11px]">
              <div>वर्तमान दावा: ₹{currentMediclaim.toLocaleString('en-IN')}</div>
              <div>संभावित अतिरिक्त छूट: <strong>₹{remainingMediclaim.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          {/* Pathway 4: HRA Optimization */}
          <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-sm">4. मकान किराया छूट (HRA Sec 10(13A))</span>
              <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold">पूर्ण HRA करमुक्त</span>
            </div>
            <p className="text-slate-700">
              यदि आप किराए के मकान में रहते हैं, तो नियम अनुसार न्यूनतम आवश्यक किराया रसीदें DDO को प्रस्तुत करके पूरे HRA को करमुक्त करा सकते हैं।
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-amber-200 font-mono space-y-1 text-[11px]">
              <div>पूर्ण HRA छूट हेतु न्यूनतम रसीद: <strong>₹{compResult.minRentReceiptRequired.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Zero Tax Simulator */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-lg border border-indigo-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-indigo-700/60 pb-3">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-base md:text-lg">
              🎛️ लाइव टैक्स शून्य (Zero Tax) सिमुलेटर
            </h3>
            <p className="text-xs text-indigo-200">
              नीचे अतिरिक्त बचत राशि दर्ज करके तुरंत देखें कि आपका टैक्स घटकर कितना रह जाएगा!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-indigo-200 mb-1 font-semibold">
              अतिरिक्त NPS 80CCD(1B) निवेश (₹):
            </label>
            <input
              type="number"
              max={50000}
              value={simNps}
              onChange={(e) => setSimNps(Number(e.target.value))}
              className="w-full p-2 bg-slate-800 border border-indigo-600 rounded font-mono font-bold text-emerald-400"
            />
            <span className="text-[10px] text-indigo-300">अधिकतम ₹50,000</span>
          </div>

          <div>
            <label className="block text-indigo-200 mb-1 font-semibold">
              अतिरिक्त 80C (ट्यूशन फीस/PPF) (₹):
            </label>
            <input
              type="number"
              value={sim80C}
              onChange={(e) => setSim80C(Number(e.target.value))}
              className="w-full p-2 bg-slate-800 border border-indigo-600 rounded font-mono font-bold text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-indigo-200 mb-1 font-semibold">
              स्वास्थ्य बीमा 80D (₹):
            </label>
            <input
              type="number"
              value={sim80D}
              onChange={(e) => setSim80D(Number(e.target.value))}
              className="w-full p-2 bg-slate-800 border border-indigo-600 rounded font-mono font-bold text-emerald-400"
            />
          </div>
        </div>

        {/* Live Simulation Result Callout */}
        <div className="bg-slate-800/90 border border-emerald-500/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-300">नई अनुमानित कर योग्य आय:</span>
            <div className="text-lg font-mono font-bold text-white">
              ₹{simulatedTaxable.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-300">नया अनुमानित टैक्स:</span>
            <div className={`text-xl font-mono font-black ${simulatedTax === 0 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
              ₹{simulatedTax.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-300">शुद्ध टैक्स बचत:</span>
            <div className="text-xl font-mono font-black text-emerald-400">
              ₹{simulatedSaving.toLocaleString('en-IN')}
            </div>
          </div>

          {simulatedTax === 0 && (
            <div className="w-full pt-2 border-t border-slate-700 text-center font-bold text-emerald-400 text-xs flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>बधाई! इस निवेश से आपका देय आयकर पूर्णतः शून्य (Zero Tax) हो जाएगा!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
