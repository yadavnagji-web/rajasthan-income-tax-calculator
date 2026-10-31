export interface CustomColumn {
  id: string;
  label: string;
  type: 'allowance' | 'deduction';
}

export interface MonthlyPayRecord {
  monthKey: string;
  monthName: string;
  billType?: string;
  basicPay: number;
  daAmount: number;
  hraAmount: number;
  splPay: number;
  ccaAmount: number;
  bonus: number;
  daArrear: number;
  plSurrender: number;
  otherAllowances: number;
  grossSalary: number;
  gpfAmount: number;
  gpfLoan: number;
  siAmount: number;
  siLoan: number;
  rghsAmount: number;
  gisAmount: number;
  licSalary: number;
  pliAmount?: number;
  itTdsAmount: number;
  hitkariNidhi: number;
  otherDeductions: number;
  customFields?: Record<string, number>;
  totalDeductions: number;
  netPayable: number;
  billNo?: string;
  tvNo?: string;
}

export interface EmployeeProfile {
  empName: string;
  empId?: string;
  designation: string;
  schoolName: string;
  panNumber: string;
  pranNumber: string; // GPF No
  siNumber: string;
  bankAccount: string;
  mobileNo: string;
  payLevel: string; // e.g. 'L-11'
  currentBasic: number; // March basic e.g. 50800
  financialYear: string; // '2025-26'
  assessmentYear: string; // '2026-27'
  cityCategory: string; // 'Z'
  currentHraRate: number; // 10
  siMonthly: number; // 7000
  gisAmount: number; // 2100
  hasIncrement: boolean;
  incrementMonth: string; // 'jul'
  hasSurrender: boolean;
  surrenderMonth: number; // 4
  surrenderDays: number; // 15
  hasBonus: boolean;
  hasHitkari: boolean;
  ddoCode?: string;
  officeTan: string;
  ddoName: string;
}
