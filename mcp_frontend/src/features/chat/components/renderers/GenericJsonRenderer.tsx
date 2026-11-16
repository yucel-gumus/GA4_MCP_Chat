import React from 'react';

interface GenericJsonRendererProps {
  data: unknown;
}

export const GenericJsonRenderer: React.FC<GenericJsonRendererProps> = ({ data }) => {
  return (
    <div className="mt-3 bg-[#DCE3EA] border-2 border-[#BCC7D2] rounded-xl p-3.5 shadow-sm text-xs font-mono">
      <div className="flex items-center gap-2 border-b border-[#BCC7D2] pb-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-[#EC7D55]"></span>
        <span className="font-bold text-[10px] text-[#253341] uppercase tracking-wider">Ham Veri Çıktısı</span>
      </div>
      <pre className="overflow-x-auto bg-[#F5F9F5] border border-[#BCC7D2]/60 rounded-lg p-2.5 text-[#253341] font-semibold whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
