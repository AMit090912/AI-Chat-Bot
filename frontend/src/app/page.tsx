"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a random session ID on load
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
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl h-[85vh] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#252525] border-b border-neutral-800 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">AI Chatbot</h1>
            <p className="text-sm text-neutral-400 font-light">by Amit</p>
          </div>
          <div className="flex items-center text-neutral-400 text-sm">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            Online
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-base leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-neutral-600 to-neutral-800 text-white rounded-tr-none shadow-lg"
                    : "bg-[#2c2c2c] text-gray-200 border border-neutral-700 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <footer className="bg-[#252525] border-t border-neutral-800 p-5">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 bg-[#1e1e1e] border border-neutral-700 rounded-full px-6 py-4 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 w-14 h-14 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
