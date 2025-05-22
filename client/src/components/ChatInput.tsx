import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSendMessage, disabled = false, placeholder = "Type your message..." }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || disabled) return;
    
    onSendMessage(inputMessage.trim());
    setInputMessage("");
    
    // Reset textarea height
    const textarea = document.getElementById("chat-input") as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 safe-area-pb">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            id="chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full px-4 py-3 bg-gray-100 rounded-2xl border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-base resize-none min-h-[48px] max-h-32 overflow-y-auto disabled:opacity-50"
            placeholder={placeholder}
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || disabled}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          style={{ backgroundColor: inputMessage.trim() && !disabled ? '#2563eb' : '#d1d5db' }}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}