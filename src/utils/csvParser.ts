import {
  BiMonthlyMode,
  Language,
  RawVendorRecord,
  TruckTypeNormalized,
  VendorBiMonthlyRow,
} from '../types/dashboard';
import {
  CALENDAR_BIMONTHLY_BUCKETS,
  ROLLING_BIMONTHLY_BUCKETS,
  getTruckTypeLabel,
  getVendorDisplayName,
} from './i18n';

/**
 * Parses RFC 4180 CSV content including quoted fields with commas (e.g. "446,880.00")
 */
export function parseCsvString(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const cleanText = csvText.replace(/^\uFEFF/, '');

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    const nextCh = cleanText[i + 1];

    if (inQuotes) {
      if (ch === '"' && nextCh === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (ch === '\r' && nextCh === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((cell) => cell !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        currentRow.push(currentField.trim());
        if (currentRow.some((cell) => cell !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += ch;
      }
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((cell) => cell !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function normalizeTruckType(raw: string): TruckTypeNormalized {
  const lower = (raw || '').trim().toLowerCase();
  if (lower.includes('jumbo') || lower.includes('جامبو')) return 'Jumbo';
  if (lower.includes('flatbed') || lower.includes('flat') || lower.includes('سطحة')) return 'Flatbed';
  if (lower.includes('lowbed') || lower.includes('low') || lower.includes('لوبد')) return 'Lowbed';
  return 'Other';
}

/**
 * Reference anchor is Oct 2026 (year 2026, month 10) matching the current date & sheet latest cycle.
 * Rolling 2-month buckets:
 * 0: Sep–Oct 2026 (0–2 Months)
 * 1: Jul–Aug 2026 (2–4 Months)
 * 2: May–Jun 2026 (4–6 Months)
 * 3: Mar–Apr 2026 (6–8 Months)
 * 4: Jan–Feb 2026 (8–10 Months)
 * 5: Nov–Dec 2025 (10–12 Months)
 * 6: Older than Nov 2025 or outside 12M window
 */
export function computeRollingBiMonthIndex(year: number, month: number): number {
  const refTotalMonths = 2026 * 12 + 10; // Oct 2026
  const itemTotalMonths = year * 12 + month;
  const diffMonths = refTotalMonths - itemTotalMonths;

  if (diffMonths >= 0 && diffMonths <= 1) return 0; // Sep - Oct 2026 (0-2M)
  if (diffMonths >= 2 && diffMonths <= 3) return 1; // Jul - Aug 2026 (2-4M)
  if (diffMonths >= 4 && diffMonths <= 5) return 2; // May - Jun 2026 (4-6M)
  if (diffMonths >= 6 && diffMonths <= 7) return 3; // Mar - Apr 2026 (6-8M)
  if (diffMonths >= 8 && diffMonths <= 9) return 4; // Jan - Feb 2026 (8-10M)
  if (diffMonths >= 10 && diffMonths <= 11) return 5; // Nov - Dec 2025 (10-12M)
  return 6; // > 12 Months or Future
}

export function parseVendorRecords(csvText: string): RawVendorRecord[] {
  const rawRows = parseCsvString(csvText);
  if (rawRows.length <= 1) return [];

  // Detect header row
  const header = rawRows[0].map((h) => h.toLowerCase().trim());
  const vendorIdx = Math.max(
    0,
    header.findIndex((h) => h.includes('vendor') || h.includes('name') || h.includes('مورد'))
  );
  const dateIdx =
    header.findIndex((h) => h.includes('date') || h.includes('تاريخ')) !== -1
      ? header.findIndex((h) => h.includes('date') || h.includes('تاريخ'))
      : 1;
  const duesIdx =
    header.findIndex((h) => h.includes('due') || h.includes('amount') || h.includes('مستحقات')) !== -1
      ? header.findIndex((h) => h.includes('due') || h.includes('amount') || h.includes('مستحقات'))
      : 2;
  const truckIdx =
    header.findIndex((h) => h.includes('truck') || h.includes('tybe') || h.includes('type') || h.includes('شاحن')) !== -1
      ? header.findIndex((h) => h.includes('truck') || h.includes('tybe') || h.includes('type') || h.includes('شاحن'))
      : 3;

  const refDate = new Date(2026, 9, 25); // Oct 25, 2026
  const records: RawVendorRecord[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (row.length < 3) continue;

    const vendorName = (row[vendorIdx] || '').trim();
    const dateStr = (row[dateIdx] || '').trim();
    const duesRaw = (row[duesIdx] || '0').replace(/,/g, '').replace(/[^0-9.-]/g, '');
    const rawTruckType = (row[truckIdx] || '').trim();

    if (!vendorName || !dateStr) continue;

    const dues = parseFloat(duesRaw);
    if (isNaN(dues)) continue;

    // Parse date M/D/YYYY or YYYY-MM-DD
    let year = 2026;
    let month = 1;
    let day = 1;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        month = parseInt(parts[0], 10) || 1;
        day = parseInt(parts[1], 10) || 1;
        year = parseInt(parts[2], 10) || 2026;
      }
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0], 10) || 2026;
        month = parseInt(parts[1], 10) || 1;
        day = parseInt(parts[2], 10) || 1;
      }
    }

    const dateObj = new Date(year, month - 1, day);
    const calendarBiMonthIndex = Math.min(5, Math.max(0, Math.floor((month - 1) / 2)));
    const rollingBiMonthIndex = computeRollingBiMonthIndex(year, month);
    const daysDiffFromRef = Math.round((refDate.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

    records.push({
      id: `rec-${i}-${vendorName.slice(0, 6)}-${dateStr}`,
      vendorName,
      dateStr,
      dateObj,
      year,
      month,
      dues,
      rawTruckType,
      truckType: normalizeTruckType(rawTruckType),
      calendarBiMonthIndex,
      rollingBiMonthIndex,
      daysDiffFromRef,
    });
  }

  return records;
}

/**
 * Triggers a browser CSV download with UTF-8 BOM for full Arabic & English compatibility in Excel
 */
export function downloadCsvFile(filename: string, rows: (string | number)[][]) {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBiMonthlyMatrixToCsv(
  matrixRows: VendorBiMonthlyRow[],
  mode: BiMonthlyMode,
  lang: Language
) {
  const buckets = mode === 'rolling12' ? ROLLING_BIMONTHLY_BUCKETS : CALENDAR_BIMONTHLY_BUCKETS;
  const bucketHeaders = buckets.map((b) =>
    lang === 'ar' ? `${b.labelAr} (${b.subLabelAr})` : `${b.labelEn} (${b.subLabelEn})`
  );

  const headerRow =
    lang === 'ar'
      ? [
          'اسم المورد (Vendor Name)',
          'نوع الشاحنة (Truck Tybe)',
          'عدد العمليات',
          ...bucketHeaders,
          ...(mode === 'rolling12' ? ['أكثر من ١٢ شهر / أخرى'] : []),
          'إجمالي ١٢ شهر',
          'الإجمالي العام للمستحقات',
          'النسبة المئوية %',
        ]
      : [
          'Vendor Name',
          'Truck Type (Truck Tybe)',
          'Invoice Count',
          ...bucketHeaders,
          ...(mode === 'rolling12' ? ['> 12 Months / Other'] : []),
          '12-Month Total Dues',
          'Grand Total Dues',
          'Share %',
        ];

  const dataRows = matrixRows.map((r) => [
    getVendorDisplayName(r.vendorName, lang),
    r.truckTypes.map((t) => getTruckTypeLabel(t, lang)).join(' / '),
    r.invoiceCount,
    ...r.buckets.slice(0, 6).map((v) => v.toFixed(2)),
    ...(mode === 'rolling12' ? [r.olderOrOtherTotal.toFixed(2)] : []),
    r.total12M.toFixed(2),
    r.grandTotal.toFixed(2),
    `${r.sharePercent.toFixed(2)}%`,
  ]);

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadCsvFile(`vendor_dues_bimonthly_matrix_${mode}_${dateTag}.csv`, [headerRow, ...dataRows]);
}

export function exportFilteredLedgerToCsv(records: RawVendorRecord[], lang: Language) {
  const headerRow =
    lang === 'ar'
      ? [
          'اسم المورد (Vendor Name)',
          'التاريخ (Date)',
          'قيمة المستحقات (Dues)',
          'نوع الشاحنة (Truck Tybe)',
          'فترة الشهرين التقويمية',
          'فترة عمر المستحقات (٢-١٢ شهر)',
          'السنة',
        ]
      : [
          'Vendor Name',
          'Date',
          'Dues',
          'Truck Tybe',
          'Calendar 2-Month Period',
          'Rolling 2-12M Bucket',
          'Year',
        ];

  const dataRows = records.map((rec) => {
    const calBucket = CALENDAR_BIMONTHLY_BUCKETS[rec.calendarBiMonthIndex];
    const rollBucket =
      rec.rollingBiMonthIndex < 6 ? ROLLING_BIMONTHLY_BUCKETS[rec.rollingBiMonthIndex] : null;

    return [
      getVendorDisplayName(rec.vendorName, lang),
      rec.dateStr,
      rec.dues.toFixed(2),
      getTruckTypeLabel(rec.truckType, lang),
      lang === 'ar' ? calBucket.labelAr : calBucket.labelEn,
      rollBucket
        ? lang === 'ar'
          ? `${rollBucket.labelAr} (${rollBucket.subLabelAr})`
          : `${rollBucket.labelEn} (${rollBucket.subLabelEn})`
        : lang === 'ar'
        ? 'أكثر من ١٢ شهر'
        : '> 12 Months',
      rec.year,
    ];
  });

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadCsvFile(`vendor_dues_filtered_ledger_${dateTag}.csv`, [headerRow, ...dataRows]);
}
