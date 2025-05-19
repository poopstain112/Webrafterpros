import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, ArrowLeft } from "lucide-react";
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
  const [showGuide, setShowGuide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      setIsUploadVisible(false);
      setIsFullscreen(false);
    }
  };

  // Detect when message mentions website creation
  const handleGenerateWebsite = () => {
    if (onGenerateWebsite && message.trim()) {
      onGenerateWebsite(message);
      setMessage("");
    }
  };

  // Render fullscreen input mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <Button
            type="button"
            onClick={() => setIsFullscreen(false)}
            variant="ghost"
            className="rounded-full w-10 h-10 flex items-center justify-center"
            size="icon"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="font-medium">Compose Message</div>
          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!message.trim() || isLoading}
            className="rounded-full px-4 py-1 bg-blue-500 text-white"
          >
            Send
          </Button>
        </div>
        
        {/* Body */}
        <div className="flex-grow p-4">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-full p-0 bg-transparent border-none focus:ring-0 resize-none text-base"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-200 flex justify-between">
          <Button
            type="button"
            onClick={() => {
              setIsUploadVisible(true);
              setIsFullscreen(false);
            }}
            variant="ghost"
            className="text-blue-600 flex items-center"
          >
            <ImageIcon className="h-5 w-5 mr-1" />
            Add Photos
          </Button>
          
          <div className="text-xs text-gray-500">
            {message.length} characters
          </div>
        </div>
      </div>
    );
  }

  // Regular chat interface
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
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
        <div className="ml-auto">
          <Button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            variant="outline"
            size="sm"
            className="text-xs text-blue-500 border-blue-200 hover:bg-blue-50"
          >
            {showGuide ? "Hide Guide" : "Website Guide"}
          </Button>
        </div>
      </div>
      
      {/* Guide Panel */}
      {showGuide && (
        <div className="p-3 bg-blue-50 border-b border-blue-100 text-sm">
          <h3 className="font-medium mb-2 text-blue-800">Website Description Guide</h3>
          <p className="text-xs text-blue-700 mb-2">Include these details for better results:</p>
          <ul className="text-xs text-blue-600 space-y-1 pl-5 list-disc">
            <li><span className="font-medium">Business type:</span> Restaurant, law firm, salon, e-commerce, etc.</li>
            <li><span className="font-medium">Brand colors:</span> Mention 2-3 preferred colors or a mood (energetic, calm, professional)</li>
            <li><span className="font-medium">Key sections:</span> Home, About, Services, Gallery, Contact, etc.</li>
            <li><span className="font-medium">Special features:</span> Booking system, menu display, portfolio showcase</li>
            <li><span className="font-medium">Style preference:</span> Modern, minimalist, bold, elegant, playful</li>
          </ul>
          <p className="text-xs text-blue-700 mt-2 italic">Example: "Create a modern website for my bakery 'Sweet Delights' using pastel pink and mint green colors. Include sections for our story, menu with photos, customer testimonials, and contact form with our location."</p>
        </div>
      )}

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
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-blue-200">
                            {msg.images.length} photo{msg.images.length > 1 ? 's' : ''} attached
                          </span>
                          {msg.images.length > 1 && (
                            <span className="text-xs text-blue-200">← Swipe →</span>
                          )}
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-md">
                          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                            {console.log("Rendering message images:", JSON.stringify(msg.images))}
                            {msg.images.map((img, imgIndex) => {
                              console.log(`Image ${imgIndex} URL:`, img.url);
                              return (
                                <div
                                  key={imgIndex}
                                  className="relative flex-shrink-0 w-full h-40 snap-center"
                                  style={{ minWidth: "240px" }}
                                >
                                  <img
                                    src={img.url.startsWith('http') ? img.url : `${window.location.origin}${img.url}`}
                                    alt={`Uploaded ${imgIndex + 1}`}
                                    className="w-full h-full object-contain bg-gray-900/20"
                                    onError={(e) => {
                                      console.error(`Error loading image ${imgIndex}:`, img.url);
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjJDMTcuNTIyOCAyMiAyMiAxNy41MjI4IDIyIDEyQzIyIDYuNDc3MTUgMTcuNTIyOCAyIDEyIDJDNi40NzcxNSAyIDIgNi40NzcxNSAyIDEyQzIgMTcuNTIyOCA2LjQ3NzE1IDIyIDEyIDIyWiIgc3Ryb2tlPSIjZmYwMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMTIgOFYxMiIgc3Ryb2tlPSIjZmYwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAxNlYxNiIgc3Ryb2tlPSIjZmYwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
                                    }}
                                  />
                                  <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                    {imgIndex + 1}/{msg.images?.length || 0}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {msg.images && msg.images.length > 1 && (
                            <div className="flex justify-center gap-1 p-1 bg-gray-800/10">
                              {msg.images.map((_, index) => (
                                <div 
                                  key={index}
                                  className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-blue-400' : 'bg-blue-200/40'}`}
                                ></div>
                              ))}
                            </div>
                          )}
                        </div>
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
          
          {/* Mobile-friendly input area */}
          <div 
            className="flex items-center justify-between gap-2 bg-gray-50 rounded-full py-2 px-4 border border-gray-200"
            onClick={() => setIsFullscreen(true)}
          >
            <div className="flex-grow py-2 text-gray-500 cursor-text truncate">
              {message ? message : "Message Website Designer..."}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUploadVisible(true);
                }}
                variant="ghost"
                className="rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200"
                size="icon"
              >
                <ImageIcon className="h-5 w-5 text-gray-500" />
              </Button>
              
              {message.trim().length > 0 && (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Website generation button */}
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
        </form>
      </div>
    </div>
  );
}