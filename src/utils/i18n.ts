import { BiMonthlyBucketDef, Language, TruckTypeNormalized } from '../types/dashboard';

export const DEFAULT_GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAh8fv75hNsVdRPZZw-lzISbF0--Gj3NPEj3eTyzjwU3uaAexAfykgbzRvM4tzN1HJoZguyhPIvVLR/pub?gid=0&single=true&output=csv';

export const ROLLING_BIMONTHLY_BUCKETS: BiMonthlyBucketDef[] = [
  {
    index: 0,
    key: '0_2m',
    labelEn: '0–2 Months',
    labelAr: '٠ – ٢ شهر',
    subLabelEn: 'Sep – Oct 2026',
    subLabelAr: 'سبتمبر – أكتوبر ٢٠٢٦',
  },
  {
    index: 1,
    key: '2_4m',
    labelEn: '2–4 Months',
    labelAr: '٢ – ٤ أشهر',
    subLabelEn: 'Jul – Aug 2026',
    subLabelAr: 'يوليو – أغسطس ٢٠٢٦',
  },
  {
    index: 2,
    key: '4_6m',
    labelEn: '4–6 Months',
    labelAr: '٤ – ٦ أشهر',
    subLabelEn: 'May – Jun 2026',
    subLabelAr: 'مايو – يونيو ٢٠٢٦',
  },
  {
    index: 3,
    key: '6_8m',
    labelEn: '6–8 Months',
    labelAr: '٦ – ٨ أشهر',
    subLabelEn: 'Mar – Apr 2026',
    subLabelAr: 'مارس – أبريل ٢٠٢٦',
  },
  {
    index: 4,
    key: '8_10m',
    labelEn: '8–10 Months',
    labelAr: '٨ – ١٠ أشهر',
    subLabelEn: 'Jan – Feb 2026',
    subLabelAr: 'يناير – فبراير ٢٠٢٦',
  },
  {
    index: 5,
    key: '10_12m',
    labelEn: '10–12 Months',
    labelAr: '١٠ – ١٢ شهر',
    subLabelEn: 'Nov – Dec 2025',
    subLabelAr: 'نوفمبر – ديسمبر ٢٠٢٥',
  },
];

export const CALENDAR_BIMONTHLY_BUCKETS: BiMonthlyBucketDef[] = [
  {
    index: 0,
    key: 'jan_feb',
    labelEn: 'Jan – Feb',
    labelAr: 'يناير – فبراير',
    subLabelEn: 'Months 1–2',
    subLabelAr: 'الشهر ١ – ٢',
  },
  {
    index: 1,
    key: 'mar_apr',
    labelEn: 'Mar – Apr',
    labelAr: 'مارس – أبريل',
    subLabelEn: 'Months 3–4',
    subLabelAr: 'الشهر ٣ – ٤',
  },
  {
    index: 2,
    key: 'may_jun',
    labelEn: 'May – Jun',
    labelAr: 'مايو – يونيو',
    subLabelEn: 'Months 5–6',
    subLabelAr: 'الشهر ٥ – ٦',
  },
  {
    index: 3,
    key: 'jul_aug',
    labelEn: 'Jul – Aug',
    labelAr: 'يوليو – أغسطس',
    subLabelEn: 'Months 7–8',
    subLabelAr: 'الشهر ٧ – ٨',
  },
  {
    index: 4,
    key: 'sep_oct',
    labelEn: 'Sep – Oct',
    labelAr: 'سبتمبر – أكتوبر',
    subLabelEn: 'Months 9–10',
    subLabelAr: 'الشهر ٩ – ١٠',
  },
  {
    index: 5,
    key: 'nov_dec',
    labelEn: 'Nov – Dec',
    labelAr: 'نوفمبر – ديسمبر',
    subLabelEn: 'Months 11–12',
    subLabelAr: 'الشهر ١١ – ١٢',
  },
];

