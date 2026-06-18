"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Greetings! I am your advanced AI assistant. How may I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: "Sorry, there was an error processing your request." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "Network error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-white/20">
      
      <div className="w-full max-w-4xl h-[90vh] bg-[#0a0a0a] rounded-2xl border border-[#222] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <header className="border-b border-[#222] py-5 px-6 flex flex-col items-center justify-center relative bg-[#0a0a0a] z-20">
          <h1 className="text-xl font-medium tracking-wide text-white">Ai Chat Bot</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">by Amit</p>
          
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Online</span>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scroll-smooth">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full transition-all duration-300 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </div>
              )}
              
              <div
                className={`max-w-[75%] px-5 py-3.5 text-[14.5px] leading-relaxed tracking-wide ${
                  msg.role === "user"
                    ? "bg-white text-black rounded-2xl rounded-tr-sm font-medium"
                    : "bg-[#111] text-gray-300 border border-[#222] rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start transition-all duration-300">
               <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 opacity-50">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </div>
              <div className="bg-[#111] border border-[#222] rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <footer className="p-5 sm:p-6 bg-[#0a0a0a] border-t border-[#1a1a1a]">
          <form onSubmit={handleSubmit} className="flex gap-3 w-full relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#111] border border-[#333] rounded-xl px-5 py-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-[#151515] transition-colors text-[14.5px]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-white text-black hover:bg-gray-200 disabled:bg-[#222] disabled:text-[#555] border border-transparent w-[54px] h-[54px] rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed shrink-0"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[-1px]">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
