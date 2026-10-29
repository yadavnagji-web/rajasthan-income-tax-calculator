// Interface definitions for Employee Profile, GA-55 Monthly Record and Deductions
export interface MonthlyPayRecord {
  monthName: string;
  monthKey: string;
  basicPay: number;
  daRate: number;
  daAmount: number;
  hraRate: number;
  hraAmount: number;
  splPay: number;
  ccaAmount: number;
  daArrear: number;
  bonus: number;
  plSurrender: number;
  otherAllowances: number;
  grossSalary: number;
  // Deductions
  gpfAmount: number;
  gpfLoan: number;
  siAmount: number;
  siLoan: number;
  rghsAmount: number;
  gisAmount: number;
  licSalary: number;
  itTdsAmount: number;
  hitkariNidhi: number;
  otherDeductions: number;
  totalDeductions: number;
  netPayable: number;
  billNoDate?: string;
}

export interface EmployeeProfile {
  empName: string;
  designation: string;
  schoolName: string;
  panNumber: string;
  pranNumber: string;
  siNumber: string;
  ddoName: string;
  ddoDesignation?: string;
  officeTan: string;
  bankAccount: string;
  mobileNo: string;
  payLevel: string;
  currentBasic: number; // March basic pay
  financialYear: string; // e.g. '2024-25', '2025-26', '2026-27', '2023-24'
  assessmentYear: string; // e.g. '2025-26', '2026-27', '2027-28', '2024-25'
  cityCategory: 'Y' | 'Z'; // Y = 16%/18% (Jaipur etc), Z = 9%/10% (Other)
  currentHraRate: number; // e.g. 0.09, 0.10, 0.16, 0.18
  isSeniorCitizen: boolean;
  // Increment settings (Rajasthan 7th CPC)
  hasIncrement: boolean; // default true
  incrementMonth: 'jul' | 'jan' | 'none'; // default 'jul' (1st July)
  // Bonus & Surrender PL
  hasBonus: boolean; // default true (Ad-hoc bonus ₹6,774)
  hasSurrender: boolean; // default false
  surrenderMonth: string; // default 'oct'
  surrenderDays: number; // default 15
  surrenderAmount?: number;
  // Disability
  isDivyangSelf: boolean;
  divyangSeveritySelf: '40to79' | '80plus'; // 80U
  hasDivyangDependent: boolean;
  divyangSeverityDependent: '40to79' | '80plus'; // 80DD
}

export interface TaxDeductionsOld {
  // HRA Exemption Sec 10(13A)
  actualRentPaid12M: number;
  hraExemptionClaimed: number;
  // Sec 16
  sec16ii_Entertainment: number;
  sec16iii_ProfessionalTax: number;
  // House Property
  incomeFromHouseProperty: number;
  sec24b_HomeLoanInterest: number;
  municipalTaxPaid: number;
  // Other Income
  bankSavingInterest: number;
  fdOtherInterest: number;
  otherIncomeSources: number;
  // Sec 80C
  sec80C_LicPli: number;
  sec80C_PpfSsy: number;
  sec80C_TuitionFee: number;
  sec80C_HomeLoanPrincipal: number;
  sec80C_NscElssFd: number;
  sec80C_OtherItems: number;
  // Sec 80CCD
  sec80CCD1_GovtPensionEmp: number;
  sec80CCD2_EmployerNPS: number;
  sec80CCD1B_NpsAdditional: number;
  sec80CCC_PensionPlan: number;
  // Sec 80D
  sec80D_MediclaimSelf: number;
  sec80D_MediclaimParents: number;
  sec80D_ParentsSenior: boolean;
  // Disability
  sec80DDB_MedicalTreatment: number;
  // Education Loan & Donations
  sec80E_EduLoanInterest: number;
  sec80G_Donations: number;
  sec80GGC_PoliticalDonation: number;
  // Savings Interest Rebate
  sec80TTA_InterestRebate: number;
  sec80TTB_SeniorInterestRebate: number;
  sec89_ReliefArrears: number;
  otherDeductionsChapVIA: number;
}

