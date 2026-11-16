import React from 'react';
import type { GA4ReportData } from '../../../../api/ask';

interface GA4ReportRendererProps {
  data: GA4ReportData;
}

export const GA4ReportRenderer: React.FC<GA4ReportRendererProps> = ({ data }) => {
  if (!data.rows || !data.dimension_headers || !data.metric_headers) {
    return null;
  }

  // Calculate summary totals/averages for quick overview cards
  const isRateMetric = (name: string, type_?: string) => {
    const lower = name.toLowerCase();
    return (
      lower.includes('rate') ||
      lower.includes('percent') ||
      lower.includes('ratio') ||
      lower.includes('durationper') ||
      type_ === 'TYPE_FLOAT' && (lower.includes('rate') || lower.includes('bounce') || lower.includes('engagement'))
    );
  };

  const totals: Record<string, number> = {};
  data.metric_headers.forEach((header, mIdx) => {
    let sum = 0;
    let count = 0;
    data.rows?.forEach((row) => {
      const val = parseFloat(row.metric_values[mIdx]?.value || '');
      if (!isNaN(val)) {
        sum += val;
        count += 1;
      }
    });
    if (count > 0 && isRateMetric(header.name, header.type_)) {
      const avg = sum / count;
      // GA4 API sometimes returns 0..1 rates (e.g. 0.65) or 0..100 percentages
      totals[header.name] = avg <= 1 ? avg * 100 : avg;
    } else {
      totals[header.name] = sum;
    }
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
    <div className="mt-4 bg-[#EDF3EE] border-2 border-[#BCC7D2] rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Report Header Banner */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#BCC7D2] pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-[#EC7D55] animate-ping" />
          <span className="font-bold text-xs text-[#253341] tracking-wide uppercase">
            GA4 Analytics Veri Raporu
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#253341] bg-[#DBE6DD] border border-[#BCC7D2] px-3 py-1 rounded-full">
          Zaman Dilimi: {(data.metadata?.time_zone as string) || 'Etc/GMT'}
        </span>
      </div>

      {/* Quick Metrics Cards (30% #DCE3EA surface & 10% #EC7D55 hover ring) */}
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
              className="bg-[#DCE3EA] border-2 border-[#BCC7D2] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#EC7D55] transition-colors duration-200"
            >
              <span className="text-[11px] font-bold text-[#3E5164] uppercase tracking-wider">
                {friendlyNames[name] || name}
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-extrabold text-[#253341] tracking-tight">{formattedValue}</span>
                {name === 'engagementRate' && <span className="text-sm font-bold text-[#AB421C]">%</span>}
                {name === 'userEngagementDuration' && <span className="text-xs font-semibold text-[#3E5164]">sn</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dimension Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-[#3E5164]">Boyutlar:</span>
        {data.dimension_headers.map((h, i) => (
          <span 
            key={i} 
            className="font-bold text-[#253341] bg-[#DBE6DD] border border-[#BCC7D2] px-2.5 py-0.5 rounded-lg shadow-2xs"
          >
            {h.name.replace('customEvent:', '')}
          </span>
        ))}
      </div>

      {/* Data Table */}
      {data.rows.length > 0 ? (
        <div className="overflow-hidden border-2 border-[#BCC7D2] rounded-xl bg-[#F5F9F5]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#DCE3EA] border-b-2 border-[#BCC7D2] text-[11px] font-bold text-[#253341]">
                  {data.dimension_headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 uppercase tracking-wider">{h.name.replace('customEvent:', '')}</th>
                  ))}
                  {data.metric_headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-right uppercase tracking-wider">{friendlyNames[h.name] || h.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BCC7D2]/60 text-xs text-[#253341]">
                {data.rows.slice(0, 10).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#DBE6DD] transition-colors duration-150">
                    {row.dimension_values.map((dim, dIdx) => (
                      <td key={dIdx} className="px-4 py-2.5 font-bold text-[#253341]">
                        {dim.value === '(not set)' ? 'Belirtilmemiş' : dim.value}
                      </td>
                    ))}
                    {row.metric_values.map((met, mIdx) => (
                      <td key={mIdx} className="px-4 py-2.5 text-right font-mono font-bold text-[#253341]">
                        {met.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.rows.length > 10 && (
            <div className="bg-[#DCE3EA]/70 text-center py-2 border-t border-[#BCC7D2] text-[11px] font-bold text-[#3E5164]">
              Toplam {data.rows.length} kayıttan ilk 10 satır gösteriliyor.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#F5F9F5] border-2 border-[#BCC7D2] rounded-xl p-6 text-center shadow-sm">
          <span className="text-xs text-[#3E5164] font-bold">Bu zaman diliminde herhangi bir rapor verisi bulunamadı.</span>
        </div>
      )}
    </div>
  );
};
