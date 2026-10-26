import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Download } from 'lucide-react';
import { Language, RawVendorRecord } from '../types/dashboard';
import {
  CALENDAR_BIMONTHLY_BUCKETS,
  ROLLING_BIMONTHLY_BUCKETS,
  TRANSLATIONS,
  formatAmount,
  getTruckTypeLabel,
  getVendorDisplayName,
} from '../utils/i18n';
import { exportFilteredLedgerToCsv } from '../utils/csvParser';

interface TransactionsLedgerProps {
  records: RawVendorRecord[];
  lang: Language;
  onResetFilters: () => void;
}

type LedgerSortField = 'date' | 'vendor' | 'truck' | 'dues';

export const TransactionsLedger: React.FC<TransactionsLedgerProps> = ({
  records,
  lang,
  onResetFilters,
}) => {
  const t = TRANSLATIONS[lang];
  const [sortField, setSortField] = useState<LedgerSortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  const handleSort = (field: LedgerSortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'vendor');
    }
    setPage(1);
  };

  const sortedRecords = useMemo(() => {
    const copy = [...records];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = a.dateObj.getTime() - b.dateObj.getTime();
      } else if (sortField === 'vendor') {
        cmp = a.vendorName.localeCompare(b.vendorName);
      } else if (sortField === 'truck') {
        cmp = a.truckType.localeCompare(b.truckType);
      } else {
        cmp = a.dues - b.dues;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [records, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageSlice = sortedRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {t.ledgerTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.ledgerSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => exportFilteredLedgerToCsv(sortedRecords, lang)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.exportFullLedgerBtn}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="py-3 px-4 text-start font-semibold">
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
                <button
                  type="button"
                  onClick={() => handleSort('date')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>{t.colDate}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 text-start font-semibold whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort('truck')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>{t.colTruckTypes}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 text-start font-semibold whitespace-nowrap">
                {t.colPeriodBucket}
              </th>
              <th className="py-3 px-3 text-start font-semibold whitespace-nowrap">
                {t.colRollingHorizon}
              </th>
              <th className="py-3 px-4 text-end font-bold text-slate-900 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort('dues')}
                  className="inline-flex items-center gap-1 hover:text-blue-700 cursor-pointer"
                >
                  <span>{t.colDuesAmount}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <p className="text-slate-500 text-xs mb-3">{t.noMatchingRecords}</p>
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="px-3.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {t.clearAllFiltersBtn}
                  </button>
                </td>
              </tr>
            ) : (
              pageSlice.map((rec) => {
                const calB = CALENDAR_BIMONTHLY_BUCKETS[rec.calendarBiMonthIndex];
                const rollB =
                  rec.rollingBiMonthIndex < 6
                    ? ROLLING_BIMONTHLY_BUCKETS[rec.rollingBiMonthIndex]
                    : null;

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {getVendorDisplayName(rec.vendorName, lang)}
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular text-slate-600 whitespace-nowrap">
                      {rec.dateStr}
                    </td>
                    {/* Unboxed clean text metadata */}
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {getTruckTypeLabel(rec.truckType, lang)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {lang === 'ar' ? calB.labelAr : calB.labelEn} · {rec.year}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {rollB
                        ? lang === 'ar'
                          ? `${rollB.labelAr} (${rollB.subLabelAr})`
                          : `${rollB.labelEn} (${rollB.subLabelEn})`
                        : t.priorHistoryLabel}
                    </td>
                    <td className="py-2.5 px-4 text-end font-mono-tabular font-semibold text-slate-900 whitespace-nowrap">
                      {formatAmount(rec.dues, 2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {sortedRecords.length > 0 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="font-mono-tabular">
            {t.showingRows} {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sortedRecords.length)} {t.ofRows}{' '}
            {sortedRecords.length} {t.recordsLabel}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {t.prevPage}
            </button>
            <span className="font-mono-tabular px-2">
              {t.pageLabel} {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {t.nextPage}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
