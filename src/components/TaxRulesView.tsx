import React, { useState } from 'react';
import { TAX_RULES_DATABASE, TaxSectionRule } from '../data/taxRulesData';
import { Search, BookOpen, AlertCircle, FileText, CheckCircle2, ShieldCheck, HeartHandshake, Home, Award } from 'lucide-react';

export const TaxRulesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRule, setSelectedRule] = useState<TaxSectionRule | null>(TAX_RULES_DATABASE[0]);

  const categories = [
    { key: 'ALL', label: 'सभी धाराएं (All Sections)' },
    { key: 'Disability', label: '♿ दिव्यांग कार्मिक (80U & 80DD)' },
    { key: 'Medical', label: '🏥 स्वास्थ्य व RGHS (80D & 80DDB)' },
    { key: 'Investment', label: '💰 80C, GPF, SI, NPS (बचत)' },
    { key: 'Loan', label: '🏠 होम लोन व शिक्षा ऋण (24b & 80E)' },
    { key: 'Standard', label: '⚡ मानक कटौती (₹75k vs ₹50k)' },
  ];

  const filteredRules = TAX_RULES_DATABASE.filter(rule => {
    const matchesSearch = 
      rule.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.detailsHindi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.eligibleItems.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCat = selectedCategory === 'ALL' || rule.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-xs font-bold uppercase mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              आधिकारिक आयकर नियम निर्देशिका
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              आयकर धाराएं, छूट सीमाएं एवं राजस्थान कार्मिक प्रावधान
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              दिव्यांग कार्मिक छूट (80U/80DD), RGHS व मेडिक्लेम (80D), होम लोन ब्याज (24b), GPF, SI, NPS व मानक कटौती का संपूर्ण सचित्र विवरण।
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/50">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div className="text-xs">
              <span className="font-bold block text-white">100% प्रामाणिक नियम</span>
              <span className="text-emerald-200">आयकर अधिनियम 1961 व बजट 2024-26</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="धारा खोजें (जैसे: 80U, 80D, दिव्यांग, RGHS, होम लोन, SI, GPF, NPS)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`text-xs md:text-sm px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === cat.key
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: List and Detailed Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Rule Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filteredRules.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500 text-sm">
              कोई धारा नहीं मिली। कृपया अन्य कीवर्ड टाइप करें।
            </div>
          ) : (
            filteredRules.map((rule) => {
              const isSelected = selectedRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-1 ring-emerald-600'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded text-xs">
                      {rule.section}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      rule.regime === 'Old Only' 
                        ? 'bg-amber-100 text-amber-800' 
                        : rule.regime === 'Both' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {rule.regime === 'Old Only' ? 'केवल पुरानी व्यवस्था' : rule.regime === 'Both' ? 'दोनों व्यवस्थाओं में' : 'केवल नई व्यवस्था'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    {rule.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 mt-2">
                    <span className="font-medium text-emerald-700">अधिकतम: {rule.maxLimit}</span>
                    <span className="text-[11px] text-slate-400">विस्तार देखें ➔</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Full Detail View */}
        <div className="lg:col-span-7">
          {selectedRule ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6 sticky top-4">
              {/* Header Box */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-base font-mono font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                    {selectedRule.section}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                    लागू: {selectedRule.applicableFor}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedRule.title}
                </h3>
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span>अधिकतम कटौती सीमा:</span>
                  <span className="text-emerald-900">{selectedRule.maxLimit}</span>
                </div>
              </div>

              {/* Hindi Explanation */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  नियम का सरल विवरण (Explanation)
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedRule.detailsHindi}
                </p>
              </div>

              {/* Rajasthan Specific Note */}
              {selectedRule.rajasthanSpecificNotes && (
                <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    राजस्थान राज्य कर्मचारियों हेतु विशेष निर्देश:
                  </div>
                  <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
                    {selectedRule.rajasthanSpecificNotes}
                  </p>
                </div>
              )}

              {/* Eligible Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  इस धारा में क्या-क्या शामिल हो सकता है? (Eligible Items)
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                  {selectedRule.eligibleItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  DDO को प्रस्तुत किए जाने वाले आवश्यक दस्तावेज / प्रमाण (Proof Documents)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRule.documentsRequired.map((doc, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-md border border-emerald-200 font-medium">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
              बाएं पैनल से किसी भी धारा पर क्लिक करें।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
