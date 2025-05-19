import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message, UploadedImage } from "@/types";
import ImageUpload from "./ImageUpload";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onImageUpload: (files: File[]) => void;
  uploadedImages: UploadedImage[];
  onRemoveImage: (index: number) => void;
  onGenerateWebsite?: (description: string) => void;
}

export default function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onImageUpload,
  uploadedImages,
  onRemoveImage,
  onGenerateWebsite,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      setIsUploadVisible(false);
    }
  };

  // Detect when message mentions website creation
  const handleGenerateWebsite = () => {
    if (onGenerateWebsite && message.trim()) {
      onGenerateWebsite(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0 mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-lg">Website Designer</h2>
          <p className="text-xs text-gray-500">
            Online • Powered by AI
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="overflow-y-auto p-4 flex-grow" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmOGZhZmMiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMjRhNiA2IDAgMSAxLTEyIDAgNiA2IDAgMCAxIDEyIDB6bTAgMTJhNiA2IDAgMSAxLTEyIDAgNiA2IDAgMCAxIDEyIDB6bTEyLTEyYTYgNiAwIDEgMS0xMiAwIDYgNiAwIDAgMSAxMiAwem0wIDEyYTYgNiAwIDEgMS0xMiAwIDYgNiAwIDAgMSAxMiAwek0xMiAyNGE2IDYgMCAxIDEtMTIgMCA2IDYgMCAwIDEgMTIgMHptMCAxMmE2IDYgMCAxIDEtMTIgMCA2IDYgMCAwIDEgMTIgMHoiIGZpbGw9IiNlOWVjZWYiIGZpbGwtb3BhY2l0eT0iLjIiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvZz48L3N2Zz4=')" }}>
        <div className="space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex items-end gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 8V4H8" />
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                    <path d="M2 14h2" />
                    <path d="M20 14h2" />
                    <path d="M15 13v2" />
                    <path d="M9 13v2" />
                  </svg>
                </div>
              )}

              <div
                className={cn(
                  "rounded-2xl p-3 max-w-[80%] shadow-sm",
                  msg.role === "assistant"
                    ? "bg-white rounded-tl-none"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none",
                  msg.isLoading && "animate-pulse"
                )}
              >
                {msg.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Typing...</p>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-line text-sm">{msg.content}</p>
                    {msg.images && msg.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.images.map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative rounded-lg overflow-hidden border border-white/20 shadow-md"
                            style={{ width: "120px", height: "90px" }}
                          >
                            <img
                              src={img.url}
                              alt={`Uploaded ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white flex-shrink-0 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-white border-t border-gray-200 shadow-sm sticky bottom-0 left-0 right-0">
        <form onSubmit={handleSubmit} className="relative">
          {isUploadVisible && (
            <div className="mb-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <ImageUpload
                onUpload={onImageUpload}
                uploadedImages={uploadedImages}
                onRemoveImage={onRemoveImage}
                isVisible={true}
                onToggleVisible={() => {}}
              />
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {/* Always visible input area */}
            <div className="relative flex items-end gap-2 bg-gray-50 rounded-full p-1 pl-3 border border-gray-200">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message Website Designer..."
                className="flex-grow py-2 px-2 bg-transparent border-none focus:ring-0 resize-none min-h-[24px] max-h-[80px] text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <div className="flex-shrink-0 flex">
                <Button
                  type="button"
                  onClick={() => setIsUploadVisible(!isUploadVisible)}
                  variant="ghost"
                  className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors mr-1"
                  size="icon"
                >
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="rounded-full w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm flex items-center justify-center"
                  size="icon"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Website generation button that can go below the screen */}
            {message.toLowerCase().includes("website") && 
            message.toLowerCase().includes("creat") && (
              <Button
                type="button"
                onClick={handleGenerateWebsite}
                className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition shadow-sm rounded-full"
              >
                ✨ Generate Website
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
