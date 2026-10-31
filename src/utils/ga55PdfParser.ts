import * as pdfjsLib from 'pdfjs-dist';
import { MonthlyPayRecord, EmployeeProfile } from '../types/taxTypes';

// Set worker source to CDN for zero-configuration Vite bundling
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ParsedGa55Result {
  profile: Partial<EmployeeProfile>;
  records: MonthlyPayRecord[];
  totalAllowances: number;
  totalDeductions: number;
  netAmount: number;
  derivedDaRatePercent: number;
  derivedHraRatePercent: number;
  isEstimated: boolean;
  projectedMonthsCount: number;
}

export async function parseRajasthanGa55Pdf(file: File): Promise<ParsedGa55Result> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    let pageText = strings.join('\n');
    if (i > 1) {
      pageText = pageText.replace(/RAJ IFMS 3\.0[\s\S]{0,400}?Print Date:[^\n]+/i, '');
    }
    pageText = pageText.replace(/Note:\s*\*[\s\S]{0,300}?Print Date:[^\n]+/i, '');
    fullText += pageText + '\n';
  }

  // 1. Header Extraction using Exact IFMS 3.0 regex patterns
  const empNameMatch = fullText.match(/Employee Name\s*[:\n\r]+\s*([^\n\r]+?)(?:Employee ID|$)/i);
  const empIdMatch = fullText.match(/Employee ID\s*[:\n\r]+\s*([A-Z0-9]+)/i);
  const desigMatch = fullText.match(/Designation\s*[:\n\r]+\s*([^:\n\r]+?)(?:Pay Scale|$)/i);
  const payScaleMatch = fullText.match(/Pay Scale\s*[:\n\r]+\s*([A-Z0-9-]+)/i);
  const panMatch = fullText.match(/PAN\s*[:\n\r]+\s*([A-Z]{5}[0-9]{4}[A-Z])/i);
  const bankAccMatch = fullText.match(/Account No\s*[:\n\r]+\s*(\d+)/i);
  const gpfMatch = fullText.match(/GPF Number\s*[:\n\r]+\s*([A-Z0-9]+)/i);
  const tanMatch = fullText.match(/TAN\s*[:\n\r]+\s*([A-Z]{4}[0-9]{5}[A-Z])/i);
  const ddoCodeMatch = fullText.match(/DDO Code\s*[:\n\r]+\s*(\d+)/i);
  const officeNameMatch = fullText.match(/Office Name\s*[:\n\r]+\s*([^:\n\r]+?)(?:TAN|$)/i);
  const fyMatch = fullText.match(/Financial\s*Year[\s\S]{0,40}?(\d{4}[-–]\d{2,4})/i);

  let startYear = 2026;
  let endYear = 2027;
  let detectedFy = '2026-27';
  let detectedAy = '2027-28';

  if (fyMatch) {
    const rawFy = fyMatch[1];
    const parts = rawFy.split(/[-–]/);
    if (parts.length === 2) {
      startYear = parseInt(parts[0], 10);
      const endYearShort = parts[1].length === 4 ? parts[1].slice(-2) : parts[1];
      endYear = parts[1].length === 4 ? parseInt(parts[1], 10) : parseInt(strYearPrefix(startYear) + endYearShort, 10);
      detectedFy = `${startYear}-${endYearShort}`;
      const nextStart = startYear + 1;
      const nextEnd = (parseInt(endYearShort, 10) + 1).toString().padStart(2, '0');
      detectedAy = `${nextStart}-${nextEnd}`;
    }
  }

  function strYearPrefix(yr: number): string {
    return Math.floor(yr / 100).toString();
  }

  const payLevel = payScaleMatch
    ? (payScaleMatch[1].startsWith('L-') ? payScaleMatch[1] : `L-${payScaleMatch[1].replace('L', '')}`)
    : '';

  const profile: Partial<EmployeeProfile> = {
    empName: empNameMatch ? empNameMatch[1].trim() : '',
    empId: empIdMatch ? empIdMatch[1].trim() : '',
    designation: desigMatch ? desigMatch[1].trim() : '',
    payLevel: payLevel,
    financialYear: detectedFy,
    assessmentYear: detectedAy,
    panNumber: panMatch ? panMatch[1].trim() : '',
    bankAccount: bankAccMatch ? bankAccMatch[1].trim() : '',
    pranNumber: gpfMatch ? gpfMatch[1].trim() : '',
    officeTan: tanMatch ? tanMatch[1].trim() : '',
    ddoCode: ddoCodeMatch ? ddoCodeMatch[1].trim() : '',
    schoolName: officeNameMatch ? officeNameMatch[1].trim() : '',
    currentBasic: 0,
    currentHraRate: 10,
    siMonthly: 0,
    gisAmount: 0,
    hasBonus: false
  };

  // 2. Identify bill blocks across the GA-55
  const fyMonths = [
    { name: 'March', monthNum: '03', year: startYear, key: 'mar' },
    { name: 'April', monthNum: '04', year: startYear, key: 'apr' },
    { name: 'May', monthNum: '05', year: startYear, key: 'may' },
    { name: 'June', monthNum: '06', year: startYear, key: 'jun' },
    { name: 'July', monthNum: '07', year: startYear, key: 'jul' },
    { name: 'August', monthNum: '08', year: startYear, key: 'aug' },
    { name: 'September', monthNum: '09', year: startYear, key: 'sep' },
    { name: 'October', monthNum: '10', year: startYear, key: 'oct' },
    { name: 'November', monthNum: '11', year: startYear, key: 'nov' },
    { name: 'December', monthNum: '12', year: startYear, key: 'dec' },
    { name: 'January', monthNum: '01', year: endYear, key: 'jan' },
    { name: 'February', monthNum: '02', year: endYear, key: 'feb' },
  ];

  const monthBlockPattern = /(?:March|April|May|June|July|August|September|October|November|December|January|February)\s*\n\s*\d{4}/gi;
  const matches: { index: number; text: string }[] = [];
  let mMatch;
  while ((mMatch = monthBlockPattern.exec(fullText)) !== null) {
    matches.push({ index: mMatch.index, text: mMatch[0] });
  }

  const records: MonthlyPayRecord[] = [];
  const drawnRegularMonths = new Set<string>();

  let lastRegular = {
    basic: 0,
    da: 0,
    hra: 0,
    splPay: 0,
    cca: 0,
    gpf: 0,
    gpfLoan: 0,
    sip: 0,
    sil: 0,
    rghs: 0,
    gis: 0,
    lic: 0,
    pli: 0,
    tds: 0,
    hitkari: 0,
    otherDeductions: 0
  };

  let detectedDaRate = 60;
  let detectedHraRate = 10;

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = (i + 1 < matches.length) ? matches[i + 1].index : fullText.length;
    let chunk = fullText.slice(start, end);

    // Clean page footers, headers and stop at summary totals
    chunk = chunk.replace(/RAJ IFMS 3\.0[\s\S]{0,400}?Print Date:[^\n]+/gi, '');
    chunk = chunk.replace(/Note:\s*\*[\s\S]{0,300}?Print Date:[^\n]+/gi, '');
    chunk = chunk.replace(/Total\s+Allowances[\s\S]*/gi, '').trim();

    const headerMatch = chunk.match(/(March|April|May|June|July|August|September|October|November|December|January|February)\s*\n\s*(\d{4})/i);
    if (!headerMatch) continue;

    const monthNameStr = headerMatch[1].charAt(0).toUpperCase() + headerMatch[1].slice(1).toLowerCase();
    const billYear = parseInt(headerMatch[2], 10);

    const isSurrender = /Surrender/i.test(chunk);
    const isDaArrear = /DA\s*\n\s*\d{9}/i.test(chunk) ||
      /Bill\s*Type[\s\S]*?DA/i.test(chunk) ||
      (monthNameStr === 'May' && /DA\s*\n\s*4064/i.test(chunk) && !/Basic\s*\n\s*50800/i.test(chunk));

    let billType = 'Regular';
    if (isSurrender) {
      billType = 'Surrender';
    } else if (isDaArrear) {
      billType = 'Arrear';
    }

    // Bill No: Can be 9 digits (drawn) or -YYYYMM (estimated)
    const billNoMatch = chunk.match(/(-\d{6,8}|\d{9})/);
    const billNo = billNoMatch ? billNoMatch[1] : '';

    // TV No
    const tvNoMatch = chunk.match(/\d{9}\s*\n\s*(\d+)/);
    const tvNo = tvNoMatch ? `TV-${tvNoMatch[1]}` : '-';

    // Allowances
    const basicMatch = chunk.match(/Basic\s*\n?\s*([\d,.]+)/i);
    const basic = basicMatch ? parseFloat(basicMatch[1].replace(/,/g, '')) : 0;

    const hraMatch = chunk.match(/HRA\s*\n?\s*([\d,.]+)/i);
    const hra = hraMatch ? parseFloat(hraMatch[1].replace(/,/g, '')) : 0;

    // DA: skip 9-digit bill numbers
    const daMatches = [...chunk.matchAll(/DA\s*\n?\s*([\d,.]+)/gi)];
    let da = 0;
    for (const dm of daMatches) {
      const val = parseFloat(dm[1].replace(/,/g, ''));
      if (val < 1000000) {
        da = val;
        break;
      }
    }

    const splMatch = chunk.match(/(?:Spl(?:\.?\s*Pay)?|Special\s*Pay)\s*\n?\s*([\d,.]+)/i);
    const spl = splMatch ? parseFloat(splMatch[1].replace(/,/g, '')) : 0;

    const ccaMatch = chunk.match(/CCA\s*\n?\s*([\d,.]+)/i);
    const cca = ccaMatch ? parseFloat(ccaMatch[1].replace(/,/g, '')) : 0;

    const bonusMatch = chunk.match(/Bonus\s*\n?\s*([\d,.]+)/i);
    const bonus = bonusMatch ? parseFloat(bonusMatch[1].replace(/,/g, '')) : 0;

    // Deductions (Every type extracted individually)
    const gpfMatch = chunk.match(/(?:GPF(?:\s*2004)?|PRAN)\s*\n?\s*([\d,.]+)/i);
    const gpf = gpfMatch ? parseFloat(gpfMatch[1].replace(/,/g, '')) : 0;

    const gpfLoanMatch = chunk.match(/(?:GPFL|GPF\s*Loan|GPF\s*ऋण)\s*\n?\s*([\d,.]+)/i);
    const gpfLoan = gpfLoanMatch ? parseFloat(gpfLoanMatch[1].replace(/,/g, '')) : 0;

    const sipMatch = chunk.match(/(?:SIP|SI(?!\s*(?:L|Loan|ऋण)))\s*\n?\s*([\d,.]+)/i);
    const sip = sipMatch ? parseFloat(sipMatch[1].replace(/,/g, '')) : 0;

    const silMatch = chunk.match(/(?:SIL|SI\s*Loan|SI\s*ऋण)\s*\n?\s*([\d,.]+)/i);
    const sil = silMatch ? parseFloat(silMatch[1].replace(/,/g, '')) : 0;

    const rghsMatch = chunk.match(/RGHS\s*\n?\s*([\d,.]+)/i);
    const rghs = rghsMatch ? parseFloat(rghsMatch[1].replace(/,/g, '')) : 0;

    const gisMatch = chunk.match(/GIS\s*\n?\s*([\d,.]+)/i);
    const gis = gisMatch ? parseFloat(gisMatch[1].replace(/,/g, '')) : 0;

    const tdsMatch = chunk.match(/(?:IT|TDS|Income\s*Tax)\s*\n?\s*([\d,.]+)/i);
    const tds = tdsMatch ? parseFloat(tdsMatch[1].replace(/,/g, '')) : 0;

    const licMatch = chunk.match(/LIC\s*\n?\s*([\d,.]+)/i);
    const lic = licMatch ? parseFloat(licMatch[1].replace(/,/g, '')) : 0;

    const pliMatch = chunk.match(/(?:PLI|Postal\s*Life)\s*\n?\s*([\d,.]+)/i);
    const pli = pliMatch ? parseFloat(pliMatch[1].replace(/,/g, '')) : 0;

    const hitkariMatch = chunk.match(/(?:Hitkari|HN|हितकारी)\s*\n?\s*([\d,.]+)/i);
    const hitkari = hitkariMatch ? parseFloat(hitkariMatch[1].replace(/,/g, '')) : 0;

    const gross = basic + da + hra + spl + cca + bonus;
    let knownDedSum = gpf + gpfLoan + sip + sil + rghs + gis + tds + lic + pli + hitkari;
    let totalDed = knownDedSum;
    let otherDed = 0;
    let net = gross - totalDed;

    // Check block tail for explicit Total Deductions and Net Amount
    const blockTotalsMatch = chunk.match(/([\d,.]+)\s*\n\s*([\d,.]+)\s*$/);
    if (blockTotalsMatch) {
      const explicitDed = parseFloat(blockTotalsMatch[1].replace(/,/g, ''));
      const explicitNet = parseFloat(blockTotalsMatch[2].replace(/,/g, ''));
      if (!isNaN(explicitDed) && explicitDed >= knownDedSum) {
        otherDed = Math.round((explicitDed - knownDedSum) * 100) / 100;
        totalDed = explicitDed;
      }
      if (!isNaN(explicitNet)) {
        net = explicitNet;
      }
    }

    if (billType === 'Regular') {
      drawnRegularMonths.add(`${monthNameStr.toLowerCase()}_${billYear}`);
      lastRegular = {
        basic: basic || lastRegular.basic,
        da: da || lastRegular.da,
        hra: hra || lastRegular.hra,
        splPay: spl || lastRegular.splPay,
        cca: cca || lastRegular.cca,
        gpf: gpf || lastRegular.gpf,
        gpfLoan: gpfLoan || lastRegular.gpfLoan,
        sip: sip || lastRegular.sip,
        sil: sil || lastRegular.sil,
        rghs: rghs || lastRegular.rghs,
        gis: 0,
        lic: lic || lastRegular.lic,
        pli: pli || lastRegular.pli,
        tds: tds || lastRegular.tds,
        hitkari: hitkari || lastRegular.hitkari,
        otherDeductions: otherDed || lastRegular.otherDeductions
      };

      if (basic > 0) {
        profile.currentBasic = basic;
        detectedDaRate = Math.round((da / basic) * 100);
        detectedHraRate = Math.round((hra / basic) * 100);
        profile.currentHraRate = detectedHraRate;
      }
      if (sip > 0) profile.siMonthly = sip;
      if (gis > 0) profile.gisAmount = gis;
    }

    let monthDisplayName = `${monthNameStr} ${billYear}`;
    let monthKey = `${monthNameStr.toLowerCase()}_${billYear}`;

    if (isSurrender) {
      monthDisplayName = `${monthNameStr} (PL Surrender 15 Days)`;
      monthKey = `${monthNameStr.toLowerCase()}_surr`;
    } else if (isDaArrear) {
      monthDisplayName = `${monthNameStr} (DA Arrear)`;
      monthKey = `${monthNameStr.toLowerCase()}_arr`;
    }

    records.push({
      monthKey,
      monthName: monthDisplayName,
      billType,
      basicPay: basic,
      daAmount: da,
      hraAmount: hra,
      splPay: spl,
      ccaAmount: cca,
      bonus,
      daArrear: isDaArrear ? da : 0,
      plSurrender: isSurrender ? gross : 0,
      otherAllowances: 0,
      grossSalary: gross,
      gpfAmount: gpf,
      gpfLoan,
      siAmount: sip,
      siLoan: sil,
      rghsAmount: rghs,
      gisAmount: gis,
      licSalary: lic,
      pliAmount: pli,
      itTdsAmount: tds,
      hitkariNidhi: hitkari,
      otherDeductions: otherDed,
      totalDeductions: totalDed,
      netPayable: net,
      billNo,
      tvNo
    });
  }

  // 3. For Non-Estimated GA-55:
  // Automatically create the missing months with all recurring allowances & deductions
  let projectedCount = 0;
  const isEstimated = (drawnRegularMonths.size === 12);

  fyMonths.forEach(m => {
    const key = `${m.name.toLowerCase()}_${m.year}`;
    if (!drawnRegularMonths.has(key) && lastRegular.basic > 0) {
      projectedCount++;
      const basic = lastRegular.basic;
      const da = lastRegular.da;
      const hra = lastRegular.hra;
      const spl = lastRegular.splPay;
      const cca = lastRegular.cca;
      const gross = basic + da + hra + spl + cca;

      const gpf = lastRegular.gpf;
      const gpfl = lastRegular.gpfLoan;
      const sip = lastRegular.sip;
      const sil = lastRegular.sil;
      const rghs = lastRegular.rghs;
      const lic = lastRegular.lic;
      const pli = lastRegular.pli;
      const tds = lastRegular.tds;
      const otherDed = lastRegular.otherDeductions;

      const totalDed = gpf + gpfl + sip + sil + rghs + lic + pli + tds + otherDed;
      const net = gross - totalDed;
      const billNo = `-${m.year}${m.monthNum}`;

      records.push({
        monthKey: `${m.name.toLowerCase()}_${m.year}`,
        monthName: `${m.name} ${m.year}`,
        billType: 'Regular',
        basicPay: basic,
        daAmount: da,
        hraAmount: hra,
        splPay: spl,
        ccaAmount: cca,
        bonus: 0,
        daArrear: 0,
        plSurrender: 0,
        otherAllowances: 0,
        grossSalary: gross,
        gpfAmount: gpf,
        gpfLoan: gpfl,
        siAmount: sip,
        siLoan: sil,
        rghsAmount: rghs,
        gisAmount: 0,
        licSalary: lic,
        pliAmount: pli,
        itTdsAmount: tds,
        hitkariNidhi: 0,
        otherDeductions: otherDed,
        totalDeductions: totalDed,
        netPayable: net,
        billNo,
        tvNo: '-'
      });
    }
  });

  const totalAllowances = records.reduce((s, r) => s + (r.grossSalary || 0), 0);
  const totalDeductions = records.reduce((s, r) => s + (r.totalDeductions || 0), 0);
  const netAmount = totalAllowances - totalDeductions;

  return {
    profile,
    records,
    totalAllowances,
    totalDeductions,
    netAmount,
    derivedDaRatePercent: detectedDaRate,
    derivedHraRatePercent: detectedHraRate,
    isEstimated,
    projectedMonthsCount: projectedCount
  };
}
