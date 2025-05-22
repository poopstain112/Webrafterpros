import { useEffect, useRef } from "react";
import { Facebook } from "lucide-react";
import { Message } from "@/types";

interface ChatMessagesProps {
  messages: Message[];
  onShowSocialMedia?: () => void;
}

export default function ChatMessages({ messages, onShowSocialMedia }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages-container">
      {messages.map((message, i) => (
        <div
          key={i}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
              message.role === "user"
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
            }`}
          >
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
            
            {/* Social Media Button in Message - shown only for assistant messages about social media */}
            {message.role === "assistant" && 
             message.content.toLowerCase().includes("social media") && onShowSocialMedia && (
              <div className="mt-3">
                <button
                  onClick={onShowSocialMedia}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <Facebook className="h-4 w-4" />
                  Add Social Media
                </button>
              </div>
            )}
            
            {/* Loading indicator */}
            {(message as any).isLoading && (
              <div className="flex items-center justify-center mt-3 py-1">
                <div className="flex space-x-1.5">
                  <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef}></div>
    </div>
  );
}