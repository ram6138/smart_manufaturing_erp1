"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
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
    text: `👋 **Factory AI Copilot is online.**\n\nAsk me anything about live machine states, production schedules, raw material inventory, or customer order planning.`,
    timestamp: "Now",
    suggestedActions: [
      { label: "⚙️ Running vs Idle Machines", query: "Which machines are running and which are idle?" },
      { label: "🎯 Plan 10,000 Chocolate Biscuits", query: "Plan production for 10,000 Chocolate Biscuits" },
      { label: "📦 Inventory Stock Check", query: "Which materials are low on stock?" },
      { label: "🔬 QA Pass Rates", query: "What is our QA pass rate and defects?" },
    ],
  },
];

export function ManufacturingCopilot() {
  const [isOpen, setIsOpen] = useState(false);
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
      setTimeout(() => inputRef.current?.focus(), 100);
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
          conversationHistory: messages.slice(-3),
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "Done.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "⚠️ Connection error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
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

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ") || line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-xs font-bold text-cyan-400 mt-2 mb-1">
            {line.replace(/^#+\s/, "")}
          </h4>
        );
      }
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-xs text-slate-300">
            <span className="text-cyan-400 font-bold">•</span>
            <span>{parseInlineFormatting(line.substring(2))}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="ml-1 my-0.5 text-xs text-slate-300">
            {parseInlineFormatting(line)}
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. Floating Launch Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 backdrop-blur-sm"
            title="Open AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" style={{ animationDuration: "8s" }} />
            <span className="tracking-wide">AI Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      )}

      {/* 2. Chat Modal */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col w-[92vw] sm:w-[420px] h-[540px] max-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3"
          style={{ backgroundColor: "#0b0f19" }}
        >
          {/* Simple Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-cyan-400 flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">Factory Copilot</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400">Live Telemetry & Planning</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-800/60">
                    <Bot className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div>{renderFormattedText(msg.text)}</div>
                  )}

                  {/* Suggested Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, idx) => (
                        action.link ? (
                          <Link
                            key={idx}
                            href={action.link}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900 transition"
                          >
                            <span>{action.label}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </Link>
                        ) : (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(action.query || action.label)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                          >
                            <span>{action.label}</span>
                          </button>
                        )
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[8px] font-mono text-right mt-1 ${
                      msg.sender === "user" ? "text-indigo-200/80" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-800/60">
                  <Bot className="w-3 h-3 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[11px] text-slate-400 ml-1">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Simple Clean Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-slate-900/90 border-t border-slate-800 shrink-0"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about machines, orders, inventory..."
                disabled={isLoading}
                className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-1.5 p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 transition cursor-pointer"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
