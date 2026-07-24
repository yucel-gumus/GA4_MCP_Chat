import React, { useState, useRef, useEffect } from 'react';
import { useAskApi } from '../hooks/useAskApi';
import type { AskResponse, AiDecision, GA4ReportData, AccountSummary } from '../../../api/ask';
import { filterAnalyticsData } from '../utils/filterAnalyticsData';
import { GA4ReportRenderer } from './renderers/GA4ReportRenderer';
import { AccountSummariesRenderer } from './renderers/AccountSummariesRenderer';
import { CustomDimensionsRenderer } from './renderers/CustomDimensionsRenderer';
import { GenericJsonRenderer } from './renderers/GenericJsonRenderer';

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      askMutation.mutate(text, {
        onSuccess: (data) => {
          const filteredData = filterAnalyticsData(data.mcp_result);

          const aiMessage: Message = {
            sender: 'ai',
            text: data.ai_summary || data.ai_decision?.reasoning || 'Sorgunuz başarıyla işlendi.',
            data: filteredData,
            aiDecision: data.ai_decision,
            timestamp: new Date(),
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
      minute: '2-digit',
    });
  };

  const renderAnalyticsData = (data: unknown) => {
    if (!data) return null;

    // 1. GA4 Report Data Check
    const reportData = data as GA4ReportData;
    if (reportData.rows && reportData.dimension_headers && reportData.metric_headers) {
      return <GA4ReportRenderer data={reportData} />;
    }

    // 2. GA4 Account Summaries Check
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0] as Partial<AccountSummary>;
      if (firstItem.account || firstItem.property_summaries) {
        return <AccountSummariesRenderer data={data as AccountSummary[]} />;
      }
    }

    // 3. Custom Dimensions Check
    const customDimObj = data as { custom_dimensions?: any[] };
    if (customDimObj && Array.isArray(customDimObj.custom_dimensions)) {
      return <CustomDimensionsRenderer data={customDimObj as any} />;
    }

    // 4. Generic JSON Fallback
    return <GenericJsonRenderer data={data} />;
  };

  const quickQuestions = [
    'GA4 hesap bilgilerimi getir',
    'Custom dimension bilgilerimi getir',
    'Son 7 günlük rapor ver',
    'Etkileşim oranına göre en iyi sayfam hangisi ?',
  ];

  return (
    <div className="flex flex-col h-screen bg-[#FFEBD3] text-[#3D261C]">
      {/* Top Navigation Bar (60-30-10 Palette Architecture) */}
      <header className="bg-[#FFEBD3]/90 backdrop-blur-md border-b-2 border-[#FFB6A6] px-6 py-4 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 10% Accent #9BCEC1 Icon Box */}
            <div className="p-2.5 bg-[#9BCEC1] border-2 border-[#FFB6A6] rounded-2xl text-[#3D261C] shadow-sm animate-pulse-glow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#3D261C] tracking-tight leading-tight">
                GA4 Analytics
              </h1>
              <p className="text-xs text-[#7A5343] font-bold mt-0.5">
                Google Analytics Veri & İçgörü Asistanı
              </p>
            </div>
          </div>

          {/* Active Status Badge */}
          <div className="flex items-center gap-2 bg-[#9BCEC1]/40 border-2 border-[#FFB6A6] px-3.5 py-1.5 rounded-full shadow-2xs">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9BCEC1] opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9BCEC1] border border-[#3D261C]"></span>
            </span>
            <span className="text-[11px] font-extrabold text-[#3D261C] uppercase tracking-wider">GA4 Canlı</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-10 px-4 space-y-8 max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-[#9BCEC1]/30 border-2 border-[#FFB6A6] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-10 h-10 text-[#3D261C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-[#3D261C] tracking-tight">
                  KENSAI GA4 Analytics
                </h2>
                <p className="text-xs sm:text-sm text-[#7A5343] font-bold leading-relaxed max-w-lg mx-auto">
                  Google Analytics verilerinizi sohbet ederek sorgulayın. Raporlar oluşturabilir, custom dimension'larınızı yönetebilir ve sayfa performanslarınızı derinlemesine inceleyebilirsiniz.
                </p>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="space-y-3">
                <div className="text-center text-[11px] font-extrabold text-[#7A5343] uppercase tracking-widest">
                  Önerilen Hızlı Sorular
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setText(question)}
                      className="p-4 bg-[#FFB6A6]/30 hover:bg-[#9BCEC1]/40 border-2 border-[#FFB6A6] rounded-2xl transition-all duration-200 text-xs sm:text-sm text-left text-[#3D261C] font-extrabold flex items-center gap-3 active:scale-[0.98] shadow-2xs"
                    >
                      <span className="w-2.5 h-2.5 bg-[#9BCEC1] border border-[#FFB6A6] rounded-full shrink-0"></span>
                      <span>{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${msg.sender === 'user' ? 'ml-10' : 'mr-10'}`}>
                <div
                  className={`p-5 rounded-3xl border-2 shadow-sm ${msg.sender === 'user'
                    ? 'bg-[#FFB6A6] text-[#3D261C] border-[#FFB6A6] rounded-br-xs font-bold'
                    : 'bg-[#FFEBD3] text-[#3D261C] border-[#FFB6A6] rounded-bl-xs'
                    }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed font-extrabold whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  {msg.sender === 'ai' && msg.data && renderAnalyticsData(msg.data)}
                </div>

                <div
                  className={`flex items-center gap-1.5 mt-2 text-[10px] font-black text-[#7A5343] uppercase tracking-wider ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <span>{msg.sender === 'user' ? 'Siz' : 'KENSAI'}</span>
                  <span>•</span>
                  <span>{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {askMutation.isPending && (
            <div className="flex justify-start mr-10">
              <div className="bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-3xl rounded-bl-xs p-4 shadow-sm flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#9BCEC1] border border-[#FFB6A6] rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-[#9BCEC1] border border-[#FFB6A6] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2.5 h-2.5 bg-[#9BCEC1] border border-[#FFB6A6] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-xs text-[#3D261C] font-extrabold animate-pulse">
                  GA4 verileriniz analiz ediliyor...
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex justify-start mr-10">
              <div className="bg-[#FFB6A6]/40 border-2 border-[#FFB6A6] rounded-3xl rounded-bl-xs p-4 shadow-sm flex items-start gap-3 max-w-md">
                <svg className="w-5 h-5 text-[#3D261C] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="space-y-1">
                  <div className="text-xs font-black text-[#3D261C]">Sorgu Hatası</div>
                  <span className="text-[11px] text-[#7A5343] font-bold leading-relaxed">{error}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Form (30% #FFB6A6 & 10% #9BCEC1 CTA) */}
        <div className="bg-[#FFEBD3] border-t-2 border-[#FFB6A6] p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2.5">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  className="w-full pl-4 pr-10 py-3.5 bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-2xl text-xs sm:text-sm font-extrabold text-[#3D261C] placeholder-[#7A5343]/70 focus:outline-none focus:border-[#9BCEC1] focus:ring-2 focus:ring-[#9BCEC1]/40 transition-all duration-200"
                  placeholder="GA4 verileriniz hakkında soru sorun... (örn: 'son 7 günlük rapor ver')"
                  value={text}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
                  disabled={askMutation.isPending}
                />
                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="absolute right-3.5 text-[#7A5343] hover:text-[#3D261C] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 10% Primary CTA Button: Sage Mint #9BCEC1 */}
              <button
                type="submit"
                disabled={askMutation.isPending || !text.trim()}
                className="px-6 py-3.5 bg-[#9BCEC1] hover:bg-[#8ABDB0] text-[#3D261C] border-2 border-[#FFB6A6] rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-black text-xs sm:text-sm shadow-sm flex items-center justify-center shrink-0 active:scale-[0.98]"
              >
                {askMutation.isPending ? (
                  <svg className="w-5 h-5 animate-spin text-[#3D261C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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