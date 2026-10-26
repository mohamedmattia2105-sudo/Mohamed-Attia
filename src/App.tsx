import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  Download,
  Search,
  RotateCcw,
  Globe,
  FileSpreadsheet,
  Code2,
} from 'lucide-react';
import {
  BiMonthlyMode,
  CumulativeHorizonItem,
  Language,
  RawVendorRecord,
  TimeScope,
  TruckTypeNormalized,
  VendorBiMonthlyRow,
} from './types/dashboard';
import {
  CALENDAR_BIMONTHLY_BUCKETS,
  DEFAULT_GOOGLE_SHEET_CSV_URL,
  ROLLING_BIMONTHLY_BUCKETS,
  TRANSLATIONS,
  formatAmount,
  getTruckTypeLabel,
  getVendorDisplayName,
  getVendorShortName,
} from './utils/i18n';
import {
  exportBiMonthlyMatrixToCsv,
  exportFilteredLedgerToCsv,
  parseVendorRecords,
} from './utils/csvParser';
import { BiMonthlySituationStrip } from './components/BiMonthlySituationStrip';
import {
  BiMonthlyChartDatum,
  InteractiveChartsSection,
  TopVendorChartDatum,
  TruckTypeChartDatum,
} from './components/InteractiveChartsSection';
import { BiMonthlyMatrixTable } from './components/BiMonthlyMatrixTable';
import { TransactionsLedger } from './components/TransactionsLedger';
import { DataSourceModal, GoogleSitesEmbedModal } from './components/Modals';

const TRUCK_COLOR_MAP: Record<TruckTypeNormalized, string> = {
  Jumbo: '#1D4ED8',
  Flatbed: '#0D9488',
  Lowbed: '#D97706',
  Other: '#64748B',
};