export interface TaxComparisonResult {
  grossTotalIncome: number;
  // HRA Exemption Calculated
  calculatedHraExemption: number;
  minRentReceiptRequired: number; // minimum rent required to claim this HRA exemption
  // New Regime
  new_standardDeduction: number;
  new_taxableIncome: number;
  new_taxBeforeRebate: number;
  new_rebate87A: number;
  new_taxAfterRebate: number;
  new_cess: number;
  new_totalTaxPayable: number;
  // Old Regime
  old_standardDeduction: number;
  old_sec80C_totalAllowed: number;
  old_sec80C_gpf: number;
  old_sec80C_si: number;
  old_sec80C_others: number;
  old_sec80CCD1B: number;
  old_sec80D: number;
  old_sec24b_homeLoan: number;
  old_sec80U_divyang: number;
  old_sec80DD_dependent: number;
  old_otherDeductions: number;
  old_totalDeductions: number;
  old_taxableIncome: number;
  old_taxBeforeRebate: number;
  old_rebate87A: number;
  old_taxAfterRebate: number;
  old_cess: number;
  old_totalTaxPayable: number;
  // Comparison
  differenceAmount: number;
  betterRegime: 'NEW' | 'OLD' | 'EQUAL';
  savingSuggestion: string;
}

// HRA Exemption Calculator under Section 10(13A)
export function calculateHraExemption(
  basicTotal: number,
  daTotal: number,
  hraTotal: number,
  actualRentPaid: number,
  isMetro: boolean = false
): { exemptHra: number; taxableHra: number; minRentNeededForFullHra: number } {
  const salaryForHra = basicTotal + daTotal;
  const metroFactor = isMetro ? 0.50 : 0.40;
  
  // 1. Actual HRA received
  const condition1 = hraTotal;
  // 2. Rent paid minus 10% of salary
  const condition2 = Math.max(0, actualRentPaid - 0.10 * salaryForHra);
  // 3. 40% (or 50%) of salary
  const condition3 = metroFactor * salaryForHra;

  const exemptHra = Math.round(Math.min(condition1, condition2, condition3));
  const taxableHra = Math.max(0, hraTotal - exemptHra);

  // Minimum rent needed to claim 100% of received HRA:
  // Rent - 10% of salary = HRA => Rent = HRA + 10% of salary
  const minRentNeededForFullHra = Math.round(hraTotal + (0.10 * salaryForHra));

  return { exemptHra, taxableHra, minRentNeededForFullHra };
}

