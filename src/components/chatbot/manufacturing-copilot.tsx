"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Trash2,
  Maximize2,
  Minimize2,
  Activity,
  ChevronRight,
  ExternalLink,
  Cpu,
  Layers,
  ShieldCheck,
  Package,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  suggestedActions?: Array<{ label: string; link?: string; query?: string }>;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: `👋 **Welcome to the Smart Manufacturing AI Copilot!**\n\nI am connected to your live factory database, IoT sensor streams, production lines, and warehouse inventory.\n\nHow can I assist your shop floor operations today?`,
    timestamp: "Just now",
    suggestedActions: [
      { label: "⚙️ Machine Health & Alerts", query: "What is the machine health status?" },
      { label: "🏭 Active Production Batches", query: "Show active production batches" },
      { label: "📦 Low Stock Inventory", query: "Which materials are low on stock?" },
      { label: "🔬 Quality Pass Rates", query: "What is our QA pass rate and defects?" },
    ],
  },
];

export function ManufacturingCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          conversationHistory: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "I received your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "⚠️ Sorry, I could not connect to the factory telemetry engine. Please check your network or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  // Helper function to format basic markdown-style text with bolding, lists, and links
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-cyan-400 mt-2 mb-1 flex items-center gap-1.5">
            {line.replace("### ", "")}
          </h4>
        );
      }
      // Bullet list item
      if (line.startsWith("• ") || line.startsWith("- ")) {
        const content = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-xs text-slate-300">
            <span className="text-cyan-400 mt-0.5 font-bold">•</span>
            <span>{parseInlineFormatting(content)}</span>
          </div>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="ml-1 my-0.5 text-xs text-slate-300">
            {parseInlineFormatting(line)}
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  const parseInlineFormatting = (text: string) => {
    // Replace **bold** and `code` patterns safely
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <Link
            key={i}
            href={linkMatch[2]}
            className="text-cyan-400 font-semibold underline hover:text-cyan-300 inline-flex items-center gap-0.5 ml-0.5"
          >
            {linkMatch[1]}
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* 1. Floating Launch Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-300/30 backdrop-blur-md"
            title="Open Manufacturing AI Assistant"
            aria-label="Open Manufacturing AI Assistant"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" style={{ animationDuration: "6s" }} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="tracking-wide">AI Copilot</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold uppercase">
              Live
            </span>
          </button>
        </div>
      )}

      {/* 2. Floating AI Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-slate-950/95 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            isExpanded
              ? "w-[94vw] sm:w-[680px] h-[85vh] max-h-[850px]"
              : "w-[94vw] sm:w-[440px] h-[600px] max-h-[88vh]"
          }`}
          style={{ backgroundColor: "#090d16" }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    Manufacturing AI Copilot
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Plant Telemetry</span>
                  <span>•</span>
                  <span>PostgreSQL Connected</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-slate-800/60 transition cursor-pointer"
                title="Clear conversation history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="hidden sm:inline-flex p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
                title={isExpanded ? "Collapse view" : "Expand view"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
                title="Close AI Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="px-4 py-1.5 bg-slate-900/40 border-b border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0">
            <span className="flex items-center gap-1 text-cyan-400">
              <Activity className="w-3 h-3" /> Live Factory State
            </span>
            <div className="flex items-center gap-2">
              <Link href="/machines" className="hover:text-cyan-300">Machines</Link>
              <span>•</span>
              <Link href="/production" className="hover:text-cyan-300">Production</Link>
              <span>•</span>
              <Link href="/inventory" className="hover:text-cyan-300">Inventory</Link>
              <span>•</span>
              <Link href="/quality" className="hover:text-cyan-300">QA</Link>
            </div>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-xs"
                      : "bg-slate-900/90 border border-slate-800/80 text-slate-200 rounded-tl-xs"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div>{renderFormattedText(msg.text)}</div>
                  )}

                  {/* Suggested Quick Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, idx) => (
                        action.link ? (
                          <Link
                            key={idx}
                            href={action.link}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition shadow-xs"
                          >
                            <span>{action.label}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </Link>
                        ) : (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(action.query || action.label)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition shadow-xs cursor-pointer"
                          >
                            <span>{action.label}</span>
                          </button>
                        )
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[9px] font-mono text-right ${
                      msg.sender === "user" ? "text-cyan-200/80" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-900/80 border border-blue-700/60 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs p-3.5 text-slate-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-slate-400 ml-1">Analyzing telemetry & ERP records...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900/90 border-t border-slate-800/80 shrink-0"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about machines, production, stock, QA..."
                disabled={isLoading}
                className="w-full pl-3.5 pr-11 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-1.5 p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 transition cursor-pointer"
                title="Send query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
              <span>Press Enter to send</span>
              <span className="text-cyan-500/80 font-mono">v2.4 Manufacturing Copilot</span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
