export type Language = 'en' | 'ar';

export type TruckTypeNormalized = 'Jumbo' | 'Flatbed' | 'Lowbed' | 'Other';

export type BiMonthlyMode = 'rolling12' | 'calendarYear';

export type TimeScope = 'last12m' | 'all' | '2026' | '2025' | '2024' | '2023';

export interface RawVendorRecord {
  id: string;
  vendorName: string;
  dateStr: string;
  dateObj: Date;
  year: number;
  month: number; // 1-12
  dues: number;
  rawTruckType: string;
  truckType: TruckTypeNormalized;
  /** Calendar bi-monthly index: 0 (Jan-Feb) to 5 (Nov-Dec) */
  calendarBiMonthIndex: number;
  /** Rolling bi-monthly bucket relative to reference date (Oct 25, 2026):
   *  0: 0–2 Months (Sep–Oct 2026)
   *  1: 2–4 Months (Jul–Aug 2026)
   *  2: 4–6 Months (May–Jun 2026)
   *  3: 6–8 Months (Mar–Apr 2026)
   *  4: 8–10 Months (Jan–Feb 2026)
   *  5: 10–12 Months (Nov–Dec 2025)
   *  6: > 12 Months (Older than Nov 2025) or Future
   */
  rollingBiMonthIndex: number;
  daysDiffFromRef: number;
}

export interface BiMonthlyBucketDef {
  index: number;
  key: string;
  labelEn: string;
  labelAr: string;
  subLabelEn: string;
  subLabelAr: string;
}

export interface VendorBiMonthlyRow {
  vendorName: string;
  invoiceCount: number;
  truckTypes: TruckTypeNormalized[];
  buckets: number[]; // length 6 or 7 depending on mode
  total12M: number; // sum of first 6 buckets (2M to 12M)
  olderOrOtherTotal: number;
  grandTotal: number;
  sharePercent: number;
}

export interface CumulativeHorizonItem {
  months: number; // 2, 4, 6, 8, 10, 12
  labelEn: string;
  labelAr: string;
  rangeLabelEn: string;
  rangeLabelAr: string;
  periodDues: number; // dues inside just that 2-month slice
  cumulativeDues: number; // cumulative dues from 0 up to N months
  shareOf12M: number;
  invoiceCount: number;
}
