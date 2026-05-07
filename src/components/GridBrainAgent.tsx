import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import { agentResponses } from "@/data/mock";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
  timestamp: string;
}

const quickPrompts = [
  "Where should BESCOM deploy the next charging station?",
  "Which zones are at highest overload risk?",
  "Suggest off-peak charging strategy",
  "Explain why Zone A risk score is high",
  "Predict future stress zones",
];

function getTimeStr() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }) + " IST";
}

function getAgentReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(agentResponses)) {
    if (key === "default") continue;
    if (lower.includes(key.toLowerCase().slice(0, 20)) || key.toLowerCase().includes(lower.slice(0, 20))) {
      return value;
    }
  }
  // keyword fallback
  if (lower.includes("deploy") || lower.includes("station") || lower.includes("charger") || lower.includes("install")) {
    return agentResponses["Where should BESCOM deploy the next charging station?"];
  }
  if (lower.includes("risk") || lower.includes("overload") || lower.includes("danger")) {
    return agentResponses["Which zones are at highest overload risk?"];
  }
  if (lower.includes("off-peak") || lower.includes("strategy") || lower.includes("pricing") || lower.includes("tou")) {
    return agentResponses["Suggest off-peak charging strategy"];
  }
  if (lower.includes("score") || lower.includes("why") || lower.includes("explain") || lower.includes("shap")) {
    return agentResponses["Explain why Zone A risk score is high"];
  }
  if (lower.includes("predict") || lower.includes("future") || lower.includes("stress") || lower.includes("forecast")) {
    return agentResponses["Predict future stress zones"];
  }
  return agentResponses["default"];
}

export function GridBrainAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "agent",
      text: "Hello! I'm **GridBrain Agent** — your AI-powered grid intelligence copilot. Ask me anything about EV charging, grid risk, or infrastructure planning across Bengaluru.",
      timestamp: getTimeStr(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim(), timestamp: getTimeStr() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = getAgentReply(text);
      const agentMsg: Message = { id: Date.now() + 1, role: "agent", text: reply, timestamp: getTimeStr() };
      setTyping(false);
      setMessages((m) => [...m, agentMsg]);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-xl group"
            style={{ boxShadow: "0 0 30px hsl(187 92% 48% / 0.5), 0 0 60px hsl(187 92% 48% / 0.2)" }}
          >
            <Bot className="w-6 h-6 text-primary-foreground" />
            {/* pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-primary" />
            <span className="absolute -inset-1 rounded-full border-2 border-primary/40 animate-glow-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] rounded-2xl border border-border overflow-hidden flex flex-col backdrop-blur-2xl"
            style={{
              background: "hsl(var(--card) / 0.97)",
              boxShadow: "var(--shadow-elevated), 0 0 40px hsl(var(--primary) / 0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-sm flex items-center gap-1.5">
                  GridBrain Agent <Sparkles className="w-3.5 h-3.5 text-primary" />
                </p>
                <p className="text-[10px] font-mono text-success">ONLINE · Bengaluru Grid</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/50 border border-border/60 text-foreground rounded-bl-md"
                    )}
                  >
                    <div
                      className="whitespace-pre-wrap [&_strong]:font-semibold [&_strong]:text-primary"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                    <p
                      className={cn(
                        "text-[9px] font-mono mt-2",
                        msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <div className="bg-muted/50 border border-border/60 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs">GridBrain is thinking…</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && !typing && (
              <div className="px-4 pb-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Suggested</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      {q.length > 40 ? q.slice(0, 38) + "…" : q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-border/40">
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask GridBrain anything…"
                  className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
                  disabled={typing}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || typing}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0",
                    input.trim() && !typing
                      ? "bg-gradient-primary text-primary-foreground glow-primary"
                      : "bg-muted/30 text-muted-foreground"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground/60 text-center mt-2">
                GridBrain Agent v2.4 · AI responses are simulated for this prototype
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
