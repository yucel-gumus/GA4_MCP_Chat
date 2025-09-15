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
      });;
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

    if (data.rows && data.dimension_headers && data.metric_headers) {
      return (
        <div className="mt-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-semibold text-blue-700">GA4 Analytics Raporu</span>
          </div>

          {/* Headers */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Boyutlar:</h4>
              <div className="space-y-1">
                {data.dimension_headers.map((header: any, idx: number) => (
                  <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1">
                    {header.name.replace('customEvent:', '')}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Metrikler:</h4>
              <div className="space-y-1">
                {data.metric_headers.map((header: any, idx: number) => (
                  <span key={idx} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1">
                    {header.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {data.dimension_headers.map((header: any, idx: number) => (
                    <th
                      key={idx}
                      className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-700"
                    >
                      {header.name.replace('customEvent:', '')}
                    </th>
                  ))}
                  {data.metric_headers.map((header: any, idx: number) => (
                    <th
                      key={idx}
                      className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-700"
                    >
                      {header.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(0, 10).map((row: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.dimension_values
                      .filter((dim: any) => dim.value && dim.value !== '(not set)')
                      .map((dim: any, dimIdx: number) => (
                        <td
                          key={dimIdx}
                          className="border border-gray-300 px-2 py-1 text-xs"
                        >
                          {dim.value}
                        </td>
                      ))}
                    {row.metric_values
                      .filter((metric: any) => metric.value && metric.value !== '(not set)')
                      .map((metric: any, metricIdx: number) => (
                        <td
                          key={metricIdx}
                          className="border border-gray-300 px-2 py-1 text-xs font-mono"
                        >
                          {metric.value}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.rows.length > 10 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ve {data.rows.length - 10} satır daha...
              </p>
            )}
          </div>


          <div className="mt-3 text-xs text-gray-600">
            Toplam {data.row_count} kayıt • Saat dilimi: {data.metadata?.time_zone}
          </div>
        </div>
      );
    }

    if (data.account || data.property_summaries || data.custom_dimensions) {
      return (
        <div className="mt-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-green-700">GA4 Hesap/Mülk Bilgisi</span>
          </div>
          <pre className="whitespace-pre-wrap break-words bg-white p-3 rounded border text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="mt-3 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4 text-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span className="font-semibold text-gray-700">Veri Yanıtı</span>
        </div>
        <pre className="whitespace-pre-wrap break-words bg-white p-3 rounded border text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">GA4 MCP Sohbet</h1>
            <p className="text-sm text-gray-600">Google Analytics verilerinizi sohbet ederek keşfedin</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Aktif</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">GA4 Analytics Sohbotuna Hoş Geldiniz!</h3>
              <p className="text-gray-600 mb-6">Google Analytics verilerinizi sorarak keşfedin. Hızlı başlamak için aşağıdaki sorulardan birini deneyin:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setText(question)}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-sm text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      {question}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${msg.sender === 'user' ? 'order-2' : ''}`}>
                <div
                  className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md ml-12'
                    : 'bg-white border border-gray-200 rounded-bl-md mr-12'
                    }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {msg.sender === 'ai' && msg.data && renderAnalyticsData(msg.data)}
                </div>

                <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                  <span>{msg.sender === 'user' ? 'Siz' : 'GA4 Asistan'}</span>
                  <span>•</span>
                  <span>{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {askMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-4 mr-12 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">GA4 verileriniz analiz ediliyor...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-md p-4 mr-12 shadow-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full p-4 pr-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="GA4 verileriniz hakkında soru sorun... (örn: 'son 7 günlük rapor ver')"
                  value={text}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
                  disabled={askMutation.isPending}
                />
                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm"
              >
                {askMutation.isPending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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