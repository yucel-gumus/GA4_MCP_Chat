import React from 'react';

interface CustomDimensionItem {
  api_name: string;
  ui_name: string;
  description?: string;
  category?: string;
}

interface CustomDimensionsData {
  custom_dimensions?: CustomDimensionItem[];
  custom_metrics?: unknown[];
}

export const CustomDimensionsRenderer: React.FC<{ data: CustomDimensionsData }> = ({ data }) => {
  const dimensions = data.custom_dimensions || [];

  if (dimensions.length === 0) {
    return (
      <div className="mt-3 bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-xl p-4 text-center">
        <span className="text-xs text-[#7A5343] font-bold">Mülkünüzde kayıtlı özel boyut bulunamadı.</span>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between border-b-2 border-[#FFB6A6]/40 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9BCEC1]"></span>
          <span className="font-extrabold text-xs text-[#3D261C] uppercase tracking-wider">
            GA4 Mülkünüzdeki Kayıtlı Özel Boyutlar ({dimensions.length} Adet)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dimensions.map((dim, idx) => (
          <div
            key={idx}
            className="bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#9BCEC1] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs text-[#3D261C]">{dim.ui_name}</span>
                <span className="text-[9px] font-extrabold bg-[#9BCEC1] text-[#3D261C] px-2 py-0.5 rounded-md border border-[#FFB6A6]">
                  {dim.category || 'Event Scope'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#7A5343] mt-1.5 leading-snug">
                {dim.description || 'Etkinlik bazlı özel GA4 boyutu.'}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#FFB6A6]/30 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#3D261C]">
                Parametre: <code className="bg-[#FFB6A6]/40 px-1.5 py-0.5 rounded border border-[#FFB6A6]">{dim.api_name.replace('customEvent:', '')}</code>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
