import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BiMonthlyMode, Language, TruckTypeNormalized } from '../types/dashboard';
import {
  TRANSLATIONS,
  formatAmount,
  formatCompactAmount,
  getTruckTypeLabel,
  getVendorShortName,
} from '../utils/i18n';

export interface BiMonthlyChartDatum {
  index: number;
  name: string;
  subLabel: string;
  Jumbo: number;
  Flatbed: number;
  Lowbed: number;
  Other: number;
  total: number;
  cumulative: number;
  count: number;
}

export interface TruckTypeChartDatum {
  truckType: TruckTypeNormalized;
  label: string;
  value: number;
  count: number;
  sharePercent: number;
  color: string;
}

export interface TopVendorChartDatum {
  vendorName: string;
  shortName: string;
  total: number;
  count: number;
  sharePercent: number;
  dominantTruck: TruckTypeNormalized;
}

interface InteractiveChartsSectionProps {
  lang: Language;
  biMonthlyMode: BiMonthlyMode;
  biMonthlyData: BiMonthlyChartDatum[];
  truckTypeData: TruckTypeChartDatum[];
  topVendorsData: TopVendorChartDatum[];
  selectedTruckType: TruckTypeNormalized | 'all';
  onSelectTruckType: (t: TruckTypeNormalized | 'all') => void;
  selectedVendor: string;
  onSelectVendor: (v: string) => void;
  selectedBiMonthSlice: number | 'all';
  onSelectBiMonthSlice: (idx: number | 'all') => void;
}

const TRUCK_COLORS: Record<TruckTypeNormalized, string> = {
  Jumbo: '#1D4ED8', // Deep Royal Blue
  Flatbed: '#0D9488', // Teal
  Lowbed: '#D97706', // Amber
  Other: '#64748B', // Slate
};