// Calculate New Regime Tax (FY 2024-25 / AY 2025-26 Slabs)
export function calculateNewRegimeTax(taxableIncome: number): {
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
} {
  let tax = 0;
  if (taxableIncome <= 300000) {
    tax = 0;
  } else if (taxableIncome <= 700000) {
    tax = (taxableIncome - 300000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 400000 * 0.05 + (taxableIncome - 700000) * 0.10;
  } else if (taxableIncome <= 1200000) {
    tax = 400000 * 0.05 + 300000 * 0.10 + (taxableIncome - 1000000) * 0.15;
  } else if (taxableIncome <= 1500000) {
    tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + (taxableIncome - 1200000) * 0.20;
  } else {
    tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + 300000 * 0.20 + (taxableIncome - 1500000) * 0.30;
  }

  // Rebate u/s 87A: If taxable income <= 7,00,000, 100% tax rebate (max 25,000)
  let rebate87A = 0;
  if (taxableIncome <= 700000) {
    rebate87A = Math.min(tax, 25000);
  } else {
    // Marginal relief under Section 87A
    const excessIncome = taxableIncome - 700000;
    if (tax > excessIncome) {
      rebate87A = tax - excessIncome;
    }
  }

  const taxAfterRebate = Math.max(0, tax - rebate87A);
  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTax = taxAfterRebate + cess;

  return {
    taxBeforeRebate: Math.round(tax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    cess,
    totalTax
  };
}

// Calculate Old Regime Tax (FY 2024-25 / AY 2025-26 Slabs)
export function calculateOldRegimeTax(taxableIncome: number, isSeniorCitizen: boolean = false): {
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
} {
  const exemptLimit = isSeniorCitizen ? 300000 : 250000;
  let tax = 0;

  if (taxableIncome <= exemptLimit) {
    tax = 0;
  } else if (taxableIncome <= 500000) {
    tax = (taxableIncome - exemptLimit) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = (500000 - exemptLimit) * 0.05 + (taxableIncome - 500000) * 0.20;
  } else {
    tax = (500000 - exemptLimit) * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30;
  }

  // Rebate u/s 87A: If taxable income <= 5,00,000, rebate up to 12,500
  let rebate87A = 0;
  if (taxableIncome <= 500000) {
    rebate87A = Math.min(tax, 12500);
  }

  const taxAfterRebate = Math.max(0, tax - rebate87A);
  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTax = taxAfterRebate + cess;

  return {
    taxBeforeRebate: Math.round(tax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    cess,
    totalTax
  };
}

// Comprehensive Tax Comparison Function
export function computeTaxComparison(
  basicTotal: number,
  daTotal: number,
  hraTotal: number,
  grossTotalIncome: number,
  profile: EmployeeProfile,
  deductionsOld: TaxDeductionsOld,
  annualGpf: number,
  annualSi: number,
  annualRghs: number
): TaxComparisonResult {
  // HRA Exemption
  const isMetro = profile.cityCategory === 'Y';
  const hraCalc = calculateHraExemption(
    basicTotal,
    daTotal,
    hraTotal,
    deductionsOld.actualRentPaid12M || 0,
    isMetro
  );

  // --- NEW REGIME ---
  const new_standardDeduction = profile.financialYear === '2023-24' ? 50000 : 75000;
  const new_taxableIncome = Math.max(0, grossTotalIncome - new_standardDeduction);
  const newCalc = calculateNewRegimeTax(new_taxableIncome);

  // --- OLD REGIME ---
  const old_standardDeduction = 50000;
  
  // Section 80C Calculation (Max 1,50,000)
  const sec80C_others = 
    (deductionsOld.sec80C_LicPli || 0) +
    (deductionsOld.sec80C_PpfSsy || 0) +
    (deductionsOld.sec80C_TuitionFee || 0) +
    (deductionsOld.sec80C_HomeLoanPrincipal || 0) +
    (deductionsOld.sec80C_NscElssFd || 0) +
    (deductionsOld.sec80C_OtherItems || 0);
  
  const sec80C_rawTotal = annualGpf + annualSi + sec80C_others;
  const old_sec80C_totalAllowed = Math.min(150000, sec80C_rawTotal);

  // Section 80CCD(1B) NPS Additional (Max 50,000)
  const old_sec80CCD1B = Math.min(50000, deductionsOld.sec80CCD1B_NpsAdditional || 0);

  // Section 80D Mediclaim & RGHS
  const rghsAndSelfMediclaim = annualRghs + (deductionsOld.sec80D_MediclaimSelf || 0);
  const selfLimit = profile.isSeniorCitizen ? 50000 : 25000;
  const allowedSelf80D = Math.min(selfLimit, rghsAndSelfMediclaim);

  const parentsLimit = deductionsOld.sec80D_ParentsSenior ? 50000 : 25000;
  const allowedParents80D = Math.min(parentsLimit, deductionsOld.sec80D_MediclaimParents || 0);
  const old_sec80D = allowedSelf80D + allowedParents80D;

  // Section 24(b) Home Loan Interest (Max 2,00,000 for self occupied)
  const old_sec24b_homeLoan = Math.min(200000, deductionsOld.sec24b_HomeLoanInterest || 0);

  // Section 80U Divyang Self
  let old_sec80U_divyang = 0;
  if (profile.isDivyangSelf) {
    old_sec80U_divyang = profile.divyangSeveritySelf === '80plus' ? 125000 : 75000;
  }

  // Section 80DD Dependent Divyang
  let old_sec80DD_dependent = 0;
  if (profile.hasDivyangDependent) {
    old_sec80DD_dependent = profile.divyangSeverityDependent === '80plus' ? 125000 : 75000;
  }

  // Savings interest deduction (80TTA / 80TTB)
  const allowed80TTA = profile.isSeniorCitizen
    ? Math.min(50000, deductionsOld.bankSavingInterest + deductionsOld.fdOtherInterest)
    : Math.min(10000, deductionsOld.bankSavingInterest);

  // Other Deductions
  const old_otherDeductions = 
    (deductionsOld.sec80E_EduLoanInterest || 0) +
    (deductionsOld.sec80G_Donations || 0) +
    (deductionsOld.sec80GGC_PoliticalDonation || 0) +
    (deductionsOld.sec80DDB_MedicalTreatment || 0) +
    allowed80TTA +
    (deductionsOld.otherDeductionsChapVIA || 0);

  // Total Chapter VI-A Deductions
  const totalChapterVIA = 
    old_sec80C_totalAllowed +
    old_sec80CCD1B +
    old_sec80D +
    old_sec80U_divyang +
    old_sec80DD_dependent +
    old_otherDeductions;

  // Income before deductions (Gross minus HRA exempt)
  const salaryAfterHra = Math.max(0, grossTotalIncome - hraCalc.exemptHra);
  const old_totalDeductions = old_standardDeduction + old_sec24b_homeLoan + totalChapterVIA;
  const old_taxableIncome = Math.max(0, salaryAfterHra - old_totalDeductions);
  const oldCalc = calculateOldRegimeTax(old_taxableIncome, profile.isSeniorCitizen);

  // Comparison
  const diff = Math.abs(newCalc.totalTax - oldCalc.totalTax);
  let betterRegime: 'NEW' | 'OLD' | 'EQUAL' = 'EQUAL';
  let suggestion = '';

  if (newCalc.totalTax < oldCalc.totalTax) {
    betterRegime = 'NEW';
    suggestion = `आपको नई कर व्यवस्था (New Tax Regime) चुननी चाहिए। इसमें आपको ₹${diff.toLocaleString('en-IN')} का शुद्ध लाभ होगा!`;
  } else if (oldCalc.totalTax < newCalc.totalTax) {
    betterRegime = 'OLD';
    suggestion = `आपको पुरानी कर व्यवस्था (Old Tax Regime) चुननी चाहिए। आपकी कटौतियों के कारण आपको ₹${diff.toLocaleString('en-IN')} का शुद्ध लाभ होगा!`;
  } else {
    betterRegime = 'EQUAL';
    suggestion = `दोनों कर व्यवस्थाओं में आपका देय आयकर शून्य अथवा समान (₹${newCalc.totalTax.toLocaleString('en-IN')}) है। आप बिना रसीद की झंझट के New Regime चुन सकते हैं।`;
  }

  return {
    grossTotalIncome,
    calculatedHraExemption: hraCalc.exemptHra,
    minRentReceiptRequired: hraCalc.minRentNeededForFullHra,
    // New
    new_standardDeduction,
    new_taxableIncome,
    new_taxBeforeRebate: newCalc.taxBeforeRebate,
    new_rebate87A: newCalc.rebate87A,
    new_taxAfterRebate: newCalc.taxAfterRebate,
    new_cess: newCalc.cess,
    new_totalTaxPayable: newCalc.totalTax,
    // Old
    old_standardDeduction,
    old_sec80C_totalAllowed,
    old_sec80C_gpf: annualGpf,
    old_sec80C_si: annualSi,
    old_sec80C_others: sec80C_others,
    old_sec80CCD1B,
    old_sec80D,
    old_sec24b_homeLoan,
    old_sec80U_divyang,
    old_sec80DD_dependent,
    old_otherDeductions,
    old_totalDeductions,
    old_taxableIncome,
    old_taxBeforeRebate: oldCalc.taxBeforeRebate,
    old_rebate87A: oldCalc.rebate87A,
    old_taxAfterRebate: oldCalc.taxAfterRebate,
    old_cess: oldCalc.cess,
    old_totalTaxPayable: oldCalc.totalTax,
    // Comp
    differenceAmount: diff,
    betterRegime,
    savingSuggestion: suggestion
  };
}
