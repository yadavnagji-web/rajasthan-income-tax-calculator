import { MonthlyPayRecord, EmployeeProfile, TaxDeductionsOld } from '../types/taxTypes';
import { generateRajasthanGa55Records } from './rajasthanPayData';

// 100% Clean Blank Production Profile
export const BLANK_PROFILE: EmployeeProfile = {
  empName: '',
  designation: 'शिक्षक / कार्मिक',
  schoolName: '',
  panNumber: '',
  pranNumber: '',
  siNumber: '',
  ddoName: '',
  ddoDesignation: 'प्रधानाचार्य / संस्था प्रधान',
  officeTan: '',
  bankAccount: '',
  mobileNo: '',
  payLevel: 'L-11',
  currentBasic: 0,
  financialYear: '2024-25',
  assessmentYear: '2025-26',
  cityCategory: 'Z',
  currentHraRate: 10,
  isSeniorCitizen: false,
  hasIncrement: true,
  incrementMonth: 'jul',
  hasBonus: false,
  hasSurrender: false,
  surrenderMonth: 'oct',
  surrenderDays: 15,
  isDivyangSelf: false,
  divyangSeveritySelf: '40to79',
  hasDivyangDependent: false,
  divyangSeverityDependent: '40to79'
};

// 100% Clean Blank Production Deductions
export const BLANK_DEDUCTIONS: TaxDeductionsOld = {
  actualRentPaid12M: 0,
  hraExemptionClaimed: 0,
  sec16ii_Entertainment: 0,
  sec16iii_ProfessionalTax: 0,
  incomeFromHouseProperty: 0,
  sec24b_HomeLoanInterest: 0,
  municipalTaxPaid: 0,
  bankSavingInterest: 0,
  fdOtherInterest: 0,
  otherIncomeSources: 0,
  sec80C_LicPli: 0,
  sec80C_PpfSsy: 0,
  sec80C_TuitionFee: 0,
  sec80C_HomeLoanPrincipal: 0,
  sec80C_NscElssFd: 0,
  sec80C_OtherItems: 0,
  sec80CCD1_GovtPensionEmp: 0,
  sec80CCD2_EmployerNPS: 0,
  sec80CCD1B_NpsAdditional: 0,
  sec80CCC_PensionPlan: 0,
  sec80D_MediclaimSelf: 0,
  sec80D_MediclaimParents: 0,
  sec80D_ParentsSenior: false,
  sec80DDB_MedicalTreatment: 0,
  sec80E_EduLoanInterest: 0,
  sec80G_Donations: 0,
  sec80GGC_PoliticalDonation: 0,
  sec80TTA_InterestRebate: 0,
  sec80TTB_SeniorInterestRebate: 0,
  sec89_ReliefArrears: 0,
  otherDeductionsChapVIA: 0
};

// Verified Demo Profile (For testing & sample verification)
export const DEMO_EXCEL_PROFILE: EmployeeProfile = {
  empName: 'Nagji Yadav',
  designation: 'TEACHER',
  schoolName: 'Govt.Praveshika Sanskrit School kunwa',
  panNumber: 'AHHPY4147Q',
  pranNumber: 'RJ-GPF-120984',
  siNumber: 'RJ-SI-88934',
  ddoName: 'JEEVRAJ PARMAR',
  ddoDesignation: 'Head Master',
  officeTan: 'JDHG20338D',
  bankAccount: '15000100003153',
  mobileNo: '9982151938',
  payLevel: 'L-11',
  currentBasic: 47900,
  financialYear: '2024-25',
  assessmentYear: '2025-26',
  cityCategory: 'Z',
  currentHraRate: 10,
  isSeniorCitizen: false,
  hasIncrement: true,
  incrementMonth: 'jul',
  hasBonus: true,
  hasSurrender: false,
  surrenderMonth: 'oct',
  surrenderDays: 15,
  isDivyangSelf: false,
  divyangSeveritySelf: '40to79',
  hasDivyangDependent: false,
  divyangSeverityDependent: '40to79'
};

export const DEMO_EXCEL_DEDUCTIONS: TaxDeductionsOld = {
  actualRentPaid12M: 53000,
  hraExemptionClaimed: 0,
  sec16ii_Entertainment: 0,
  sec16iii_ProfessionalTax: 0,
  incomeFromHouseProperty: 0,
  sec24b_HomeLoanInterest: 200000,
  municipalTaxPaid: 0,
  bankSavingInterest: 0,
  fdOtherInterest: 0,
  otherIncomeSources: 0,
  sec80C_LicPli: 0,
  sec80C_PpfSsy: 0,
  sec80C_TuitionFee: 0,
  sec80C_HomeLoanPrincipal: 50000,
  sec80C_NscElssFd: 0,
  sec80C_OtherItems: 0,
  sec80CCD1_GovtPensionEmp: 0,
  sec80CCD2_EmployerNPS: 0,
  sec80CCD1B_NpsAdditional: 0,
  sec80CCC_PensionPlan: 0,
  sec80D_MediclaimSelf: 0,
  sec80D_MediclaimParents: 0,
  sec80D_ParentsSenior: false,
  sec80DDB_MedicalTreatment: 0,
  sec80E_EduLoanInterest: 0,
  sec80G_Donations: 0,
  sec80GGC_PoliticalDonation: 0,
  sec80TTA_InterestRebate: 0,
  sec80TTB_SeniorInterestRebate: 0,
  sec89_ReliefArrears: 0,
  otherDeductionsChapVIA: 0
};

// Default export is BLANK for production readiness
export const DEFAULT_EXCEL_PROFILE: EmployeeProfile = BLANK_PROFILE;
export const DEFAULT_EXCEL_DEDUCTIONS: TaxDeductionsOld = BLANK_DEDUCTIONS;
export const DEFAULT_EXCEL_RECORDS: MonthlyPayRecord[] = generateRajasthanGa55Records(
  BLANK_PROFILE,
  0,
  0
);
