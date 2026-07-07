import React, { useState, useRef, useEffect } from 'react';
import { useAskApi } from '../hooks/useAskApi';
import type { AskResponse, AiDecision } from '../../../api/ask';
import { filterAnalyticsData } from '../utils/filterAnalyticsData';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  data?: AskResponse['mcp_result'];
  aiDecision?: AiDecision;
  timestamp: Date;
}

function ChatPage(): React.ReactElement {
  const [text, setText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const askMutation = useAskApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text.trim()) {
      setError(null);

      const userMessage: Message = {
        sender: 'user',
        text: text.trim(),
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, userMessage]);

      askMutation.mutate(text, {
        onSuccess: (data) => {
          const filteredData = filterAnalyticsData(data.mcp_result);

          const aiMessage: Message = {
            sender: 'ai',
            text: data.ai_decision.reasoning,
            data: filteredData,
            aiDecision: data.ai_decision,
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, aiMessage]);
        },
        onError: (err) => {
          setError('Bir hata oluştu: ' + (err as Error).message);
        },
      });
      setText('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAnalyticsData = (data: any) => {
    if (!data) return null;

    // 1. GA4 Report Renderer
    if (data.rows && data.dimension_headers && data.metric_headers) {
      // Calculate totals for quick overview cards
      const totals: Record<string, number> = {};
      data.metric_headers.forEach((header: any, mIdx: number) => {
        let sum = 0;
        data.rows.forEach((row: any) => {
          const val = parseFloat(row.metric_values[mIdx]?.value || '0');
          if (!isNaN(val)) sum += val;
        });
        totals[header.name] = sum;
      });

      return (
        <div className="mt-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <span className="font-semibold text-xs text-slate-800">GA4 Analytics Raporu</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Saat Dilimi: {data.metadata?.time_zone || 'Etc/GMT'}
            </span>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.metric_headers.map((header: any, mIdx: number) => {
              const name = header.name;
              const value = totals[name];
              const formattedValue = header.type_ === 'TYPE_INTEGER' 
                ? new Intl.NumberFormat('tr-TR').format(value) 
                : value.toFixed(2);
              
              // Friendly naming mapping
              const friendlyNames: Record<string, string> = {
                eventCount: 'Toplam Etkinlik',
                totalUsers: 'Toplam Kullanıcı',
                activeUsers: 'Aktif Kullanıcı',
                sessions: 'Oturum Sayısı',
                screenPageViews: 'Sayfa Görüntüleme',
                engagementRate: 'Etkileşim Oranı',
              };

              return (
                <div key={mIdx} className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {friendlyNames[name] || name}
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-bold text-slate-800 tracking-tight">{formattedValue}</span>
                    {name === 'engagementRate' && <span className="text-sm font-semibold text-slate-500">%</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dimension & Metric Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-100/50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
              <span className="font-semibold text-slate-500">Boyut:</span>
              {data.dimension_headers.map((h: any, i: number) => (
                <span key={i} className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                  {h.name.replace('customEvent:', '')}
                </span>
              ))}
            </div>
          </div>

          {/* Data Table */}
          {data.rows.length > 0 ? (
            <div className="overflow-hidden border border-slate-150 rounded-xl shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                      {data.dimension_headers.map((h: any, i: number) => (
                        <th key={i} className="px-4 py-3">{h.name.replace('customEvent:', '')}</th>
                      ))}
                      {data.metric_headers.map((h: any, i: number) => (
                        <th key={i} className="px-4 py-3 text-right">{h.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {data.rows.slice(0, 10).map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors duration-150">
                        {row.dimension_values.map((dim: any, dIdx: number) => (
                          <td key={dIdx} className="px-4 py-2.5 font-medium text-slate-900">
                            {dim.value === '(not set)' ? 'Belirtilmemiş' : dim.value}
                          </td>
                        ))}
                        {row.metric_values.map((met: any, mIdx: number) => (
                          <td key={mIdx} className="px-4 py-2.5 text-right font-mono font-medium text-slate-800">
                            {met.value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.rows.length > 10 && (
                <div className="bg-slate-50/50 text-center py-2 border-t border-slate-100 text-[11px] font-medium text-slate-500">
                  Toplam {data.rows.length} kayıttan ilk 10 satır gösteriliyor.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-xl p-6 text-center shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Bu zaman diliminde herhangi bir rapor verisi bulunamadı.</span>
            </div>
          )}
        </div>
      );
    }

    // 2. GA4 Account summaries renderer (Beautiful Card lists)
    const isAccountSummaries = Array.isArray(data) && data.length > 0 && (data[0].account || data[0].property_summaries);
    if (isAccountSummaries) {
      return (
        <div className="mt-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-xs text-slate-800">GA4 Hesap & Mülk Yapısı</span>
          </div>

          <div className="space-y-4">
            {data.map((acc: any, accIdx: number) => (
              <div key={accIdx} className="border border-slate-150 rounded-xl bg-white p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{acc.display_name}</h4>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    ID: {acc.account.replace('accounts/', '')}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {(acc.property_summaries || []).map((prop: any, propIdx: number) => (
                    <div key={propIdx} className="bg-slate-50 border border-slate-100 hover:border-emerald-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all duration-200">
                      <div>
                        <div className="font-semibold text-xs text-slate-800">{prop.display_name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Tip: {prop.property_type}</div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                          Mülk ID: {prop.property.replace('properties/', '')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Generic JSON / Pre fallback (Premium style)
    return (
      <div className="mt-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-slate-500"></span>
          <span className="font-semibold text-xs text-slate-800">Yanıt Detayları</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-4">
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const quickQuestions = [
    "GA4 hesap bilgilerimi getir",
    "Custom dimension bilgilerimi getir",
    "Son 7 günlük rapor ver",
    "Etkileşim oranına göre en iyi sayfam hangisi ?"
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-xl text-white shadow-md shadow-indigo-150">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">GA4 MCP Sohbet</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Google Analytics verilerinizi sohbet ederek keşfedin</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Aktif</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12 px-4 space-y-8 max-w-2xl mx-auto">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">GA4 Analytics Asistanı</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Analytics verilerinize doğrudan sohbet ederek erişin. Rapor alabilir, custom dimension'larınızı listeleyebilir ve web sitesi performansınızı inceleyebilirsiniz.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Hızlı Başlangıç Önerileri
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setText(question)}
                      className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all duration-200 text-xs sm:text-sm text-left text-slate-700 font-medium flex items-center gap-3 active:scale-[0.98]"
                    >
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                      <span>{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${msg.sender === 'user' ? 'ml-12' : 'mr-12'}`}>
                <div
                  className={`p-4 rounded-2xl border shadow-sm ${msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-slate-800 to-slate-900 text-white border-slate-950 rounded-br-none'
                    : 'bg-white text-slate-800 border-slate-150 rounded-bl-none'
                    }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                  {msg.sender === 'ai' && msg.data && renderAnalyticsData(msg.data)}
                </div>

                <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                  <span>{msg.sender === 'user' ? 'Siz' : 'Asistan'}</span>
                  <span>•</span>
                  <span>{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {askMutation.isPending && (
            <div className="flex justify-start mr-12">
              <div className="bg-white border border-slate-150 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-xs text-slate-500 font-semibold animate-pulse">GA4 verileriniz analiz ediliyor...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start mr-12 animate-shake">
              <div className="bg-red-50 border border-red-150 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-start gap-2.5 max-w-md">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-red-800">Sorgu Hatası</div>
                  <span className="text-[11px] text-red-700/90 font-medium leading-relaxed">{error}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="bg-white border-t border-slate-200 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  className="w-full pl-4 pr-10 py-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-slate-50/50"
                  placeholder="GA4 verileriniz hakkında soru sorun... (örn: 'son 7 günlük rapor ver')"
                  value={text}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
                  disabled={askMutation.isPending}
                />
                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={askMutation.isPending || !text.trim()}
                className="px-5 py-3.5 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-xs sm:text-sm shadow-md shadow-indigo-100 flex items-center justify-center shrink-0 active:scale-[0.98]"
              >
                {askMutation.isPending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  'Gönder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;