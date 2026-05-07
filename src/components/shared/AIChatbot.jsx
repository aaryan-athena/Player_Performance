import { useState, useRef, useEffect } from 'react';
import { createChatSession, sendMessage } from '../../services/geminiService.js';

// Parse inline markdown: **bold**, *italic*, `code`
function parseInline(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;
  let keyIdx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const chunk = match[0];
    if (chunk.startsWith('**')) {
      parts.push(<strong key={keyIdx++}>{chunk.slice(2, -2)}</strong>);
    } else if (chunk.startsWith('*')) {
      parts.push(<em key={keyIdx++}>{chunk.slice(1, -1)}</em>);
    } else {
      parts.push(<code key={keyIdx++} className="bg-gray-100 px-1 rounded text-xs font-mono">{chunk.slice(1, -1)}</code>);
    }
    lastIndex = match.index + chunk.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// Convert a markdown string to React elements
function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-0.5 my-1 ml-1">
          {listBuffer}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<p key={i} className="font-semibold text-sm mt-2 mb-0.5">{parseInline(line.slice(4))}</p>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<p key={i} className="font-bold text-sm mt-2 mb-0.5">{parseInline(line.slice(3))}</p>);
    } else if (line.startsWith('# ')) {
      flushList();
      elements.push(<p key={i} className="font-bold text-base mt-2 mb-1">{parseInline(line.slice(2))}</p>);
    } else if (/^[-*] /.test(line)) {
      listBuffer.push(<li key={i}>{parseInline(line.slice(2))}</li>);
    } else if (/^  [-*] /.test(line)) {
      listBuffer.push(<li key={i} className="ml-4">{parseInline(line.slice(4))}</li>);
    } else if (line.trim() === '') {
      flushList();
      elements.push(<div key={i} className="h-1" />);
    } else {
      flushList();
      elements.push(<p key={i} className="leading-relaxed">{parseInline(line)}</p>);
    }
  });
  flushList();
  return elements;
}

/**
 * Floating AI chatbot widget for player and coach pages.
 * @param {string|null} props.systemPrompt - Role-specific system instruction (null while data loads)
 * @param {string}      props.role         - 'player' | 'coach'
 */
function AIChatbot({ systemPrompt, role = 'player' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatSessionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Create the chat session only once real data is available.
  // If the prompt changes while no user messages have been sent yet, reset so
  // the session picks up the accurate player/team stats.
  useEffect(() => {
    if (!isOpen || !systemPrompt) return;

    const hasUserMessages = messages.some(m => m.role === 'user');

    if (!chatSessionRef.current || !hasUserMessages) {
      chatSessionRef.current = createChatSession(systemPrompt);

      if (!hasUserMessages) {
        const greeting = role === 'coach'
          ? "Hello Coach! I'm your AI assistant. Ask me anything about your players, team performance, or coaching strategies."
          : "Hi! I'm your AI performance coach. Ask me about your scores, how to improve, or anything about your training.";
        setMessages([{ role: 'assistant', text: greeting }]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, systemPrompt, role]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setLoading(true);

    try {
      const responseText = await sendMessage(chatSessionRef.current, trimmed);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (err) {
      console.error('Gemini error:', err);
      setError('Failed to get a response. Please check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const accentColor = role === 'coach' ? 'bg-green-600' : 'bg-blue-600';
  const accentHover = role === 'coach' ? 'hover:bg-green-700' : 'hover:bg-blue-700';
  const accentBorder = role === 'coach' ? 'border-green-600' : 'border-blue-600';
  const accentText = role === 'coach' ? 'text-green-600' : 'text-blue-600';
  const accentBg = role === 'coach' ? 'bg-green-50' : 'bg-blue-50';

  const dataReady = !!systemPrompt;

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ maxHeight: '75vh' }}
        >
          {/* Header */}
          <div className={`${accentColor} px-4 py-3 flex items-center justify-between flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                AI
              </div>
              <p className="text-white font-semibold text-sm leading-tight">
                {role === 'coach' ? 'Coach AI Assistant' : 'Performance AI Coach'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Loading state — data not yet ready */}
          {!dataReady ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-gray-400 text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p>Loading your performance data…</p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className={`w-6 h-6 rounded-full ${accentColor} flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1`}>
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? `${accentColor} text-white rounded-br-sm`
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm space-y-0.5'
                      }`}
                    >
                      {msg.role === 'user' ? msg.text : renderMarkdown(msg.text)}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className={`w-6 h-6 rounded-full ${accentColor} flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1`}>
                      AI
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className={`w-2 h-2 rounded-full ${accentColor} animate-bounce`} style={{ animationDelay: '0ms' }} />
                        <span className={`w-2 h-2 rounded-full ${accentColor} animate-bounce`} style={{ animationDelay: '150ms' }} />
                        <span className={`w-2 h-2 rounded-full ${accentColor} animate-bounce`} style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs">
                    {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested prompts — shown only before any user message */}
              {messages.length === 1 && (
                <div className={`px-3 py-2 ${accentBg} border-t border-gray-100 flex-shrink-0`}>
                  <p className={`text-xs ${accentText} font-medium mb-1.5`}>Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(role === 'coach'
                      ? ['Who is my top performer?', 'Who needs improvement?', 'Suggest a training plan']
                      : ['How can I improve my score?', 'What does my trend mean?', 'Tips for my sport']
                    ).map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                        className={`text-xs px-2.5 py-1 rounded-full border ${accentBorder} ${accentText} bg-white transition-colors`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex items-end gap-2 p-3 border-t border-gray-200 bg-white flex-shrink-0">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-28 overflow-y-auto"
                  style={{ minHeight: '40px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`${accentColor} ${accentHover} text-white rounded-xl p-2.5 transition-colors disabled:opacity-40 flex-shrink-0`}
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 ${accentColor} ${accentHover} text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105`}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
      </button>
    </>
  );
}

export default AIChatbot;
