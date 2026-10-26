import React from 'react';
import { CumulativeHorizonItem, Language } from '../types/dashboard';
import { TRANSLATIONS, formatAmount, formatCompactAmount } from '../utils/i18n';

interface BiMonthlySituationStripProps {
  items: CumulativeHorizonItem[];
  lang: Language;
  selectedRollingSlice: number | 'all';
  onSelectRollingSlice: (sliceIndex: number | 'all') => void;
}

export const BiMonthlySituationStrip: React.FC<BiMonthlySituationStripProps> = ({
  items,
  lang,
  selectedRollingSlice,
  onSelectRollingSlice,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {t.situationTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.situationSubtitle}
          </p>
        </div>
        {selectedRollingSlice !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectRollingSlice('all')}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            {t.allPeriods}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {items.map((item, idx) => {
          const isSelected = selectedRollingSlice === idx;
          const pct = Math.min(100, Math.max(0, item.shareOf12M));

          return (
            <button
              key={item.months}
              type="button"
              onClick={() => onSelectRollingSlice(isSelected ? 'all' : idx)}
              className={`text-start p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                    {lang === 'ar' ? item.labelAr : item.labelEn}
                  </span>
                  <span className="text-[11px] font-mono-tabular text-slate-500">
                    {item.months}M
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {lang === 'ar' ? item.rangeLabelAr : item.rangeLabelEn}
                </div>

                {/* Cumulative Horizon Total */}
                <div className="mt-3">
                  <div className="text-[11px] text-slate-500">
                    {t.cumulativeLabel} {item.months}M
                  </div>
                  <div
                    className="text-base font-bold font-mono-tabular text-slate-900 mt-0.5 tracking-tight"
                    title={formatAmount(item.cumulativeDues, 2)}
                  >
                    {formatAmount(item.cumulativeDues, 0)}
                  </div>
                </div>
              </div>

              {/* Discrete 2-Month Slice + Progress Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>{t.discreteSliceLabel}:</span>
                  <span className="font-mono-tabular font-semibold text-blue-700">
                    +{formatCompactAmount(item.periodDues, lang)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono-tabular">
                  <span>
                    {item.invoiceCount} {t.invoicesUnit}
                  </span>
                  <span>{pct.toFixed(1)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