export const VENDOR_ARABIC_NAMES: Record<string, string> = {
  'Abu Kastour Group for contracting a': 'مجموعة أبو كستور للمقاولات والتوريدات',
  'Agyad General Supplies & Services': 'أجياد للتوريدات العامة والخدمات',
  'Al Hatim for Transport Office': 'مكتب الحاتم للنقل',
  'Alekhlass for Transport': 'الإخلاص للنقل',
  'El Halawany Transport Company': 'شركة الحلواني للنقل',
  'El Sewedy Land Transport': 'السويدي للنقل البري',
  'Eyadco Estel for the supply of buil': 'إيادكو ستيل لتوريد مواد البناء',
  'For land transport of goods by car': 'للنقل البري للبضائع بالسيارات',
  'Hamdi Mahmoud Diab Ghattas': 'حمدي محمود دياب غطاس',
  'Hasbu Motor Transport Office': 'مكتب حسبو للنقل بالسيارات',
  'Meshel Mahfouz Atallah Ibrahim': 'ميشيل محفوظ عطا الله إبراهيم',
  'Naqla For Transport Services': 'نقلة لخدمات النقل',
  'Nile Corporation for the transport': 'مؤسسة النيل للنقل',
  'Salam Transport & Supplies': 'السلام للنقل والتوريدات',
  'shiftology': 'شيفتولوجي (Shiftology)',
  'Smart home for import, export and c': 'سمارت هوم للاستيراد والتصدير',
  'Sobhi Gerges Rizk Yaqoub': 'صبحي جرجس رزق يعقوب',
  'Transportation Systems Specialist S': 'متخصصو أنظمة النقل',
  'Trukker Any Truck Any Time Any Wher': 'تركر للنقل البري (TruKKer)',
  'Twins transport': 'توينز للنقل (Twins Transport)',
};

export function getVendorDisplayName(vendorName: string, lang: Language): string {
  if (lang === 'ar' && VENDOR_ARABIC_NAMES[vendorName]) {
    return `${VENDOR_ARABIC_NAMES[vendorName]} (${vendorName})`;
  }
  return vendorName;
}

export function getVendorShortName(vendorName: string, lang: Language): string {
  if (lang === 'ar' && VENDOR_ARABIC_NAMES[vendorName]) {
    return VENDOR_ARABIC_NAMES[vendorName];
  }
  return vendorName;
}

export function getTruckTypeLabel(truckType: TruckTypeNormalized, lang: Language): string {
  if (lang === 'ar') {
    switch (truckType) {
      case 'Jumbo':
        return 'جامبو (Jumbo)';
      case 'Flatbed':
        return 'سطحة (Flatbed)';
      case 'Lowbed':
        return 'لوبد (Lowbed)';
      default:
        return 'أخرى (Other)';
    }
  }
  return truckType;
}

export function formatAmount(val: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val || 0);
}

export function formatCompactAmount(val: number, lang: Language): string {
  if (Math.abs(val) >= 1_000_000) {
    const m = (val / 1_000_000).toFixed(2);
    return lang === 'ar' ? `${m} مليون` : `${m}M`;
  }
  if (Math.abs(val) >= 1_000) {
    const k = (val / 1_000).toFixed(1);
    return lang === 'ar' ? `${k} ألف` : `${k}K`;
  }
  return formatAmount(val, 0);
}

