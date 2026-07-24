import React from 'react';

interface GenericJsonRendererProps {
  data: unknown;
}

export const GenericJsonRenderer: React.FC<GenericJsonRendererProps> = ({ data }) => {
  return (
    <div className="mt-3 bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-xl p-3.5 shadow-sm text-xs font-mono">
      <div className="flex items-center gap-2 border-b border-[#FFB6A6]/40 pb-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-[#9BCEC1]"></span>
        <span className="font-bold text-[10px] text-[#3D261C] uppercase tracking-wider">Ham Veri Çıktısı</span>
      </div>
      <pre className="overflow-x-auto text-[#3D261C] font-semibold whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
