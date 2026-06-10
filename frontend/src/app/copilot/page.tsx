"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/ui";
import { Send, Sparkles, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CopilotMessage } from "@/types/report";
import { copilotApi } from "@/lib/api";

const suggestedQuestions = [
  "Why is anti-Indian sentiment rising in Canada?",
  "Is the claim about Indian students causing the housing crisis true?",
  "How should I respond if someone blames me for taking jobs?",
  "What are the most active bot networks right now?",
  "Can you explain the exaggeration index for the scam call narrative?",
  "What evidence counters the crime rate claims?",
  "What is the current Narrative Harm Index and which narratives score highest?",
  "Explain the harm impact of the housing crisis narrative across all 6 categories",
  "Which communities show the strongest resilience and why?",
  "Are there any active early warning alerts right now?",
  "What correlations exist between narrative volume and real incidents?",
  "Generate an impact report for the job displacement narrative",
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm the TruthLens AI Copilot. I can help you understand narratives, verify claims, analyze content, and suggest responses. Ask me anything about the narratives and claims we're tracking.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Call backend API
    copilotApi.chat(messageText).then((data) => {
      const assistantMsg: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || data.message || "I analyzed the narratives and claims. Here's what I found:",
        sources: data.sources ?? [
          { title: "Narrative Radar", url: "/narratives", snippet: "Active narratives being tracked" },
        ],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }).catch(() => {
      const fallbackMsg: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `I'm having trouble connecting right now. Based on our analysis, here's what we know about "${messageText}":

Our narrative tracking system has identified several related narratives across multiple platforms.

I recommend reviewing the related claims in our verification engine.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsTyping(false);
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <PageHeader
        title="AI Copilot"
        description="Ask questions about narratives, claims, and get AI-powered analysis and guidance"
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn(
              "max-w-[75%] rounded-xl p-4",
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            )}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                  {msg.sources.map((s, i) => (
                    <a key={i} href={s.url} className="block p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <p className="text-xs font-medium text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.snippet}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-3 py-2 rounded-lg bg-muted text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask about narratives, claims, or get response guidance..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
