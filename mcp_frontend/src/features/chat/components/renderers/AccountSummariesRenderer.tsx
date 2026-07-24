import React from 'react';
import type { AccountSummary } from '../../../../api/ask';

interface AccountSummariesRendererProps {
  data: AccountSummary[];
}

export const AccountSummariesRenderer: React.FC<AccountSummariesRendererProps> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 border-b-2 border-[#FFB6A6]/40 pb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#9BCEC1]" />
        <span className="font-bold text-xs text-[#3D261C] uppercase tracking-wide">
          Erişilebilir GA4 Hesapları & Mülkleri ({data.length})
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {data.map((acc, idx) => (
          <div
            key={idx}
            className="bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-2xl p-4 shadow-sm hover:border-[#9BCEC1] transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#3D261C]">{acc.display_name}</h4>
              <span className="text-[10px] font-bold text-[#3D261C] bg-[#FFB6A6]/40 px-2.5 py-1 rounded-full border border-[#FFB6A6]">
                {acc.account}
              </span>
            </div>

            {acc.property_summaries && acc.property_summaries.length > 0 ? (
              <div className="mt-3 space-y-2">
                <span className="text-[11px] font-bold text-[#7A5343]">Bağlı Mülkler:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {acc.property_summaries.map((prop, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-[#9BCEC1]/20 border border-[#FFB6A6] rounded-xl p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-[#3D261C] truncate">{prop.display_name}</div>
                        <div className="text-[10px] text-[#7A5343] font-medium">{prop.property}</div>
                      </div>
                      <span className="text-[9px] font-bold bg-[#9BCEC1] text-[#3D261C] px-2 py-0.5 rounded-md border border-[#FFB6A6] shrink-0">
                        {prop.property_type || 'GA4'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-[#7A5343] font-medium italic">Bu hesaba bağlı mülk bulunamadı.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
