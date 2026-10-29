import React from 'react';
import { EmployeeProfile, TaxDeductionsOld, TaxComparisonResult } from '../types/taxTypes';
import { FileCheck, AlertCircle, Home, GraduationCap, Heart, Shield, CheckCircle, Info } from 'lucide-react';

interface DocumentsBoxProps {
  profile: EmployeeProfile;
  deductions: TaxDeductionsOld;
  compResult: TaxComparisonResult;
  totalHRA12M: number;
}

export const DocumentsChecklistBox: React.FC<DocumentsBoxProps> = ({
  profile,
  deductions,
  compResult,
  totalHRA12M
}) => {
  const documents: { title: string; detail: string; receiptAmount?: string; section: string; category: string }[] = [];

  // 1. GA-55 Statement (Always required)
  documents.push({
    title: 'पे-मैनेजर वार्षिक GA-55 सैलरी स्टेटमेंट',
    detail: 'वेतन, डीए, बोनस एवं कटौतियों (GPF, SI, RGHS, GIS) के सत्यापन हेतु DDO हस्ताक्षरित कॉपी।',
    section: 'आय प्रमाण',
    category: 'mandatory'
  });

  // 2. Tution Fees (Sec 80C)
  if (deductions.sec80C_TuitionFee > 0) {
    documents.push({
      title: 'बच्चों की स्कूल / कॉलेज ट्यूशन फीस रसीद (Tuition Fee Receipt)',
      detail: `अधिकतम 2 बच्चों की केवल वास्तविक शिक्षण शुल्क (Tuition Fee) रसीद जिसमें स्कूल का नाम व रजिस्ट्रेशन नंबर अंकित हो। (दावा की गई राशि: ₹${deductions.sec80C_TuitionFee.toLocaleString('en-IN')})`,
      receiptAmount: `₹${deductions.sec80C_TuitionFee.toLocaleString('en-IN')}`,
      section: '80C',
      category: 'tuition'
    });
  }

  // 3. House Rent Exemption (HRA Receipt Sec 10(13A))
  if (deductions.actualRentPaid12M > 0 || totalHRA12M > 0) {
    const monthlyRent = deductions.actualRentPaid12M > 0 ? Math.round(deductions.actualRentPaid12M / 12) : Math.round(compResult.minRentReceiptRequired / 12);
    const panRequired = deductions.actualRentPaid12M > 100000;

    documents.push({
      title: 'मकान किराया रसीद (Rent Agreement / Rent Receipts)',
      detail: `मकान मालिक द्वारा हस्ताक्षरित 12 माह की किराया रसीदें। पूर्ण HRA छूट पाने हेतु न्यूनतम वार्षिक रसीद: ₹${compResult.minRentReceiptRequired.toLocaleString('en-IN')} (अर्थात लगभग ₹${monthlyRent.toLocaleString('en-IN')}/माह)। ${panRequired ? '⚠️ वार्षिक किराया ₹1 लाख से अधिक होने पर मकान मालिक का PAN नंबर देना अनिवार्य है।' : ''}`,
      receiptAmount: `₹${(deductions.actualRentPaid12M || compResult.minRentReceiptRequired).toLocaleString('en-IN')}`,
      section: '10(13A)',
      category: 'hra'
    });
  }

  // 4. Home Loan Interest & Principal (Sec 24b & 80C)
  if (deductions.sec24b_HomeLoanInterest > 0 || deductions.sec80C_HomeLoanPrincipal > 0) {
    documents.push({
      title: 'बैंक होम लोन अनंतिम/अंतिम ब्याज प्रमाण पत्र (Home Loan Certificate)',
      detail: `बैंक द्वारा वित्तीय वर्ष ${profile.financialYear} हेतु जारी प्रमाण पत्र जिसमें मूलधन (80C: ₹${deductions.sec80C_HomeLoanPrincipal.toLocaleString('en-IN')}) और ब्याज (24b: ₹${deductions.sec24b_HomeLoanInterest.toLocaleString('en-IN')}) स्पष्ट अलग-अलग दर्शाया गया हो।`,
      receiptAmount: `ब्याज: ₹${deductions.sec24b_HomeLoanInterest.toLocaleString('en-IN')}`,
      section: '24(b) & 80C',
      category: 'loan'
    });
  }

  // 5. LIC / PLI Premium
  if (deductions.sec80C_LicPli > 0) {
    documents.push({
      title: 'एलआईसी / पीएलआई डाक जीवन बीमा प्रीमियम रसीदें',
      detail: `वित्तीय वर्ष ${profile.financialYear} में ऑनलाइन अथवा ऑफलाइन जमा प्रीमियम की अंतिम रसीदें।`,
      receiptAmount: `₹${deductions.sec80C_LicPli.toLocaleString('en-IN')}`,
      section: '80C',
      category: 'investment'
    });
  }

  // 6. NPS Additional (80CCD 1B)
  if (deductions.sec80CCD1B_NpsAdditional > 0) {
    documents.push({
      title: 'एनपीएस Tier-1 अतिरिक्त अंशदान प्रमाण पत्र / PRAN स्टेटमेंट',
      detail: `NPS पोर्टल या बैंक से प्राप्त ₹${deductions.sec80CCD1B_NpsAdditional.toLocaleString('en-IN')} अतिरिक्त जमा का स्टेटमेंट।`,
      receiptAmount: `₹${deductions.sec80CCD1B_NpsAdditional.toLocaleString('en-IN')}`,
      section: '80CCD(1B)',
      category: 'investment'
    });
  }

  // 7. Divyang Self (80U)
  if (profile.isDivyangSelf) {
    documents.push({
      title: 'दिव्यांगता प्रमाण पत्र (Disability Certificate / Form 10-IA)',
      detail: `अधिकृत सरकारी मेडिकल बोर्ड द्वारा जारी 40% या अधिक दिव्यांगता प्रमाण पत्र। (छूट: ${profile.divyangSeveritySelf === '80plus' ? '₹1,25,000' : '₹75,000'})`,
      receiptAmount: profile.divyangSeveritySelf === '80plus' ? '₹1,25,000 फ्लैट' : '₹75,000 फ्लैट',
      section: '80U',
      category: 'disability'
    });
  }

  // 8. Divyang Dependent (80DD)
  if (profile.hasDivyangDependent) {
    documents.push({
      title: 'आश्रित दिव्यांग परिजन का प्रमाण पत्र (Form 10-IB)',
      detail: `सरकारी अस्पताल बोर्ड प्रमाण पत्र एवं आश्रित होने का स्व-घोषणा पत्र।`,
      receiptAmount: profile.divyangSeverityDependent === '80plus' ? '₹1,25,000' : '₹75,000',
      section: '80DD',
      category: 'disability'
    });
  }

  // 9. Mediclaim (80D)
  if (deductions.sec80D_MediclaimSelf > 0 || deductions.sec80D_MediclaimParents > 0) {
    documents.push({
      title: 'मेडिक्लेम स्वास्थ्य बीमा प्रीमियम रसीद (Sec 80D Certificate)',
      detail: 'बीमा कंपनी द्वारा जारी आयकर 80D टैक्स सर्टिफिकेट (जिसमें नकद भुगतान न होकर चेक/ऑनलाइन भुगतान दर्शाया गया हो)।',
      receiptAmount: `₹${(deductions.sec80D_MediclaimSelf + deductions.sec80D_MediclaimParents).toLocaleString('en-IN')}`,
      section: '80D',
      category: 'medical'
    });
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 p-5 rounded-2xl border-2 border-emerald-300 shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-700 text-white rounded-lg shadow-sm">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base md:text-lg">
              📂 DDO कार्यालय में जमा कराने योग्य आवश्यक दस्तावेज व रसीदें
            </h3>
            <p className="text-xs text-slate-600">
              आपके द्वारा भरे गए डेटा के आधार पर स्वतः तैयार की गई चेकलिस्ट (Proof Documents Required)
            </p>
          </div>
        </div>
        <span className="text-xs bg-emerald-700 text-white font-bold px-3 py-1 rounded-full">
          कुल दस्तावेज: {documents.length}
        </span>
      </div>

      {/* Grid of required documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {documents.map((doc, idx) => (
          <div 
            key={idx}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2 hover:border-emerald-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                  धारा: {doc.section}
                </span>
                {doc.receiptAmount && (
                  <span className="font-bold text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px]">
                    रसीद राशि: {doc.receiptAmount}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                {doc.title}
              </h4>
              <p className="text-slate-600 text-[11.5px] leading-relaxed mt-1">
                {doc.detail}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>प्रपत्र के साथ मूल/हस्ताक्षरित प्रति संलग्न करें</span>
            </div>
          </div>
        ))}
      </div>

      {/* Warning / Important Tip for Teachers */}
      <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
        <div className="leading-relaxed">
          <strong>विशेष ध्यातव्य:</strong> आयकर विभाग के नियमानुसार किसी भी कटौती (जैसे ट्यूशन फीस, मकान किराया या होम लोन) का लाभ पाने के लिए वास्तविक रसीद DDO को प्रस्तुत करना आवश्यक है। यदि आप कोई रसीद जमा नहीं कराते हैं, तो आपके लिए <strong>नई कर व्यवस्था (New Regime)</strong> सबसे उपयुक्त एवं सुरक्षित रहेगी क्योंकि उसमें किसी भी रसीद की आवश्यकता नहीं होती।
        </div>
      </div>
    </div>
  );
};
