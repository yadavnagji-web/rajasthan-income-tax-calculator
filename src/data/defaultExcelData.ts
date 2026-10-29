import { MonthlyPayRecord, EmployeeProfile, TaxDeductionsOld } from '../types/taxTypes';
import { generateRajasthanGa55Records } from './rajasthanPayData';

export const DEFAULT_EXCEL_PROFILE: EmployeeProfile = {
  empName: 'Nagji Yadav',
  designation: 'TEACHER',
  schoolName: 'Govt.Praveshika Sanskrit School kunwa',
  panNumber: 'AHHPY4147Q',
  pranNumber: '',
  siNumber: '',
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
  currentHraRate: 10, // 0.1 in excel
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

export const DEFAULT_EXCEL_DEDUCTIONS: TaxDeductionsOld = {
  // HRA
  actualRentPaid12M: 53000,
  hraExemptionClaimed: 0,
  // Standard Deduction & Other
  sec16ii_Entertainment: 0,
  sec16iii_ProfessionalTax: 0,
  incomeFromHouseProperty: 0,
  // Home Loan Principal (80C) = 50000, Home Loan Interest (24b) = 200000
  sec24b_HomeLoanInterest: 200000,
  municipalTaxPaid: 0,
  bankSavingInterest: 0,
  fdOtherInterest: 0,
  otherIncomeSources: 0,
  // 80C
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

// Exact 12 months + 8 Arrear/Bonus records from user's Excel utility
export const DEFAULT_EXCEL_RECORDS: MonthlyPayRecord[] = generateRajasthanGa55Records(
  DEFAULT_EXCEL_PROFILE,
  700,
  5000
);
