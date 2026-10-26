import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Download } from 'lucide-react';
import {
  BiMonthlyMode,
  Language,
  VendorBiMonthlyRow,
} from '../types/dashboard';
import {
  CALENDAR_BIMONTHLY_BUCKETS,
  ROLLING_BIMONTHLY_BUCKETS,
  TRANSLATIONS,
  formatAmount,
  getTruckTypeLabel,
  getVendorDisplayName,
} from '../utils/i18n';
import { exportBiMonthlyMatrixToCsv } from '../utils/csvParser';

interface BiMonthlyMatrixTableProps {
  rows: VendorBiMonthlyRow[];
  mode: BiMonthlyMode;
  onModeChange: (mode: BiMonthlyMode) => void;
  lang: Language;
  selectedVendor: string;
  onSelectVendor: (vendorName: string) => void;
  selectedBiMonthSlice: number | 'all';
  onSelectBiMonthSlice: (idx: number | 'all') => void;
}

type SortKey = 'vendor' | 'b0' | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'older' | 'total12M' | 'grandTotal';

export const BiMonthlyMatrixTable: React.FC<BiMonthlyMatrixTableProps> = ({
  rows,
  mode,
  onModeChange,
  lang,
  selectedVendor,
  onSelectVendor,
  selectedBiMonthSlice,
  onSelectBiMonthSlice,
}) => {
  const t = TRANSLATIONS[lang];
  const [sortKey, setSortKey] = useState<SortKey>('grandTotal');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const buckets = mode === 'rolling12' ? ROLLING_BIMONTHLY_BUCKETS : CALENDAR_BIMONTHLY_BUCKETS;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'vendor');
    }
  };

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'vendor':
          cmp = a.vendorName.localeCompare(b.vendorName);
          break;
        case 'b0':
          cmp = a.buckets[0] - b.buckets[0];
          break;
        case 'b1':
          cmp = a.buckets[1] - b.buckets[1];
          break;
        case 'b2':
          cmp = a.buckets[2] - b.buckets[2];
          break;
        case 'b3':
          cmp = a.buckets[3] - b.buckets[3];
          break;
        case 'b4':
          cmp = a.buckets[4] - b.buckets[4];
          break;
        case 'b5':
          cmp = a.buckets[5] - b.buckets[5];
          break;
        case 'older':
          cmp = a.olderOrOtherTotal - b.olderOrOtherTotal;
          break;
        case 'total12M':
          cmp = a.total12M - b.total12M;
          break;
        case 'grandTotal':
        default:
          cmp = a.grandTotal - b.grandTotal;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortAsc]);

  // Compute column totals
  const columnTotals = useMemo(() => {
    const bucketSums = [0, 0, 0, 0, 0, 0];
    let olderSum = 0;
    let total12MSum = 0;
    let grandSum = 0;
    let totalInvoices = 0;

    for (const r of rows) {
      for (let i = 0; i < 6; i++) {
        bucketSums[i] += r.buckets[i] || 0;
      }
      olderSum += r.olderOrOtherTotal || 0;
      total12MSum += r.total12M || 0;
      grandSum += r.grandTotal || 0;
      totalInvoices += r.invoiceCount || 0;
    }

    return { bucketSums, olderSum, total12MSum, grandSum, totalInvoices };
  }, [rows]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {t.biMonthlyTableTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.biMonthlyTableSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => onModeChange('rolling12')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'rolling12'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.modeRolling12}
            </button>
            <button
              type="button"
              onClick={() => onModeChange('calendarYear')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'calendarYear'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.modeCalendarYear}
            </button>
          </div>

          <button
            type="button"
            onClick={() => exportBiMonthlyMatrixToCsv(sortedRows, mode, lang)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportMatrixBtn}</span>
          </button>
        </div>
      </div>

      {/* Responsive Dense Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="py-3 px-4 text-start font-semibold min-w-[220px]">
                <button
                  type="button"
                  onClick={() => handleSort('vendor')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  <span>{t.colVendor}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 text-start font-semibold whitespace-nowrap">
                {t.colTruckTypes}
              </th>
              <th className="py-3 px-2.5 text-end font-semibold whitespace-nowrap">
                {t.colInvoices}
              </th>

              {buckets.map((b, idx) => {
                const sortId = `b${idx}` as SortKey;
                const isSliceActive = selectedBiMonthSlice === idx;
                return (
                  <th
                    key={b.key}
                    className={`py-2.5 px-3 text-end font-semibold whitespace-nowrap transition-colors ${
                      isSliceActive ? 'bg-blue-50/80 text-blue-900' : ''
                    }`}
                  >
                    <div className="flex flex-col items-end">
                      <button
                        type="button"
                        onClick={() => handleSort(sortId)}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        <span>{lang === 'ar' ? b.labelAr : b.labelEn}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onSelectBiMonthSlice(isSliceActive ? 'all' : idx)
                        }
                        className="text-[10px] font-normal text-slate-400 hover:text-blue-600 cursor-pointer"
                      >
                        {lang === 'ar' ? b.subLabelAr : b.subLabelEn}
                      </button>
                    </div>
                  </th>
                );
              })}

              {mode === 'rolling12' && (
                <th className="py-2.5 px-3 text-end font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('older')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>{t.colOlderDues}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
              )}

              <th className="py-3 px-3.5 text-end font-bold text-slate-900 bg-slate-100/60 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort('grandTotal')}
                  className="inline-flex items-center gap-1 hover:text-blue-700 cursor-pointer"
                >
                  <span>{t.colGrandTotal}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>

              <th className="py-3 px-3.5 text-end font-semibold whitespace-nowrap min-w-[110px]">
                {t.colShare}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={mode === 'rolling12' ? 12 : 11}
                  className="py-10 text-center text-slate-500"
                >
                  {t.noMatchingRecords}
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => {
                const isVendorSelected = selectedVendor === row.vendorName;
                return (
                  <tr
                    key={row.vendorName}
                    onClick={() =>
                      onSelectVendor(isVendorSelected ? 'all' : row.vendorName)
                    }
                    className={`transition-colors cursor-pointer ${
                      isVendorSelected
                        ? 'bg-blue-50/60 hover:bg-blue-50'
                        : 'hover:bg-slate-50/90'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {getVendorDisplayName(row.vendorName, lang)}
                    </td>

                    {/* Zero-Pill metadata: clean unboxed text with middot separator */}
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {row.truckTypes
                        .map((tr) => getTruckTypeLabel(tr, lang))
                        .join(' · ')}
                    </td>

                    <td className="py-2.5 px-2.5 text-end font-mono-tabular text-slate-500">
                      {row.invoiceCount}
                    </td>

                    {row.buckets.slice(0, 6).map((val, idx) => {
                      const isSliceActive = selectedBiMonthSlice === idx;
                      return (
                        <td
                          key={idx}
                          className={`py-2.5 px-3 text-end font-mono-tabular whitespace-nowrap ${
                            isSliceActive ? 'bg-blue-50/40 font-semibold' : ''
                          } ${val > 0 ? 'text-slate-800' : 'text-slate-300'}`}
                        >
                          {val > 0 ? formatAmount(val, 2) : '—'}
                        </td>
                      );
                    })}

                    {mode === 'rolling12' && (
                      <td
                        className={`py-2.5 px-3 text-end font-mono-tabular whitespace-nowrap ${
                          row.olderOrOtherTotal > 0
                            ? 'text-slate-700'
                            : 'text-slate-300'
                        }`}
                      >
                        {row.olderOrOtherTotal > 0
                          ? formatAmount(row.olderOrOtherTotal, 2)
                          : '—'}
                      </td>
                    )}

                    <td className="py-2.5 px-3.5 text-end font-mono-tabular font-bold text-slate-900 bg-slate-50/70 whitespace-nowrap">
                      {formatAmount(row.grandTotal, 2)}
                    </td>

                    <td className="py-2.5 px-3.5 text-end font-mono-tabular whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-slate-600 w-11 text-end">
                          {row.sharePercent.toFixed(1)}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${Math.min(100, row.sharePercent)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Grand Total Footer Row */}
          {sortedRows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900">
                <td className="py-3 px-4 text-start" colSpan={2}>
                  {t.tableGrandTotal} ({sortedRows.length})
                </td>
                <td className="py-3 px-2.5 text-end font-mono-tabular">
                  {columnTotals.totalInvoices}
                </td>
                {columnTotals.bucketSums.map((sum, idx) => (
                  <td
                    key={idx}
                    className="py-3 px-3 text-end font-mono-tabular whitespace-nowrap text-slate-900"
                  >
                    {formatAmount(sum, 2)}
                  </td>
                ))}
                {mode === 'rolling12' && (
                  <td className="py-3 px-3 text-end font-mono-tabular whitespace-nowrap text-slate-800">
                    {formatAmount(columnTotals.olderSum, 2)}
                  </td>
                )}
                <td className="py-3 px-3.5 text-end font-mono-tabular text-blue-700 bg-blue-50/60 whitespace-nowrap">
                  {formatAmount(columnTotals.grandSum, 2)}
                </td>
                <td className="py-3 px-3.5 text-end font-mono-tabular">
                  100.0%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};
