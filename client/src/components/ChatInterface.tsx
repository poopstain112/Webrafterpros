import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold">Design Your Website</h2>
        <p className="text-sm text-gray-500">
          Describe your ideal website and I'll create it for you
        </p>
      </div>

      {/* Chat Messages */}
      <div className="overflow-y-auto p-4 flex-grow">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                msg.role === "user" && "justify-end"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  "rounded-lg p-3 max-w-[85%]",
                  msg.role === "assistant"
                    ? "bg-gray-100"
                    : "bg-blue-500/10",
                  msg.isLoading && "animate-pulse"
                )}
              >
                {msg.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    <p className="text-gray-500">Generating response...</p>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-line">{msg.content}</p>
                    {msg.images && msg.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.images.map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative w-16 h-16 rounded-md overflow-hidden"
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
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ImageUpload
                onUpload={onImageUpload}
                uploadedImages={uploadedImages}
                onRemoveImage={onRemoveImage}
                isVisible={isUploadVisible}
                onToggleVisible={() => setIsUploadVisible(!isUploadVisible)}
              />

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message or request changes..."
                className="flex-grow py-2 px-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none min-h-[40px] max-h-[120px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <Button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {message.toLowerCase().includes("website") && 
            message.toLowerCase().includes("creat") && (
              <Button
                type="button"
                onClick={handleGenerateWebsite}
                className="bg-green-500 text-white hover:bg-green-600 transition"
              >
                Generate Website from Description
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