export const InteractiveChartsSection: React.FC<InteractiveChartsSectionProps> = ({
  lang,
  biMonthlyData,
  truckTypeData,
  topVendorsData,
  selectedTruckType,
  onSelectTruckType,
  selectedVendor,
  onSelectVendor,
  selectedBiMonthSlice,
  onSelectBiMonthSlice,
}) => {
  const t = TRANSLATIONS[lang];
  const [barViewMode, setBarViewMode] = useState<'stacked' | 'cumulative'>('stacked');

  return (
    <section className="space-y-6">
      {/* Row 1: Bi-Monthly Bar/Line Chart (2/3 width) + Truck Type Pie/Donut Chart (1/3 width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Bi-Monthly Dues Bar & Cumulative Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {t.chartBiMonthlyTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{t.chartBiMonthlySubtitle}</p>
              </div>

              {/* Segmented interactive chart mode control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setBarViewMode('stacked')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    barViewMode === 'stacked'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.stackedByTruck}
                </button>
                <button
                  type="button"
                  onClick={() => setBarViewMode('cumulative')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    barViewMode === 'cumulative'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.singleBarTotal}
                </button>
              </div>
            </div>

            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={biMonthlyData}
                  margin={{ top: 10, right: 16, left: 8, bottom: 5 }}
                  onClick={(state) => {
                    if (state && typeof state.activeTooltipIndex === 'number') {
                      const clicked = biMonthlyData[state.activeTooltipIndex];
                      if (clicked) {
                        onSelectBiMonthSlice(
                          selectedBiMonthSlice === clicked.index ? 'all' : clicked.index
                        );
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(v) => formatCompactAmount(v, 'en')}
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    width={62}
                  />
                  {barViewMode === 'cumulative' && (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => formatCompactAmount(v, 'en')}
                      tick={{ fill: '#0F172A', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      axisLine={false}
                      tickLine={false}
                      width={62}
                    />
                  )}
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatAmount(Number(value), 2),
                      name,
                    ]}
                    labelFormatter={(label, payload) => {
                      const sub = payload?.[0]?.payload?.subLabel;
                      return sub ? `${label} (${sub})` : label;
                    }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono, Plus Jakarta Sans, sans-serif',
                      color: '#0F172A',
                    }}
                  />
                  {barViewMode === 'stacked' ? (
                    <>
                      <Bar
                        yAxisId="left"
                        dataKey="Jumbo"
                        name={getTruckTypeLabel('Jumbo', lang)}
                        stackId="truck"
                        fill={TRUCK_COLORS.Jumbo}
                        radius={[0, 0, 0, 0]}
                        maxBarSize={48}
                        className="cursor-pointer"
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="Flatbed"
                        name={getTruckTypeLabel('Flatbed', lang)}
                        stackId="truck"
                        fill={TRUCK_COLORS.Flatbed}
                        radius={[0, 0, 0, 0]}
                        maxBarSize={48}
                        className="cursor-pointer"
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="Lowbed"
                        name={getTruckTypeLabel('Lowbed', lang)}
                        stackId="truck"
                        fill={TRUCK_COLORS.Lowbed}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                        className="cursor-pointer"
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        yAxisId="left"
                        dataKey="total"
                        name={t.colGrandTotal}
                        fill="#2563EB"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                        className="cursor-pointer"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="cumulative"
                        name={t.cumulativeLineName}
                        stroke="#0F172A"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0F172A', strokeWidth: 2, stroke: '#FFFFFF' }}
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clean Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              {barViewMode === 'stacked' ? (
                (['Jumbo', 'Flatbed', 'Lowbed'] as TruckTypeNormalized[]).map((truck) => (
                  <button
                    key={truck}
                    type="button"
                    onClick={() =>
                      onSelectTruckType(selectedTruckType === truck ? 'all' : truck)
                    }
                    className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
                      selectedTruckType !== 'all' && selectedTruckType !== truck
                        ? 'opacity-40'
                        : 'opacity-100'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: TRUCK_COLORS[truck] }}
                    />
                    <span className="font-medium text-slate-700">
                      {getTruckTypeLabel(truck, lang)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                    <span>{t.discreteSliceLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-slate-900 inline-block" />
                    <span>{t.cumulativeLineName}</span>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {lang === 'ar'
                ? 'اضغط على أي عمود لتصفية فترة الشهرين'
                : 'Click any bar to filter that 2-month window'}
            </span>
          </div>
        </div>

        {/* Truck Type Distribution Pie / Donut Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 mb-2 border-b border-slate-100 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {t.chartTruckPieTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{t.chartTruckPieSubtitle}</p>
              </div>
              {selectedTruckType !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectTruckType('all')}
                  className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.allTrucks}
                </button>
              )}
            </div>

            <div className="h-52 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={truckTypeData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={2}
                    onClick={(entry: TruckTypeChartDatum) => {
                      onSelectTruckType(
                        selectedTruckType === entry.truckType ? 'all' : entry.truckType
                      );
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    {truckTypeData.map((entry) => (
                      <Cell
                        key={entry.truckType}
                        fill={entry.color}
                        opacity={
                          selectedTruckType === 'all' || selectedTruckType === entry.truckType
                            ? 1
                            : 0.35
                        }
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatAmount(Number(value), 2), t.colGrandTotal]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono, Plus Jakarta Sans, sans-serif',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Truck Breakdown List */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            {truckTypeData.map((item) => {
              const isSelected = selectedTruckType === item.truckType;
              return (
                <button
                  key={item.truckType}
                  type="button"
                  onClick={() =>
                    onSelectTruckType(isSelected ? 'all' : item.truckType)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border border-blue-200 text-slate-900'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-mono-tabular">
                      {item.count} {t.invoicesUnit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-tabular">
                    <span className="font-semibold text-slate-900">
                      {formatAmount(item.value, 0)}
                    </span>
                    <span className="text-slate-500 w-12 text-end">
                      ({item.sharePercent.toFixed(1)}%)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Top Transportation Vendors Horizontal Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {t.chartTopVendorsTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.chartTopVendorsSubtitle}</p>
          </div>
          {selectedVendor !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectVendor('all')}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.allVendors}
            </button>
          )}
        </div>

        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topVendorsData.slice(0, 10)}
              layout="vertical"
              margin={{ top: 4, right: 28, left: 12, bottom: 4 }}
              onClick={(state) => {
                if (state && typeof state.activeTooltipIndex === 'number') {
                  const v = topVendorsData[state.activeTooltipIndex];
                  if (v) {
                    onSelectVendor(selectedVendor === v.vendorName ? 'all' : v.vendorName);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCompactAmount(v, 'en')}
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                width={210}
                tick={{ fill: '#0F172A', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [formatAmount(Number(value), 2), t.colGrandTotal]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, Plus Jakarta Sans, sans-serif',
                }}
              />
              <Bar
                dataKey="total"
                name={t.colGrandTotal}
                radius={[0, 4, 4, 0]}
                maxBarSize={22}
                className="cursor-pointer"
              >
                {topVendorsData.slice(0, 10).map((entry) => (
                  <Cell
                    key={entry.vendorName}
                    fill={
                      selectedVendor === entry.vendorName
                        ? '#1E40AF'
                        : TRUCK_COLORS[entry.dominantTruck] || '#2563EB'
                    }
                    opacity={
                      selectedVendor === 'all' || selectedVendor === entry.vendorName ? 1 : 0.4
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};