export const TRANSLATIONS = {
  en: {
    brandTitle: 'TransLedger Vendor Dues',
    navOverview: 'Overview',
    navBiMonthly: 'Bi-Monthly Matrix (2–12M)',
    navCharts: 'Charts & Analytics',
    navLedger: 'Transactions Ledger',
    primaryActionExport: 'Export Analysis CSV',
    workspaceSubtitle: 'Transportation Vendors Financial Dues & Bi-Monthly Aging Analysis',
    connectedSheet: 'Connected to Google Sheets CSV',
    customCsvActive: 'Custom CSV File Loaded',
    fallbackSnapshotActive: 'Live Snapshot Active',
    autoSyncEvery30s: 'Auto-refresh every 30s',
    nextSyncIn: 'Next update in',
    seconds: 's',
    syncNow: 'Sync Now',
    syncing: 'Syncing...',
    lastUpdated: 'Last synced',
    pauseSync: 'Pause 30s Sync',
    resumeSync: 'Resume 30s Sync',
    dataSourceSettings: 'Sheet URL / Upload CSV',
    embedGoogleSites: 'Google Sites Embed',
    switchLangLabel: 'العربية',
    // Filters
    filterScopeLabel: 'Time Horizon',
    scopeLast12M: 'Last 12 Months (Rolling 2–12M)',
    scopeYear2026: 'Year 2026 (Bi-Monthly)',
    scopeYear2025: 'Year 2025 (Bi-Monthly)',
    scopeYear2024: 'Year 2024 (Bi-Monthly)',
    scopeYear2023: 'Year 2023 (Bi-Monthly)',
    scopeAllTime: 'All Years (2023–2027)',
    filterTruckType: 'Truck Type',
    allTrucks: 'All Truck Types',
    filterVendor: 'Transportation Vendor',
    allVendors: 'All Vendors',
    filterBiMonthSlice: '2-Month Window Filter',
    allPeriods: 'All 2-Month Windows',
    searchPlaceholder: 'Search vendor name, date, or amount...',
    resetFilters: 'Reset Filters',
    dateFrom: 'From Date',
    dateTo: 'To Date',
    // KPI Strip
    kpiTotalDues: 'Total Filtered Dues',
    kpiLast12MDues: 'Last 12 Months Dues (0–12M)',
    kpiRecent2MDues: 'Current 2-Month Dues (0–2M)',
    kpiActiveVendors: 'Active Vendors & Invoices',
    invoicesUnit: 'invoices',
    vendorsUnit: 'vendors',
    shareOfTotal: 'of total dues',
    topVendorLabel: 'Top Vendor',
    dominantTruckLabel: 'Primary Fleet',
    // Cumulative 2-to-12 Month Horizon
    situationTitle: 'Current Situation of Dues Over Every 2 Months to 12 Months',
    situationSubtitle:
      'Cumulative & discrete bi-monthly progression showing how vendor obligations accumulate from 2 months up to a full 12-month cycle. Click any interval to filter.',
    cumulativeLabel: 'Cumulative up to',
    discreteSliceLabel: 'In 2-month window',
    months2: 'Up to 2 Months',
    months4: 'Up to 4 Months',
    months6: 'Up to 6 Months',
    months8: 'Up to 8 Months',
    months10: 'Up to 10 Months',
    months12: 'Full 12 Months',
    // Bi-Monthly Table
    biMonthlyTableTitle: 'Transportation Vendor Dues Bi-Monthly Matrix (Each 2 Months)',
    biMonthlyTableSubtitle:
      'Detailed breakdown of vendor dues across 2-month intervals for the last year and selected periods.',
    modeRolling12: 'Rolling 2–12 Months (0–2M to 10–12M)',
    modeCalendarYear: 'Calendar Bi-Monthly (Jan–Feb to Nov–Dec)',
    colVendor: 'Vendor Name',
    colTruckTypes: 'Truck Type',
    colInvoices: 'Entries',
    colOlderDues: 'Other / >12M',
    colTotal12M: '12-Month Total',
    colGrandTotal: 'Total Dues',
    colShare: 'Share %',
    tableGrandTotal: 'Grand Total (All Matching Vendors)',
    exportMatrixBtn: 'Export Bi-Monthly Table (CSV)',
    exportSummaryBtn: 'Export Vendor Summary (CSV)',
    exportFullLedgerBtn: 'Export Filtered Ledger (CSV)',
    // Charts
    chartBiMonthlyTitle: 'Bi-Monthly Dues Progression by Truck Type (Every 2 Months)',
    chartBiMonthlySubtitle: 'Stacked bar & cumulative curve across 2-month intervals',
    chartTruckPieTitle: 'Dues Distribution by Truck Type (Truck Tybe)',
    chartTruckPieSubtitle: 'Click any truck segment to filter the entire dashboard',
    chartTopVendorsTitle: 'Top Transportation Vendors by Total Dues',
    chartTopVendorsSubtitle: 'Horizontal comparison of vendor obligations (click bar to filter)',
    stackedByTruck: 'Stacked by Truck Type',
    singleBarTotal: 'Total + Cumulative Curve',
    cumulativeLineName: 'Cumulative Dues',
    // Ledger
    ledgerTitle: 'Detailed Vendor Dues Ledger & Custom Exports',
    ledgerSubtitle: 'Individual shipment & invoice dues synchronized from Google Sheets',
    colDate: 'Invoice Date',
    colPeriodBucket: '2-Month Window',
    colRollingHorizon: 'Aging Horizon',
    colDuesAmount: 'Dues Amount',
    showingRows: 'Showing',
    ofRows: 'of',
    recordsLabel: 'records',
    prevPage: 'Previous',
    nextPage: 'Next',
    pageLabel: 'Page',
    noMatchingRecords: 'No vendor dues match the current filter selection.',
    clearAllFiltersBtn: 'Clear All Filters',
    // Modal: Data Source & CSV Upload
    dataSourceModalTitle: 'Google Sheets Live Connection & Custom CSV Import',
    dataSourceModalDesc:
      'This dashboard pulls live data every 30 seconds from your published Google Sheet CSV. You can also test another published Google Sheet CSV URL or upload a local CSV file.',
    sheetUrlLabel: 'Published Google Sheet CSV URL',
    applySheetUrlBtn: 'Connect & Sync Sheet',
    restoreDefaultSheetBtn: 'Restore Default Vendor Sheet',
    uploadCsvTitle: 'Or Upload a Custom CSV File for Instant Analysis',
    uploadCsvDesc: 'Expected columns: Vendor Name, Date (MM/DD/YYYY), Dues, Truck Tybe',
    selectCsvFileBtn: 'Choose CSV File',
    closeBtn: 'Close',
    // Modal: Google Sites Embed
    embedModalTitle: 'Google Sites Embed & Integration Guide',
    embedModalDesc:
      'This dashboard is engineered for direct embedding inside Google Sites with automatic responsive scaling, white canvas theme, and 30-second live Google Sheet synchronization.',
    embedUrlLabel: 'Option 1: Embed by URL in Google Sites (Recommended)',
    embedUrlSteps: 'In Google Sites, click Insert → Embed → By URL, and paste this application URL:',
    embedIframeLabel: 'Option 2: Embed Code (HTML <iframe>)',
    embedIframeSteps: 'In Google Sites, click Insert → Embed → Embed Code, and paste this snippet:',
    copyUrlBtn: 'Copy Dashboard URL',
    copyIframeBtn: 'Copy Embed HTML',
    copiedText: 'Copied!',
    priorHistoryLabel: '> 12 Months / Other',
  },
  ar: {
    brandTitle: 'لوحة مستحقات موردي النقل',
    navOverview: 'نظرة عامة',
    navBiMonthly: 'جدول كل شهرين (٢–١٢ شهر)',
    navCharts: 'الرسوم البيانية والتحليلات',
    navLedger: 'سجل المعاملات والتصدير',
    primaryActionExport: 'تصدير التحليل CSV',
    workspaceSubtitle: 'التحليل المالي الشامل لمستحقات مقاولي وموردي النقل البري على فترات كل شهرين حتى ١٢ شهراً',
    connectedSheet: 'متصل مباشر بملف Google Sheets',
    customCsvActive: 'تم تحميل ملف CSV مخصص',
    fallbackSnapshotActive: 'النسخة الحية نشطة',
    autoSyncEvery30s: 'تحديث تلقائي كل ٣٠ ثانية',
    nextSyncIn: 'التحديث القادم خلال',
    seconds: 'ث',
    syncNow: 'تحديث الآن',
    syncing: 'جاري المزامنة...',
    lastUpdated: 'آخر تحديث',
    pauseSync: 'إيقاف التحديث التلقائي',
    resumeSync: 'تفعيل التحديث كل ٣٠ث',
    dataSourceSettings: 'رابط الشيت / رفع CSV',
    embedGoogleSites: 'تضمين Google Sites',
    switchLangLabel: 'English',
    // Filters
    filterScopeLabel: 'النطاق الزمني',
    scopeLast12M: 'آخر ١٢ شهراً (كل شهرين ٢–١٢م)',
    scopeYear2026: 'سنة ٢٠٢٦ (كل شهرين)',
    scopeYear2025: 'سنة ٢٠٢٥ (كل شهرين)',
    scopeYear2024: 'سنة ٢٠٢٤ (كل شهرين)',
    scopeYear2023: 'سنة ٢٠٢٣ (كل شهرين)',
    scopeAllTime: 'جميع السنوات (٢٠٢٣–٢٠٢٧)',
    filterTruckType: 'نوع الشاحنة (Truck Tybe)',
    allTrucks: 'جميع أنواع الشاحنات',
    filterVendor: 'مورد النقل',
    allVendors: 'جميع الموردين',
    filterBiMonthSlice: 'فلتر فترة الشهرين',
    allPeriods: 'جميع فترات الشهرين',
    searchPlaceholder: 'ابحث باسم المورد أو التاريخ أو القيمة...',
    resetFilters: 'إعادة ضبط الفلاتر',
    dateFrom: 'من تاريخ',
    dateTo: 'إلى تاريخ',
    // KPI Strip
    kpiTotalDues: 'إجمالي المستحقات (حسب الفلتر)',
    kpiLast12MDues: 'مستحقات آخر ١٢ شهراً (٠–١٢ شهر)',
    kpiRecent2MDues: 'مستحقات آخر شهرين (٠–٢ شهر)',
    kpiActiveVendors: 'الموردون النشطون والفواتير',
    invoicesUnit: 'معاملة',
    vendorsUnit: 'مورد',
    shareOfTotal: 'من إجمالي المستحقات',
    topVendorLabel: 'أعلى مورد استحقاقاً',
    dominantTruckLabel: 'نوع الشاحنات الأعلى',
    // Cumulative 2-to-12 Month Horizon
    situationTitle: 'الوضع الحالي للمستحقات على مدار كل شهرين حتى ١٢ شهراً',
    situationSubtitle:
      'تحليل تراكمي وتفصيلي يوضح تطور المستحقات المالية للموردين كل شهرين (٢، ٤، ٦، ٨، ١٠، ١٢ شهراً). اضغط على أي فترة للتصفية.',
    cumulativeLabel: 'التراكمي حتى',
    discreteSliceLabel: 'خلال فترة الشهرين',
    months2: 'خلال شهرين (٢م)',
    months4: 'خلال ٤ أشهر',
    months6: 'خلال ٦ أشهر',
    months8: 'خلال ٨ أشهر',
    months10: 'خلال ١٠ أشهر',
    months12: 'خلال ١٢ شهراً كاملة',
    // Bi-Monthly Table
    biMonthlyTableTitle: 'جدول مستحقات موردي النقل لكل شهرين (تحليل سنوي وتراكمي)',
    biMonthlyTableSubtitle:
      'بيان تفصيلي لمستحقات كل مورد مقسمة إلى فترات كل شهرين على مدار العام مع النسب المئوية والإجماليات.',
    modeRolling12: 'فترات أعمار المستحقات (٠–٢ شهر إلى ١٠–١٢ شهر)',
    modeCalendarYear: 'الفترات التقويمية للعام (يناير–فبراير إلى نوفمبر–ديسمبر)',
    colVendor: 'اسم المورد',
    colTruckTypes: 'نوع الشاحنة',
    colInvoices: 'العمليات',
    colOlderDues: 'فترات أخرى / +١٢ش',
    colTotal12M: 'إجمالي ١٢ شهر',
    colGrandTotal: 'إجمالي المستحقات',
    colShare: 'النسبة %',
    tableGrandTotal: 'الإجمالي العام (لجميع الموردين المطابقين)',
    exportMatrixBtn: 'تصدير جدول كل شهرين (CSV)',
    exportSummaryBtn: 'تصدير ملخص الموردين (CSV)',
    exportFullLedgerBtn: 'تصدير سجل المعاملات (CSV)',
    // Charts
    chartBiMonthlyTitle: 'تطور المستحقات لكل شهرين حسب نوع الشاحنة',
    chartBiMonthlySubtitle: 'رسم بياني تفاعلي للأعمدة والمنحنى التراكمي على فترات كل شهرين',
    chartTruckPieTitle: 'توزيع المستحقات حسب نوع الشاحنة (Truck Tybe)',
    chartTruckPieSubtitle: 'اضغط على أي قطاع لتصفية لوحة البيانات بالكامل حسب نوع الشاحنة',
    chartTopVendorsTitle: 'أعلى موردي النقل حسب إجمالي المستحقات',
    chartTopVendorsSubtitle: 'مقارنة أفقية لمستحقات الموردين (اضغط على العمود لتصفية المورد)',
    stackedByTruck: 'مقسم حسب نوع الشاحنة',
    singleBarTotal: 'الإجمالي + المنحنى التراكمي',
    cumulativeLineName: 'المستحقات التراكمية',
    // Ledger
    ledgerTitle: 'سجل معاملات المستحقات التفصيلي والتصدير المخصص',
    ledgerSubtitle: 'جميع الفواتير والمستحقات المسحوبة مباشرة من Google Sheets',
    colDate: 'تاريخ الاستحقاق',
    colPeriodBucket: 'فترة الشهرين',
    colRollingHorizon: 'عمر المستحقات',
    colDuesAmount: 'قيمة المستحقات',
    showingRows: 'عرض',
    ofRows: 'من أصل',
    recordsLabel: 'سجل',
    prevPage: 'السابق',
    nextPage: 'التالي',
    pageLabel: 'صفحة',
    noMatchingRecords: 'لا توجد مستحقات مطابقة للفلاتر المحددة حالياً.',
    clearAllFiltersBtn: 'مسح جميع الفلاتر',
    // Modal: Data Source & CSV Upload
    dataSourceModalTitle: 'إعدادات الربط المباشر بـ Google Sheets ورفع ملفات CSV',
    dataSourceModalDesc:
      'تقوم اللوحة بسحب البيانات تلقائياً كل ٣٠ ثانية من رابط Google Sheet المنشور بصيغة CSV. يمكنك أيضاً تغيير الرابط أو رفع ملف CSV من جهازك.',
    sheetUrlLabel: 'رابط Google Sheet المنشور بصيغة CSV',
    applySheetUrlBtn: 'اتصال ومزامنة الآن',
    restoreDefaultSheetBtn: 'استعادة رابط الشيت الافتراضي',
    uploadCsvTitle: 'أو قم برفع ملف CSV مخصص للتحليل الفوري',
    uploadCsvDesc: 'الأعمدة المطلوبة: Vendor Name, Date, Dues, Truck Tybe',
    selectCsvFileBtn: 'اختر ملف CSV',
    closeBtn: 'إغلاق',
    // Modal: Google Sites Embed
    embedModalTitle: 'دليل التضمين في مواقع جوجل (Google Sites)',
    embedModalDesc:
      'تم تصميم هذه اللوحة باللون الأبيض وتنسيق متجاوب بالكامل لتعمل داخل Google Sites مع التحديث التلقائي كل ٣٠ ثانية.',
    embedUrlLabel: 'الطريقة ١: التضمين عبر الرابط في Google Sites (موصى به)',
    embedUrlSteps: 'في Google Sites اختر إدراج (Insert) ← تضمين (Embed) ← باستخدام عنوان URL، والصق الرابط التالي:',
    embedIframeLabel: 'الطريقة ٢: كود التضمين المباشر (HTML <iframe>)',
    embedIframeSteps: 'في Google Sites اختر إدراج (Insert) ← تضمين (Embed) ← كود التضمين (Embed Code)، والصق الكود:',
    copyUrlBtn: 'نسخ رابط اللوحة',
    copyIframeBtn: 'نسخ كود HTML',
    copiedText: 'تم النسخ!',
    priorHistoryLabel: 'أكثر من ١٢ شهر / أخرى',
  },
};
