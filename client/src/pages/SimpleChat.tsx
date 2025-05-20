import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WebsitePreview from "@/components/WebsitePreview";

export default function SimpleChat() {
  const [inputMessage, setInputMessage] = useState("");
  const [showWebsitePreview, setShowWebsitePreview] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    sendMessage: send,
    handleImageUpload,
    uploadedImages,
    websiteStructure,
    isGeneratingWebsite: isGenerating,
    generateWebsiteContent,
    editWebsiteContent
  } = useChat();
  
  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Show website preview when website is generated
  useEffect(() => {
    if (websiteStructure) {
      setShowWebsitePreview(true);
    }
  }, [websiteStructure]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    send(inputMessage);
    setInputMessage("");
  };

  // Handle file upload
  const handleUploadClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        handleImageUpload(files);
      }
    };
    fileInput.click();
  };

  // Handle website editing with edit instructions
  const handleEditWebsite = (editInstructions?: string) => {
    if (editInstructions) {
      setShowWebsitePreview(false);
      editWebsiteContent(editInstructions);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {websiteStructure && showWebsitePreview && (
        <WebsitePreview 
          websiteStructure={websiteStructure}
          onClose={() => setShowWebsitePreview(false)}
          onEdit={handleEditWebsite}
        />
      )}
      
      <div className="bg-blue-500 text-white py-4 px-4 fixed top-0 left-0 right-0 z-10">
        <h1 className="text-xl font-bold">Instant Website</h1>
      </div>
      
      {/* Messages area - with padding to account for fixed header and input */}
      <div className="flex-1 bg-gray-50 overflow-y-auto pt-16 pb-20">
        <div className="space-y-4 p-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-3 ${
                  message.role === 'assistant'
                    ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    : 'bg-blue-500 text-white rounded-tr-none'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl p-3 bg-white border border-gray-200 text-gray-800 rounded-tl-none">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* This invisible element helps us scroll to the bottom */}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
      
      {/* Uploaded images - fixed above input */}
      {uploadedImages.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
          <div className="text-xs text-gray-500 mb-1">{uploadedImages.length} image(s) uploaded</div>
          <div className="flex overflow-x-auto space-x-2 pb-1">
            {uploadedImages.map((image, index) => (
              <div key={index} className="w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                <img 
                  src={image.url} 
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Retry with timestamp
                    e.currentTarget.src = `${image.url}?t=${Date.now()}`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Website generation or preview button - fixed above input when needed */}
      {messages.length > 5 && (
        <div className="fixed bottom-16 left-0 right-0 bg-blue-50 p-3 border-t border-blue-100 z-10">
          {!websiteStructure ? (
            <Button
              onClick={() => generateWebsiteContent("Generate a website based on our conversation")}
              disabled={isGenerating}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {isGenerating ? "Creating Website..." : "Create Website"}
            </Button>
          ) : (
            <Button
              onClick={() => setShowWebsitePreview(true)}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              View Your Website
            </Button>
          )}
        </div>
      )}
      
      {/* Input area - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUploadClick}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
          >
            <ImageIcon className="h-5 w-5 text-blue-500" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full h-10 py-2 px-4 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            {inputMessage.trim() && (
              <button
                onClick={handleSendMessage}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}