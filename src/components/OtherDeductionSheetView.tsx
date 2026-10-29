import React from 'react';
import { TaxDeductionsOld, EmployeeProfile, TaxComparisonResult } from '../types/taxTypes';
import { Percent, Shield, Home, AlertCircle, Save } from 'lucide-react';
import { LiveTaxSummaryCard } from './LiveTaxSummaryCard';

interface OtherDeductionProps {
  profile: EmployeeProfile;
  deductions: TaxDeductionsOld;
  setDeductions: React.Dispatch<React.SetStateAction<TaxDeductionsOld>>;
  compResult: TaxComparisonResult;
  onNavigateTab: (tab: any) => void;
}

export const OtherDeductionSheetView: React.FC<OtherDeductionProps> = ({
  profile,
  deductions,
  setDeductions,
  compResult,
  onNavigateTab
}) => {
  const updateField = (field: keyof TaxDeductionsOld, val: number) => {
    setDeductions(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/20 rounded-full text-xs font-bold uppercase mb-1">
              <span>📑</span>
              <span>OTHER DEDUCTION SHEET</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              वेतन के अतिरिक्त कटौतियां, आय / जमा राशि एवं छूट का विवरण
            </h2>
            <p className="text-xs md:text-sm text-blue-100">
              कार्मिक: <strong>{profile.empName}</strong> ({profile.designation} {profile.payLevel}) | PAN: <strong className="font-mono">{profile.panNumber}</strong>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigateTab('taxOld')}
              className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow hover:bg-slate-100"
            >
              DDO गणना प्रपत्र देखें ➔
            </button>
          </div>
        </div>
      </div>

      {/* 36-Field Form Grid (Exact 36 Points from Excel) + Live Tax Summary Card */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Left Column (Points 1 to 18) */}
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm space-y-2.5">
          <div className="font-bold text-slate-900 text-sm border-b pb-1 text-blue-900">
            भाग 1: मकान किराया, गृह ऋण, जीवन बीमा व बचत (बिंदु 1 से 18)
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              1- मकान किराया भत्ता (छूट जो लेनी है - Section 10(13A)) :
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={deductions.actualRentPaid12M || ''}
                onChange={(e) => updateField('actualRentPaid12M', Number(e.target.value))}
                placeholder="12 माह में चुकाया कुल किराया ₹"
                className="w-full p-2 bg-amber-50/60 border border-amber-300 rounded font-mono font-bold"
              />
            </div>
            <span className="text-[10.5px] text-emerald-700 font-medium">
              स्वतः परिकलित HRA छूट: <strong>₹{compResult.calculatedHraExemption}</strong>
            </span>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              2- मनोरंजन भत्ता धारा 16 (ii) के अन्तर्गत :
            </label>
            <input
              type="number"
              value={deductions.sec16ii_Entertainment || ''}
              onChange={(e) => updateField('sec16ii_Entertainment', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              3- व्यवसाय कर धारा 16 (iii) के अन्तर्गत :
            </label>
            <input
              type="number"
              value={deductions.sec16iii_ProfessionalTax || ''}
              onChange={(e) => updateField('sec16iii_ProfessionalTax', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              4- गृह सम्पत्ति से प्राप्त किराया - आय :
            </label>
            <input
              type="number"
              value={deductions.incomeFromHouseProperty || ''}
              onChange={(e) => updateField('incomeFromHouseProperty', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              5- गृहकर (Municipal Tax Paid) :
            </label>
            <input
              type="number"
              value={deductions.municipalTaxPaid || ''}
              onChange={(e) => updateField('municipalTaxPaid', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div className="bg-amber-50/50 p-2 rounded border border-amber-200">
            <label className="block text-slate-800 font-bold mb-0.5">
              6- गृह ऋण किश्त मूलधन (HBA Principal - 80C) :
            </label>
            <input
              type="number"
              value={deductions.sec80C_HomeLoanPrincipal || ''}
              onChange={(e) => updateField('sec80C_HomeLoanPrincipal', Number(e.target.value))}
              placeholder="उदा. 50000"
              className="w-full p-2 bg-amber-50 border border-amber-300 rounded font-mono font-bold"
            />
          </div>

          <div className="bg-amber-50/50 p-2 rounded border border-amber-200">
            <label className="block text-slate-800 font-bold mb-0.5">
              7- गृह ऋण किश्त ब्याज (Home Loan Interest - 24b) [अधिकतम ₹2 लाख] :
            </label>
            <input
              type="number"
              value={deductions.sec24b_HomeLoanInterest || ''}
              onChange={(e) => updateField('sec24b_HomeLoanInterest', Number(e.target.value))}
              placeholder="उदा. 200000"
              className="w-full p-2 bg-amber-50 border border-amber-300 rounded font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              8- जीवन बीमा प्रीमियम (जो वेतन से नहीं काटा गया) LIC :
            </label>
            <input
              type="number"
              value={deductions.sec80C_LicPli || ''}
              onChange={(e) => updateField('sec80C_LicPli', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              9- पी.एल.आई. (PLI - Postal Life Insurance) :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div className="bg-amber-50/50 p-2 rounded border border-amber-200">
            <label className="block text-slate-800 font-bold mb-0.5">
              10- ट्यूशन फीस (Tuition Fees - अधिकतम 2 बच्चे) :
            </label>
            <input
              type="number"
              value={deductions.sec80C_TuitionFee || ''}
              onChange={(e) => updateField('sec80C_TuitionFee', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-amber-50 border border-amber-300 rounded font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              11- यू. एल. आई. पी. @ वार्षिक प्लान :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              12- राष्ट्रीय बचत पत्र (NSC) :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              13- राष्ट्रीय बचत पत्र पर अदत्त ब्याज :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              14- लोक भविष्य निधि (PPF) :
            </label>
            <input
              type="number"
              value={deductions.sec80C_PpfSsy || ''}
              onChange={(e) => updateField('sec80C_PpfSsy', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              15- राष्ट्रीय बचत स्कीम (NSS) :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              16- सुकन्या समृद्धि योजना (SSY) :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              17- इक्विटी लिंक्ड सेविंग्स स्कीम (ELSS) :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              18- स्थगित वार्षिकी (Deferred Annuity) :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>
        </div>

        {/* Right Column (Points 19 to 36) */}
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm space-y-2.5">
          <div className="font-bold text-slate-900 text-sm border-b pb-1 text-blue-900">
            भाग 2: ब्याज, पेंशन, 80D, दिव्यांग (80U/80DD) व अन्य धाराएं (19 से 36)
          </div>

          <div className="bg-slate-100 p-2 rounded">
            <label className="block text-slate-800 font-bold mb-0.5">
              19- स्टैंडर्ड डिडक्शन रुपये धारा 16 (ia) :
            </label>
            <div className="font-mono font-bold text-slate-900">
              New: ₹75,000 | Old: ₹50,000 (स्वतः परिकलित)
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              20- बचत खातों (Saving Accounts) की जमा राशि पर प्राप्त ब्याज :
            </label>
            <input
              type="number"
              value={deductions.bankSavingInterest || ''}
              onChange={(e) => updateField('bankSavingInterest', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              21- एफडी आदि अन्य जमा राशि पर प्राप्त कुल ब्याज :
            </label>
            <input
              type="number"
              value={deductions.fdOtherInterest || ''}
              onChange={(e) => updateField('fdOtherInterest', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              22- अन्य विभिन्न स्रोतों (ब्याज के अलावा) से कुल आय :
            </label>
            <input
              type="number"
              value={deductions.otherIncomeSources || ''}
              onChange={(e) => updateField('otherIncomeSources', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              23- धारा 80C के अन्तर्गत अन्य मद में जमा करायी गयी राशि :
            </label>
            <input
              type="number"
              value={deductions.sec80C_OtherItems || ''}
              onChange={(e) => updateField('sec80C_OtherItems', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              24- धारा 80CCC - पेंशन प्लान हेतु अंशदान :
            </label>
            <input
              type="number"
              value={deductions.sec80CCC_PensionPlan || ''}
              onChange={(e) => updateField('sec80CCC_PensionPlan', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              25- सरकारी पेंशन योजना में कर्मचारी अंशदान धारा 80CCD(1) :
            </label>
            <input
              type="number"
              value={deductions.sec80CCD1_GovtPensionEmp || ''}
              onChange={(e) => updateField('sec80CCD1_GovtPensionEmp', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div className="bg-amber-50/50 p-2 rounded border border-amber-200">
            <label className="block text-slate-800 font-bold mb-0.5">
              26- धारा 80CCD(1B) नवीन पेंशन योजना (NPS) अतिरिक्त अंशदान (अधिकतम ₹50,000) :
            </label>
            <input
              type="number"
              value={deductions.sec80CCD1B_NpsAdditional || ''}
              onChange={(e) => updateField('sec80CCD1B_NpsAdditional', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-amber-50 border border-amber-300 rounded font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              27- धारा 80D - चिकित्सा बीमा प्रीमियम (सामान्य 25000, वरिष्ठ नागरिक 50000) :
            </label>
            <input
              type="number"
              value={deductions.sec80D_MediclaimSelf || ''}
              onChange={(e) => updateField('sec80D_MediclaimSelf', Number(e.target.value))}
              placeholder="RGHS के अलावा मेडिक्लेम ₹"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div className="bg-amber-50/50 p-2 rounded border border-amber-200">
            <label className="block text-slate-800 font-bold mb-0.5">
              28- धारा 80DD- दिव्यांग आश्रितों के चिकित्सा उपचार (अधिकतम 75000, 80% पर 125000) :
            </label>
            <input
              type="number"
              value={profile.hasDivyangDependent ? (profile.divyangSeverityDependent === '80plus' ? 125000 : 75000) : 0}
              readOnly
              className="w-full p-2 bg-slate-100 border border-slate-300 rounded font-mono font-bold"
            />
            <span className="text-[10px] text-slate-500">मास्टर शीट में दिव्यांग आश्रित टॉगल से नियंत्रित</span>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              29- धारा 80DDB- विशिष्ट रोगों के उपचार हेतु कटौती (सामान्य 40000, वरिष्ठ 1 लाख) :
            </label>
            <input
              type="number"
              value={deductions.sec80DDB_MedicalTreatment || ''}
              onChange={(e) => updateField('sec80DDB_MedicalTreatment', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              30- धारा 80E - उच्च शिक्षा हेतु लिए ऋण का ब्याज :
            </label>
            <input
              type="number"
              value={deductions.sec80E_EduLoanInterest || ''}
              onChange={(e) => updateField('sec80E_EduLoanInterest', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              31- धारा 80G - धर्मार्थ संस्थाओं आदि को दिये दान (क श्रेणी 100%, ख श्रेणी 50%) :
            </label>
            <input
              type="number"
              value={deductions.sec80G_Donations || ''}
              onChange={(e) => updateField('sec80G_Donations', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div className="bg-amber-50/50 p-2 rounded border border-amber-200">
            <label className="block text-slate-800 font-bold mb-0.5">
              32- धारा 80U - स्थायी शारीरिक दिव्यांगता (अधिकतम 75000, 80% पर 125000) :
            </label>
            <input
              type="number"
              value={profile.isDivyangSelf ? (profile.divyangSeveritySelf === '80plus' ? 125000 : 75000) : 0}
              readOnly
              className="w-full p-2 bg-slate-100 border border-slate-300 rounded font-mono font-bold"
            />
            <span className="text-[10px] text-slate-500">मास्टर शीट में स्वयं दिव्यांग टॉगल से नियंत्रित</span>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              33- धारा 80 GGC - राजनीतिक पार्टी हेतु दिया गया दान :
            </label>
            <input
              type="number"
              value={deductions.sec80GGC_PoliticalDonation || ''}
              onChange={(e) => updateField('sec80GGC_PoliticalDonation', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              34- राहत धारा 89 के अन्तर्गत (Relief u/s 89) :
            </label>
            <input
              type="number"
              value={deductions.sec89_ReliefArrears || ''}
              onChange={(e) => updateField('sec89_ReliefArrears', Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              35- वेतन बिल के अलावा जमा कराया गया आयकर (TDS / Advance Tax) :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-0.5">
              36- धारा 10(14) के अन्तर्गत भत्ते जो करमुक्त हैं :
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
            />
          </div>
        </div>
        </div>

        {/* Right 1 Column: Live Tax Summary Widget (Captures 1 & 2) */}
        <div className="xl:col-span-1 xl:sticky xl:top-4">
          <LiveTaxSummaryCard
            compResult={compResult}
            actualRentPaid={deductions.actualRentPaid12M}
          />
        </div>
      </div>
    </div>
  );
};
