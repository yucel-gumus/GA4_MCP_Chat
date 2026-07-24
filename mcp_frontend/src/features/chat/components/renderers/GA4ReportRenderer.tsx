import React from 'react';
import type { GA4ReportData } from '../../../../api/ask';

interface GA4ReportRendererProps {
  data: GA4ReportData;
}

export const GA4ReportRenderer: React.FC<GA4ReportRendererProps> = ({ data }) => {
  if (!data.rows || !data.dimension_headers || !data.metric_headers) {
    return null;
  }

  // Calculate totals for quick overview cards
  const totals: Record<string, number> = {};
  data.metric_headers.forEach((header, mIdx) => {
    let sum = 0;
    data.rows?.forEach((row) => {
      const val = parseFloat(row.metric_values[mIdx]?.value || '0');
      if (!isNaN(val)) sum += val;
    });
    totals[header.name] = sum;
  });

  const friendlyNames: Record<string, string> = {
    eventCount: 'Toplam Etkinlik',
    totalUsers: 'Toplam Kullanıcı',
    activeUsers: 'Aktif Kullanıcı',
    sessions: 'Oturum Sayısı',
    screenPageViews: 'Sayfa Görüntüleme',
    engagementRate: 'Etkileşim Oranı',
    userEngagementDuration: 'Etkileşim Süresi (sn)',
  };

  return (
    <div className="mt-4 bg-[#FFEBD3]/70 border-2 border-[#FFB6A6] rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Report Header Banner */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#FFB6A6]/40 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-[#9BCEC1] animate-ping" />
          <span className="font-bold text-xs text-[#3D261C] tracking-wide uppercase">
            GA4 Analytics Veri Raporu
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#3D261C] bg-[#FFB6A6]/40 border border-[#FFB6A6] px-3 py-1 rounded-full">
          Zaman Dilimi: {(data.metadata?.time_zone as string) || 'Etc/GMT'}
        </span>
      </div>

      {/* Quick Metrics Cards (10% Accent #9BCEC1 Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.metric_headers.map((header, mIdx) => {
          const name = header.name;
          const value = totals[name] || 0;
          const formattedValue = header.type_ === 'TYPE_INTEGER' 
            ? new Intl.NumberFormat('tr-TR').format(value) 
            : value.toFixed(2);

          return (
            <div 
              key={mIdx} 
              className="bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#9BCEC1] transition-colors duration-200"
            >
              <span className="text-[11px] font-bold text-[#7A5343] uppercase tracking-wider">
                {friendlyNames[name] || name}
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-extrabold text-[#3D261C] tracking-tight">{formattedValue}</span>
                {name === 'engagementRate' && <span className="text-sm font-bold text-[#9BCEC1]">%</span>}
                {name === 'userEngagementDuration' && <span className="text-xs font-semibold text-[#7A5343]">sn</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dimension Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-[#7A5343]">Boyutlar:</span>
        {data.dimension_headers.map((h, i) => (
          <span 
            key={i} 
            className="font-bold text-[#3D261C] bg-[#9BCEC1] border border-[#FFB6A6] px-2.5 py-0.5 rounded-lg shadow-2xs"
          >
            {h.name.replace('customEvent:', '')}
          </span>
        ))}
      </div>

      {/* Data Table */}
      {data.rows.length > 0 ? (
        <div className="overflow-hidden border-2 border-[#FFB6A6] rounded-xl bg-[#FFEBD3]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFB6A6]/40 border-b-2 border-[#FFB6A6] text-[11px] font-bold text-[#3D261C]">
                  {data.dimension_headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 uppercase tracking-wider">{h.name.replace('customEvent:', '')}</th>
                  ))}
                  {data.metric_headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-right uppercase tracking-wider">{friendlyNames[h.name] || h.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFB6A6]/30 text-xs text-[#3D261C]">
                {data.rows.slice(0, 10).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#FFB6A6]/20 transition-colors duration-150">
                    {row.dimension_values.map((dim, dIdx) => (
                      <td key={dIdx} className="px-4 py-2.5 font-bold text-[#3D261C]">
                        {dim.value === '(not set)' ? 'Belirtilmemiş' : dim.value}
                      </td>
                    ))}
                    {row.metric_values.map((met, mIdx) => (
                      <td key={mIdx} className="px-4 py-2.5 text-right font-mono font-bold text-[#3D261C]">
                        {met.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.rows.length > 10 && (
            <div className="bg-[#FFB6A6]/20 text-center py-2 border-t border-[#FFB6A6] text-[11px] font-bold text-[#7A5343]">
              Toplam {data.rows.length} kayıttan ilk 10 satır gösteriliyor.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-xl p-6 text-center shadow-sm">
          <span className="text-xs text-[#7A5343] font-bold">Bu zaman diliminde herhangi bir rapor verisi bulunamadı.</span>
        </div>
      )}
    </div>
  );
};
