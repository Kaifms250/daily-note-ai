import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIChat, type AIMessage } from "@/hooks/useAIChat";
import { format } from "date-fns";

interface AICoachProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AICoach({ isOpen, onToggle }: AICoachProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleClose = () => {
    clearMessages();
    setInput("");
    onToggle();
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={onToggle}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-neon flex items-center justify-center"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] glass-card border-primary/20 neon-glow-blue flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold tracking-wider text-foreground">AI Coach</h3>
                  <p className="text-[10px] text-neon-green">Online</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Ask me anything about productivity</p>
                  <div className="mt-3 space-y-1.5">
                    {["Why didn't I complete tasks?", "Optimize my day", "How to stay focused?", "Summarize my progress"].map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary/20" : "bg-neon-purple/20"
                  }`}>
                    {msg.role === "user" ? <User className="h-3 w-3 text-primary" /> : <Bot className="h-3 w-3 text-neon-purple" />}
                  </div>
                  <div className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{format(msg.timestamp, "h:mm a")}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-neon-purple/20">
                    <Bot className="h-3 w-3 text-neon-purple" />
                  </div>
                  <div className="bg-secondary rounded-lg px-3 py-2 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your AI coach..."
                  className="input-dark text-xs"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={!input.trim() || isLoading} size="icon" className="btn-neon shrink-0 h-9 w-9">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
