import React, { useState } from 'react';
import { parseRajasthanGa55Pdf } from '../utils/ga55PdfParser';
import { MonthlyPayRecord, EmployeeProfile } from '../types/taxTypes';

interface Ga55UploadCardProps {
  onDataLoaded: (profile: Partial<EmployeeProfile>, records: MonthlyPayRecord[], meta?: any) => void;
  currentProfile: EmployeeProfile;
}

export const Ga55UploadCard: React.FC<Ga55UploadCardProps> = ({
  onDataLoaded,
  currentProfile
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    empName: string;
    empId: string;
    daPercent: number;
    hraPercent: number;
    isEstimated: boolean;
    projectedCount: number;
    totalGross: number;
    totalDeductions: number;
    netAmount: number;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('कृपया केवल GA-55 (PDF फ़ाइल) ही अपलोड करें!');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);
    setFileName(file.name);

    try {
      const result = await parseRajasthanGa55Pdf(file);
      onDataLoaded(result.profile, result.records, {
        daPercent: result.derivedDaRatePercent,
        hraPercent: result.derivedHraRatePercent,
        isEstimated: result.isEstimated,
        projectedCount: result.projectedMonthsCount
      });
      setSuccessInfo({
        empName: result.profile.empName || 'कार्मिक',
        empId: result.profile.empId || '',
        daPercent: result.derivedDaRatePercent,
        hraPercent: result.derivedHraRatePercent,
        isEstimated: result.isEstimated,
        projectedCount: result.projectedMonthsCount,
        totalGross: result.totalAllowances,
        totalDeductions: result.totalDeductions,
        netAmount: result.netAmount
      });
      setTimeout(() => setSuccessInfo(null), 10000);
    } catch (err: any) {
      console.error('Error parsing GA-55 PDF:', err);
      setErrorMessage('GA-55 PDF पढ़ने में त्रुटि हुई। कृपया सुनिश्चित करें कि यह IFMS 3.0 राजस्थान पे-मैनेजर का GA-55 है।');
    } finally {
      setIsParsing(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                GA-55 (Estimated / Non-Estimated) 1-क्लिक PDF लोड
              </h3>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                100% सुरक्षित • क्लाइंट-साइड विश्लेषण
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Estimated GA-55 PDF अपलोड करें — कार्मिक नाम, Basic, DA, HRA, GPF, SI आदि का 100% सटीक विश्लेषण होगा। यदि Non-Estimated GA-55 भी अपलोड करेंगे, तो भी सिस्टम स्वतः शेष माह की गणना जोड़कर Estimated GA-55 की तरह ही परिणाम देगा।
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-md shadow-emerald-200 transition-all transform active:scale-95 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{isParsing ? 'PDF पढ़ रहा है...' : 'GA-55 PDF चुनें'}</span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isParsing}
            />
          </label>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Info Banner with Parsed GA-55 details */}
      {successInfo && (
        <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">✓</span>
            <span>
              <strong>GA-55 सफलतापूर्वक विश्लेषित!</strong> कार्मिक: <strong>{successInfo.empName}</strong> ({successInfo.empId}) •
              सकल वेतन: <strong>₹{successInfo.totalGross.toLocaleString('en-IN')}</strong> •
              कुल कटौती: <strong>₹{successInfo.totalDeductions.toLocaleString('en-IN')}</strong> •
              शुद्ध देय: <strong>₹{successInfo.netAmount.toLocaleString('en-IN')}</strong>
              {successInfo.isEstimated ? (
                <span className="ml-1 text-emerald-700 font-semibold">• [Estimated GA-55: सभी 12 माह सीधे PDF से लोड हुए]</span>
              ) : (
                <span className="ml-1 text-indigo-700 font-semibold">• [Non-Estimated GA-55: IFMS 3.0 नियमानुसार शेष {successInfo.projectedCount} माह स्वतः जोड़कर Estimated GA-55 तैयार किया गया]</span>
              )}
            </span>
          </div>
          {fileName && <span className="text-gray-500 font-mono text-[11px]">{fileName}</span>}
        </div>
      )}

      {/* Current Active Employee Strip */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
        {currentProfile.empName ? (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                सक्रिय कार्मिक:
              </span>
              <span className="text-gray-900 font-bold">{currentProfile.empName}</span>
              {currentProfile.empId && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-700 font-mono">{currentProfile.empId}</span>
                </>
              )}
              {currentProfile.designation && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-700">पद: {currentProfile.designation}</span>
                </>
              )}
              {currentProfile.panNumber && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-700 font-mono">PAN: {currentProfile.panNumber}</span>
                </>
              )}
              <span className="text-gray-400">|</span>
              <span className="text-gray-700">पे लेवल: {currentProfile.payLevel || 'L-11'}</span>
            </div>
            {currentProfile.schoolName && (
              <div className="text-gray-500">
                कार्यालय: <span className="text-gray-700 font-medium">{currentProfile.schoolName.substring(0, 45)}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 italic flex items-center gap-2">
            <span>ℹ️</span>
            <span>GA-55 PDF अपलोड करने हेतु ऊपर <strong>'GA-55 PDF चुनें'</strong> बटन पर क्लिक करें अथवा सीधे फॉर्म में विवरण देखें।</span>
          </div>
        )}
      </div>
    </div>
  );
};
