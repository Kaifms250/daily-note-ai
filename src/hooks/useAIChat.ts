import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useAIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (
    prompt: string,
    noteContent?: string,
    action?: "summarize" | "rewrite" | "improve" | "chat"
  ) => {
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { prompt, noteContent, action },
      });

      if (error) {
        console.error("AI function error:", error);
        throw new Error(error.message || "Failed to get AI response");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      return data.response;
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "AI is temporarily unavailable";
      
      toast({
        title: "AI Assistant",
        description: errorMessage,
        variant: "destructive",
      });

      const errorAssistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I'm sorry, I encountered an issue: ${errorMessage}. Please try again in a moment.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorAssistantMessage]);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
