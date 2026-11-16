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
      <div className="mt-3 bg-[#EDF3EE] border-2 border-[#BCC7D2] rounded-xl p-4 text-center">
        <span className="text-xs text-[#3E5164] font-bold">Mülkünüzde kayıtlı özel boyut bulunamadı.</span>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between border-b-2 border-[#BCC7D2] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EC7D55]"></span>
          <span className="font-extrabold text-xs text-[#253341] uppercase tracking-wider">
            GA4 Mülkünüzdeki Kayıtlı Özel Boyutlar ({dimensions.length} Adet)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dimensions.map((dim, idx) => (
          <div
            key={idx}
            className="bg-[#DCE3EA] border-2 border-[#BCC7D2] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#EC7D55] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs text-[#253341]">{dim.ui_name}</span>
                <span className="text-[9px] font-extrabold bg-[#F2A488]/40 text-[#253341] px-2 py-0.5 rounded-md border border-[#EC7D55]/50">
                  {dim.category || 'Event Scope'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#3E5164] mt-1.5 leading-snug">
                {dim.description || 'Etkinlik bazlı özel GA4 boyutu.'}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#BCC7D2]/60 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#253341]">
                Parametre: <code className="bg-[#F5F9F5] px-1.5 py-0.5 rounded border border-[#BCC7D2] text-[#253341]">{dim.api_name.replace('customEvent:', '')}</code>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