export function App() {
  // Language & Direction
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  // Live Google Sheets Sync State (every 30 seconds)
  const [sheetUrl, setSheetUrl] = useState<string>(DEFAULT_GOOGLE_SHEET_CSV_URL);
  const [records, setRecords] = useState<RawVendorRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(30);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [sourceSourceType, setSourceType] = useState<'google_sheet' | 'custom_csv' | 'snapshot'>('google_sheet');
  const [customFileName, setCustomFileName] = useState<string>('');

  // Interactive Filters
  const [timeScope, setTimeScope] = useState<TimeScope>('all');
  const [biMonthlyMode, setBiMonthlyMode] = useState<BiMonthlyMode>('rolling12');
  const [selectedTruckType, setSelectedTruckType] = useState<TruckTypeNormalized | 'all'>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedBiMonthSlice, setSelectedBiMonthSlice] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Modals
  const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);

  // Sync HTML dir attribute when language changes
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Fetch data from Google Sheet CSV (with fallback to local snapshot of the sheet)
  const fetchSheetData = useCallback(
    async (targetUrl: string, isBackground = false) => {
      if (!isBackground) {
        setSyncing(true);
      } else {
        setSyncing(true);
      }

      try {
        const separator = targetUrl.includes('?') ? '&' : '?';
        const bustUrl = `${targetUrl}${separator}_cb=${Date.now()}`;
        const response = await fetch(bustUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const csvText = await response.text();
        const parsed = parseVendorRecords(csvText);
        if (parsed.length > 0) {
          setRecords(parsed);
          setSourceType('google_sheet');
          setLastSyncedAt(
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
          setLoading(false);
          setSyncing(false);
          setCountdown(30);
          return;
        }
        throw new Error('Empty CSV response');
      } catch {
        // Fallback to local snapshot of the user's Google Sheet CSV
        try {
          const fallbackRes = await fetch('/vendor_dues_snapshot.csv');
          const fallbackText = await fallbackRes.text();
          const parsedFallback = parseVendorRecords(fallbackText);
          if (parsedFallback.length > 0) {
            setRecords(parsedFallback);
            setSourceType('snapshot');
            setLastSyncedAt(
              new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            );
          }
        } catch {
          // Keep existing records if any
        } finally {
          setLoading(false);
          setSyncing(false);
          setCountdown(30);
        }
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchSheetData(sheetUrl, false);
  }, [sheetUrl, fetchSheetData]);

  // 30-Second Live Auto-Refresh Interval
  useEffect(() => {
    if (!autoSyncEnabled || sourceSourceType === 'custom_csv') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchSheetData(sheetUrl, true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoSyncEnabled, sheetUrl, sourceSourceType, fetchSheetData]);

  // Handle TimeScope changes automatically adjusting BiMonthlyMode when appropriate
  const handleTimeScopeChange = (newScope: TimeScope) => {
    setTimeScope(newScope);
    setSelectedBiMonthSlice('all');
    if (newScope === 'last12m') {
      setBiMonthlyMode('rolling12');
    } else if (newScope === '2026' || newScope === '2025' || newScope === '2024' || newScope === '2023') {
      setBiMonthlyMode('calendarYear');
    }
  };

  const handleResetFilters = () => {
    setTimeScope('all');
    setSelectedTruckType('all');
    setSelectedVendor('all');
    setSelectedBiMonthSlice('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  // Distinct vendor list for dropdown
  const allVendorsList = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      map.set(r.vendorName, (map.get(r.vendorName) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);

  // Filtered records (excluding the 2-month slice filter so the 2-month strip and matrix columns show context, and then slice-filtered for ledger & KPIs)
  const baseFilteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Time Scope
      if (timeScope === 'last12m' && rec.rollingBiMonthIndex > 5) {
        return false;
      }
      if (timeScope === '2026' && rec.year !== 2026) return false;
      if (timeScope === '2025' && rec.year !== 2025) return false;
      if (timeScope === '2024' && rec.year !== 2024) return false;
      if (timeScope === '2023' && rec.year !== 2023) return false;

      // Truck Type
      if (selectedTruckType !== 'all' && rec.truckType !== selectedTruckType) {
        return false;
      }

      // Vendor
      if (selectedVendor !== 'all' && rec.vendorName !== selectedVendor) {
        return false;
      }

      // Date Range
      if (dateFrom) {
        const fromTime = new Date(dateFrom).getTime();
        if (!isNaN(fromTime) && rec.dateObj.getTime() < fromTime) return false;
      }
      if (dateTo) {
        const toTime = new Date(dateTo).getTime() + 86400000 - 1;
        if (!isNaN(toTime) && rec.dateObj.getTime() > toTime) return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const vendorEn = rec.vendorName.toLowerCase();
        const vendorAr = getVendorDisplayName(rec.vendorName, 'ar').toLowerCase();
        const dateMatch = rec.dateStr.toLowerCase().includes(q);
        const amountMatch = rec.dues.toString().includes(q);
        const truckMatch = rec.truckType.toLowerCase().includes(q);
        if (
          !vendorEn.includes(q) &&
          !vendorAr.includes(q) &&
          !dateMatch &&
          !amountMatch &&
          !truckMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    records,
    timeScope,
    selectedTruckType,
    selectedVendor,
    dateFrom,
    dateTo,
    searchQuery,
  ]);

  // Records including active 2-Month Slice filter
  const finalFilteredRecords = useMemo(() => {
    if (selectedBiMonthSlice === 'all') return baseFilteredRecords;
    return baseFilteredRecords.filter((rec) => {
      const idx =
        biMonthlyMode === 'rolling12'
          ? rec.rollingBiMonthIndex
          : rec.calendarBiMonthIndex;
      return idx === selectedBiMonthSlice;
    });
  }, [baseFilteredRecords, selectedBiMonthSlice, biMonthlyMode]);

  // Compute Cumulative 2-to-12 Month Horizon Strip ("current situation my dues over every 2 months to 12 months")
  const cumulativeHorizonItems: CumulativeHorizonItem[] = useMemo(() => {
    const sliceSums = [0, 0, 0, 0, 0, 0];
    const sliceCounts = [0, 0, 0, 0, 0, 0];

    for (const rec of baseFilteredRecords) {
      if (rec.rollingBiMonthIndex >= 0 && rec.rollingBiMonthIndex < 6) {
        sliceSums[rec.rollingBiMonthIndex] += rec.dues;
        sliceCounts[rec.rollingBiMonthIndex] += 1;
      }
    }

    const total12M = sliceSums.reduce((a, b) => a + b, 0);
    let runningTotal = 0;
    let runningCount = 0;

    const labelsEn = [
      t.months2,
      t.months4,
      t.months6,
      t.months8,
      t.months10,
      t.months12,
    ];
    const labelsAr = [
      TRANSLATIONS.ar.months2,
      TRANSLATIONS.ar.months4,
      TRANSLATIONS.ar.months6,
      TRANSLATIONS.ar.months8,
      TRANSLATIONS.ar.months10,
      TRANSLATIONS.ar.months12,
    ];

    return ROLLING_BIMONTHLY_BUCKETS.map((b, idx) => {
      runningTotal += sliceSums[idx];
      runningCount += sliceCounts[idx];
      return {
        months: (idx + 1) * 2,
        labelEn: labelsEn[idx],
        labelAr: labelsAr[idx],
        rangeLabelEn: `${b.labelEn} (${b.subLabelEn})`,
        rangeLabelAr: `${b.labelAr} (${b.subLabelAr})`,
        periodDues: sliceSums[idx],
        cumulativeDues: runningTotal,
        shareOf12M: total12M > 0 ? (runningTotal / total12M) * 100 : 0,
        invoiceCount: runningCount,
      };
    });
  }, [baseFilteredRecords, t]);

  // Compute Bi-Monthly Vendor Matrix Rows (for the Bi-Monthly Table)
  const vendorMatrixRows: VendorBiMonthlyRow[] = useMemo(() => {
    const map = new Map<
      string,
      {
        invoiceCount: number;
        truckSet: Set<TruckTypeNormalized>;
        buckets: number[];
        olderOrOther: number;
        grandTotal: number;
      }
    >();

    let overallTotal = 0;

    for (const rec of baseFilteredRecords) {
      overallTotal += rec.dues;
      let entry = map.get(rec.vendorName);
      if (!entry) {
        entry = {
          invoiceCount: 0,
          truckSet: new Set<TruckTypeNormalized>(),
          buckets: [0, 0, 0, 0, 0, 0],
          olderOrOther: 0,
          grandTotal: 0,
        };
        map.set(rec.vendorName, entry);
      }

      entry.invoiceCount += 1;
      entry.truckSet.add(rec.truckType);
      entry.grandTotal += rec.dues;

      if (biMonthlyMode === 'rolling12') {
        if (rec.rollingBiMonthIndex >= 0 && rec.rollingBiMonthIndex < 6) {
          entry.buckets[rec.rollingBiMonthIndex] += rec.dues;
        } else {
          entry.olderOrOther += rec.dues;
        }
      } else {
        entry.buckets[rec.calendarBiMonthIndex] += rec.dues;
      }
    }

    const rows: VendorBiMonthlyRow[] = [];
    for (const [vendorName, data] of map.entries()) {
      const total12M = data.buckets.reduce((a, b) => a + b, 0);
      rows.push({
        vendorName,
        invoiceCount: data.invoiceCount,
        truckTypes: Array.from(data.truckSet),
        buckets: data.buckets,
        total12M,
        olderOrOtherTotal: data.olderOrOther,
        grandTotal: data.grandTotal,
        sharePercent: overallTotal > 0 ? (data.grandTotal / overallTotal) * 100 : 0,
      });
    }

    return rows;
  }, [baseFilteredRecords, biMonthlyMode]);

  // Compute Chart 1: Bi-Monthly Progression Data
  const biMonthlyChartData: BiMonthlyChartDatum[] = useMemo(() => {
    const bucketDefs =
      biMonthlyMode === 'rolling12' ? ROLLING_BIMONTHLY_BUCKETS : CALENDAR_BIMONTHLY_BUCKETS;

    const items: BiMonthlyChartDatum[] = bucketDefs.map((b, idx) => ({
      index: idx,
      name: lang === 'ar' ? b.labelAr : b.labelEn,
      subLabel: lang === 'ar' ? b.subLabelAr : b.subLabelEn,
      Jumbo: 0,
      Flatbed: 0,
      Lowbed: 0,
      Other: 0,
      total: 0,
      cumulative: 0,
      count: 0,
    }));

    for (const rec of baseFilteredRecords) {
      const idx =
        biMonthlyMode === 'rolling12'
          ? rec.rollingBiMonthIndex
          : rec.calendarBiMonthIndex;

      if (idx >= 0 && idx < 6) {
        items[idx][rec.truckType] += rec.dues;
        items[idx].total += rec.dues;
        items[idx].count += 1;
      }
    }

    let running = 0;
    for (const item of items) {
      running += item.total;
      item.cumulative = running;
    }

    return items;
  }, [baseFilteredRecords, biMonthlyMode, lang]);

  // Compute Chart 2: Truck Type Pie / Donut Data
  const truckTypeChartData: TruckTypeChartDatum[] = useMemo(() => {
    const sums: Record<TruckTypeNormalized, { value: number; count: number }> = {
      Jumbo: { value: 0, count: 0 },
      Flatbed: { value: 0, count: 0 },
      Lowbed: { value: 0, count: 0 },
      Other: { value: 0, count: 0 },
    };

    let grand = 0;
    for (const rec of finalFilteredRecords) {
      sums[rec.truckType].value += rec.dues;
      sums[rec.truckType].count += 1;
      grand += rec.dues;
    }

    return (['Jumbo', 'Flatbed', 'Lowbed', 'Other'] as TruckTypeNormalized[])
      .filter((k) => sums[k].count > 0 || k !== 'Other')
      .map((truckType) => ({
        truckType,
        label: getTruckTypeLabel(truckType, lang),
        value: sums[truckType].value,
        count: sums[truckType].count,
        sharePercent: grand > 0 ? (sums[truckType].value / grand) * 100 : 0,
        color: TRUCK_COLOR_MAP[truckType],
      }));
  }, [finalFilteredRecords, lang]);

  // Compute Chart 3: Top Vendors Horizontal Bar Data
  const topVendorsChartData: TopVendorChartDatum[] = useMemo(() => {
    const vendorMap = new Map<
      string,
      {
        total: number;
        count: number;
        truckSums: Record<TruckTypeNormalized, number>;
      }
    >();

    let grand = 0;
    for (const rec of finalFilteredRecords) {
      grand += rec.dues;
      let v = vendorMap.get(rec.vendorName);
      if (!v) {
        v = {
          total: 0,
          count: 0,
          truckSums: { Jumbo: 0, Flatbed: 0, Lowbed: 0, Other: 0 },
        };
        vendorMap.set(rec.vendorName, v);
      }
      v.total += rec.dues;
      v.count += 1;
      v.truckSums[rec.truckType] += rec.dues;
    }

    return Array.from(vendorMap.entries())
      .map(([vendorName, d]) => {
        const dominantTruck = (
          Object.entries(d.truckSums).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Jumbo'
        ) as TruckTypeNormalized;
        const rawShort = getVendorShortName(vendorName, lang);
        const shortName = rawShort.length > 28 ? `${rawShort.slice(0, 26)}…` : rawShort;

        return {
          vendorName,
          shortName,
          total: d.total,
          count: d.count,
          sharePercent: grand > 0 ? (d.total / grand) * 100 : 0,
          dominantTruck,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [finalFilteredRecords, lang]);

  // KPI Summary Calculations
  const kpiStats = useMemo(() => {
    let totalFilteredDues = 0;
    let last12MDues = 0;
    let recent2MDues = 0;
    const vendorSet = new Set<string>();

    for (const rec of finalFilteredRecords) {
      totalFilteredDues += rec.dues;
      vendorSet.add(rec.vendorName);
      if (rec.rollingBiMonthIndex >= 0 && rec.rollingBiMonthIndex < 6) {
        last12MDues += rec.dues;
      }
      if (rec.rollingBiMonthIndex === 0) {
        recent2MDues += rec.dues;
      }
    }

    const topVendor = topVendorsChartData[0];
    const topTruck = [...truckTypeChartData].sort((a, b) => b.value - a.value)[0];

    return {
      totalFilteredDues,
      last12MDues,
      recent2MDues,
      activeVendorsCount: vendorSet.size,
      totalInvoicesCount: finalFilteredRecords.length,
      topVendor,
      topTruck,
    };
  }, [finalFilteredRecords, topVendorsChartData, truckTypeChartData]);

  const handleUploadCustomCsv = (csvText: string, fileName: string) => {
    const parsed = parseVendorRecords(csvText);
    if (parsed.length > 0) {
      setRecords(parsed);
      setSourceType('custom_csv');
      setCustomFileName(fileName);
      setLastSyncedAt(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Strictly Compliant 3-Zone Top Navigation Bar */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-30">
        {/* Zone 1: Brand Title (single text element, one line) */}
        <a
          href="#overview"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          {t.brandTitle}
        </a>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#overview"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navOverview}
          </a>
          <a
            href="#bimonthly-matrix"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navBiMonthly}
          </a>
          <a
            href="#interactive-charts"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navCharts}
          </a>
          <a
            href="#transactions-ledger"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navLedger}
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => exportBiMonthlyMatrixToCsv(vendorMatrixRows, biMonthlyMode, lang)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.primaryActionExport}
          </button>
        </div>
      </header>

      {/* Main Content Container (Designed for 1440px desktop & seamless Google Sites iframe embedding) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Workspace Control Bar: Live 30s Sync Status, Bilingual Switcher, Data Source, Google Sites Embed */}
        <section
          id="overview"
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {t.workspaceSubtitle}
            </h1>
            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono-tabular">
              <span className="font-medium text-slate-800">
                {sourceSourceType === 'custom_csv'
                  ? `${t.customCsvActive}: ${customFileName}`
                  : sourceSourceType === 'google_sheet'
                  ? t.connectedSheet
                  : t.fallbackSnapshotActive}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.autoSyncEvery30s} ({t.nextSyncIn} {countdown}
                {t.seconds})
              </span>
              {lastSyncedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.lastUpdated}: {lastSyncedAt}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Workspace Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Manual 30s Sync Trigger */}
            <button
              type="button"
              onClick={() => fetchSheetData(sheetUrl, false)}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? t.syncing : t.syncNow}</span>
            </button>

            {/* Pause / Resume 30s Auto-Sync */}
            <button
              type="button"
              onClick={() => setAutoSyncEnabled((prev) => !prev)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {autoSyncEnabled ? t.pauseSync : t.resumeSync}
            </button>

            {/* Google Sheet URL / Custom CSV Upload */}
            <button
              type="button"
              onClick={() => setIsDataSourceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.dataSourceSettings}</span>
            </button>

            {/* Google Sites Embed Helper */}
            <button
              type="button"
              onClick={() => setIsEmbedModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.embedGoogleSites}</span>
            </button>

            {/* Arabic / English Language Toggle */}
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.switchLangLabel}</span>
            </button>
          </div>
        </section>

        {/* Interactive Multi-Dimensional Filter Bar */}
        <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* 1. Time Horizon Selector */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {t.filterScopeLabel}
              </label>
              <select
                value={timeScope}
                onChange={(e) => handleTimeScopeChange(e.target.value as TimeScope)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">{t.scopeAllTime}</option>
                <option value="last12m">{t.scopeLast12M}</option>
                <option value="2026">{t.scopeYear2026}</option>
                <option value="2025">{t.scopeYear2025}</option>
                <option value="2024">{t.scopeYear2024}</option>
                <option value="2023">{t.scopeYear2023}</option>
              </select>
            </div>

            {/* 2. Truck Type Segmented Filter */}
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {t.filterTruckType}
              </label>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSelectedTruckType('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedTruckType === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.allTrucks}
                </button>
                {(['Jumbo', 'Flatbed', 'Lowbed'] as TruckTypeNormalized[]).map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() =>
                      setSelectedTruckType(selectedTruckType === tr ? 'all' : tr)
                    }
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedTruckType === tr
                        ? 'bg-white text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {getTruckTypeLabel(tr, lang)}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Vendor Selector */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {t.filterVendor}
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">
                  {t.allVendors} ({allVendorsList.length})
                </option>
                {allVendorsList.map((v) => (
                  <option key={v.name} value={v.name}>
                    {getVendorDisplayName(v.name, lang)} ({v.count})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Search Box */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                &nbsp;
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full ps-8 pe-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Secondary Filter Row: Custom Date Range & Active Filter Reset + Quick CSV Exports */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium">{t.dateFrom}:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2.5 py-1 text-xs font-mono-tabular bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium">{t.dateTo}:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2.5 py-1 text-xs font-mono-tabular bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                />
              </div>

              {(timeScope !== 'all' ||
                selectedTruckType !== 'all' ||
                selectedVendor !== 'all' ||
                selectedBiMonthSlice !== 'all' ||
                searchQuery !== '' ||
                dateFrom !== '' ||
                dateTo !== '') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.resetFilters}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => exportBiMonthlyMatrixToCsv(vendorMatrixRows, biMonthlyMode, lang)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.exportMatrixBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => exportFilteredLedgerToCsv(finalFilteredRecords, lang)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.exportFullLedgerBtn}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4-Column Executive KPI Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Filtered Dues */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500">{t.kpiTotalDues}</div>
            <div className="text-2xl font-bold font-mono-tabular text-slate-900 mt-1.5 tracking-tight">
              {loading ? '...' : formatAmount(kpiStats.totalFilteredDues, 2)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-mono-tabular">
              <span>
                {kpiStats.totalInvoicesCount} {t.invoicesUnit}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {kpiStats.activeVendorsCount} {t.vendorsUnit}
              </span>
            </div>
          </div>

          {/* KPI 2: Last 12 Months Dues (0–12M) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500">{t.kpiLast12MDues}</div>
            <div className="text-2xl font-bold font-mono-tabular text-blue-700 mt-1.5 tracking-tight">
              {loading ? '...' : formatAmount(kpiStats.last12MDues, 2)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-mono-tabular">
              <span>
                {kpiStats.totalFilteredDues > 0
                  ? `${((kpiStats.last12MDues / kpiStats.totalFilteredDues) * 100).toFixed(1)}%`
                  : '0.0%'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{t.shareOfTotal}</span>
            </div>
          </div>

          {/* KPI 3: Current 2-Month Dues (0–2M: Sep–Oct 2026) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500">{t.kpiRecent2MDues}</div>
            <div className="text-2xl font-bold font-mono-tabular text-slate-900 mt-1.5 tracking-tight">
              {loading ? '...' : formatAmount(kpiStats.recent2MDues, 2)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-mono-tabular">
              <span>
                {kpiStats.last12MDues > 0
                  ? `${((kpiStats.recent2MDues / kpiStats.last12MDues) * 100).toFixed(1)}%`
                  : '0.0%'}
              </span>
              <span aria-hidden="true">·</span>
              <span>Sep – Oct 2026</span>
            </div>
          </div>

          {/* KPI 4: Top Vendor & Dominant Truck Fleet */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500">{t.topVendorLabel}</div>
            <div
              className="text-base font-bold text-slate-900 mt-1.5 truncate"
              title={kpiStats.topVendor?.vendorName || '—'}
            >
              {kpiStats.topVendor
                ? getVendorShortName(kpiStats.topVendor.vendorName, lang)
                : '—'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-mono-tabular">
              <span>
                {kpiStats.topVendor ? formatAmount(kpiStats.topVendor.total, 0) : '0'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.dominantTruckLabel}:{' '}
                {kpiStats.topTruck ? kpiStats.topTruck.label : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Current Situation of Dues Over Every 2 Months to 12 Months (2M, 4M, 6M, 8M, 10M, 12M) */}
        <BiMonthlySituationStrip
          items={cumulativeHorizonItems}
          lang={lang}
          selectedRollingSlice={
            biMonthlyMode === 'rolling12' ? selectedBiMonthSlice : 'all'
          }
          onSelectRollingSlice={(idx) => {
            setBiMonthlyMode('rolling12');
            setSelectedBiMonthSlice(idx);
          }}
        />

        {/* Bi-Monthly Vendor Dues Matrix Table (Each Two Months) */}
        <div id="bimonthly-matrix">
          <BiMonthlyMatrixTable
            rows={vendorMatrixRows}
            mode={biMonthlyMode}
            onModeChange={(m) => {
              setBiMonthlyMode(m);
              setSelectedBiMonthSlice('all');
            }}
            lang={lang}
            selectedVendor={selectedVendor}
            onSelectVendor={setSelectedVendor}
            selectedBiMonthSlice={selectedBiMonthSlice}
            onSelectBiMonthSlice={setSelectedBiMonthSlice}
          />
        </div>

        {/* Interactive Charts Section (Bi-Monthly Bar/Line, Truck Type Pie/Donut, Top Vendors Horizontal Bar) */}
        <div id="interactive-charts">
          <InteractiveChartsSection
            lang={lang}
            biMonthlyMode={biMonthlyMode}
            biMonthlyData={biMonthlyChartData}
            truckTypeData={truckTypeChartData}
            topVendorsData={topVendorsChartData}
            selectedTruckType={selectedTruckType}
            onSelectTruckType={setSelectedTruckType}
            selectedVendor={selectedVendor}
            onSelectVendor={setSelectedVendor}
            selectedBiMonthSlice={selectedBiMonthSlice}
            onSelectBiMonthSlice={setSelectedBiMonthSlice}
          />
        </div>

        {/* Detailed Transactions Ledger & Custom CSV Export */}
        <div id="transactions-ledger">
          <TransactionsLedger
            records={finalFilteredRecords}
            lang={lang}
            onResetFilters={handleResetFilters}
          />
        </div>
      </main>

      {/* Modals */}
      <DataSourceModal
        isOpen={isDataSourceModalOpen}
        onClose={() => setIsDataSourceModalOpen(false)}
        lang={lang}
        sheetUrl={sheetUrl}
        onApplySheetUrl={(newUrl) => {
          setSheetUrl(newUrl);
          fetchSheetData(newUrl, false);
        }}
        onUploadCustomCsv={handleUploadCustomCsv}
      />

      <GoogleSitesEmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}

export default App;
