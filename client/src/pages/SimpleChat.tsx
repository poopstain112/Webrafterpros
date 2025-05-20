import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WebsitePreview from "@/components/WebsitePreview";
import ViewWebsiteButton from "@/components/ViewWebsiteButton";
import { useWebsiteGeneration } from "../contexts/WebsiteGenerationContext";
import { useLocation } from "wouter";

export default function SimpleChat() {
  const [inputMessage, setInputMessage] = useState("");
  const [showWebsitePreview, setShowWebsitePreview] = useState(false);
  const { startGeneration } = useWebsiteGeneration();
  const [showImagesReview, setShowImagesReview] = useState(false);
  const [uploadMode, setUploadMode] = useState<"chat" | "review">("chat");
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
  
  // Improved scroll handling for a smoother experience
  useEffect(() => {
    // Use a slight delay to ensure DOM is updated before scrolling
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);
  
  // We don't need the WebkitOverflowScrolling useEffect anymore as
  // we'll handle scrolling with CSS instead
  
  // Show website preview when website is generated
  useEffect(() => {
    // Check for website structure from the API
    if (websiteStructure) {
      setShowWebsitePreview(true);
    }
    
    // Also check for stored website HTML in localStorage
    const storedHtml = localStorage.getItem('generatedWebsiteHTML');
    if (storedHtml) {
      setShowWebsitePreview(true);
    }
  }, [websiteStructure]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    send(inputMessage);
    setInputMessage("");
  };

  // Image upload and review handling
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Add a quick way to switch between modes
  const switchMode = (mode: "chat" | "review") => {
    setUploadMode(mode);
    if (mode === "review" && uploadedImages.length > 0) {
      // Persist the fact that we've seen the images review screen in session storage
      sessionStorage.setItem("hasSeenImagesReview", "true");
    }
  };
  
  // Initialize with previous state if available
  useEffect(() => {
    if (uploadedImages.length > 0 && !websiteStructure) {
      // If we have uploaded images but no website structure, check if we need to show review screen
      const hasSeenReview = sessionStorage.getItem("hasSeenImagesReview");
      if (!hasSeenReview) {
        switchMode("review");
      }
    }
  }, [uploadedImages.length, websiteStructure]);
  
  // Add navigation to view website
  const [, setLocation] = useLocation();
  
  // Function to navigate to website preview
  const goToWebsitePreview = () => {
    setLocation('/website-preview');
  };
  
  // Check for generated website in localStorage when component mounts
  useEffect(() => {
    const generatedHTML = localStorage.getItem('generatedWebsiteHTML');
    if (generatedHTML) {
      // Add a message about the successful generation if there isn't one already
      if (!messages.some(m => m.content?.includes('website has been generated'))) {
        send('Your website has been generated! Take a look at the preview and let me know if you\'d like to make any changes.');
      }
      
      // We'll keep the preview modal option for now as a backup
      setShowWebsitePreview(true);
    }
  }, []);
  
  const handleUploadClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        try {
          // Show loading state and switch to review mode
          setIsUploading(true);
          setUploadProgress(0);
          switchMode("review");
          
          // Use a timeout to set incremental progress for better UX
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const newProgress = prev + 5;
              return newProgress > 90 ? 90 : newProgress; // Cap at 90% until actually complete
            });
          }, 500);
          
          // Process the upload
          const uploadedFiles = await handleImageUpload(files);
          
          // Clear interval and finalize progress
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // Log success and save state
          console.log("Images uploaded successfully:", uploadedFiles?.length || 0);
          sessionStorage.setItem("hasUploadedImages", "true");
          
          // Small delay to show 100% complete before removing progress bar
          setTimeout(() => {
            setIsUploading(false);
            switchMode("review");
          }, 500);
          
        } catch (error) {
          console.error("Error during upload:", error);
          setIsUploading(false);
          
          // Stay in review mode to allow retry
          // But show error message
          toast({
            title: "Upload Error",
            description: "Some images failed to upload. You can try again or continue with any successfully uploaded images.",
            variant: "destructive"
          });
        }
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
      {/* Website Preview Screen - when a website has been generated */}
      {websiteStructure && showWebsitePreview && (
        <WebsitePreview 
          websiteStructure={websiteStructure}
          onClose={() => setShowWebsitePreview(false)}
          onEdit={handleEditWebsite}
        />
      )}
      
      {/* CHAT MODE - Show the chat interface when in chat mode */}
      {uploadMode === "chat" && (
        <>
          <div className="bg-blue-500 text-white py-4 px-4 fixed top-0 left-0 right-0 z-10 flex justify-between items-center">
            <h1 className="text-xl font-bold">Instant Website</h1>
            <ViewWebsiteButton />
          </div>
          
          {/* Messages area - using absolute positioning for better mobile scrolling */}
          <div className="absolute top-16 bottom-16 left-0 right-0 bg-gray-50 overflow-y-scroll message-container">
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
              
              {/* Add extra space at bottom when website button is showing */}
              {messages.length > 5 && <div className="h-16"></div>}
              
              {/* This invisible element helps us scroll to the bottom */}
              <div ref={messagesEndRef}></div>
            </div>
          </div>
          
          {/* Small thumbnail indicator of uploaded images at the bottom of chat */}
          {uploadedImages.length > 0 && (
            <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">{uploadedImages.length} image(s) uploaded</span>
                
                {/* View Images Button */}
                {messages.length > 5 && !websiteStructure && (
                  <button 
                    className="text-xs text-blue-500 font-medium" 
                    onClick={() => setUploadMode("review")}
                  >
                    View All & Create Website
                  </button>
                )}
              </div>
              <div className="flex overflow-x-auto space-x-2 pb-1">
                {uploadedImages.slice(0, 5).map((image, index) => (
                  <div key={index} className="w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                    <img 
                      src={image.url} 
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `${image.url}?t=${Date.now()}`;
                      }}
                    />
                  </div>
                ))}
                {uploadedImages.length > 5 && (
                  <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{uploadedImages.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* REVIEW MODE - Images Review Screen */}
      {uploadMode === "review" && !websiteStructure && (
        <div className="fixed inset-0 bg-white z-30 flex flex-col">
          <div className="bg-blue-500 text-white py-4 px-4 flex items-center">
            <button 
              onClick={() => setUploadMode("chat")} 
              className="mr-2 rounded-full w-8 h-8 flex items-center justify-center bg-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h1 className="text-xl font-bold">Your Uploaded Images</h1>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto pb-24">
            {isUploading ? (
              <div className="h-full flex flex-col items-center justify-center">
                {/* Progress bar */}
                <div className="w-full max-w-md mb-8">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 mt-2 text-center">
                    {uploadProgress < 100 ? 'Uploading your images...' : 'Upload complete!'}
                  </p>
                </div>
              </div>
            ) : uploadedImages.length > 0 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Uploaded Images</h2>
                  <p className="text-gray-600">
                    Review your images below. When you're ready, click "Create Website" to generate your website.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-24">
                  {uploadedImages.map((image, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative"
                    >
                      <img 
                        src={`${image.url}?t=${Date.now()}`} 
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="eager"
                        onError={(e) => {
                          // Retry loading with a new timestamp
                          const target = e.currentTarget;
                          setTimeout(() => {
                            target.src = `${image.url}?t=${Date.now()}`;
                          }, 500);
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">{image.filename || `Image ${index + 1}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <p className="text-gray-600 mb-6 text-center">
                  No images have been uploaded yet.<br />
                  Upload some images to create your website.
                </p>
                <Button
                  onClick={handleUploadClick}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-3 text-lg"
                >
                  Upload Images
                </Button>
              </div>
            )}
          </div>
          
          {/* Fixed bottom button bar */}
          {uploadedImages.length > 0 && !isUploading && (
            <div className="p-4 border-t fixed bottom-0 left-0 right-0 bg-white shadow-md">
              <div className="flex space-x-3">
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  className="flex-1"
                >
                  Upload More
                </Button>
                <Button
                  onClick={() => {
                    // Get all the chat content to generate a description
                    const businessInfo = messages
                      .filter(m => m.role === 'user')
                      .map(m => m.content)
                      .join("\n");
                    
                    // Use the WebsiteGenerationContext to navigate to loading screen
                    const description = `${businessInfo}\n\nUploaded Images: ${uploadedImages.length}`;
                    startGeneration(description, "cleaning"); // Setting the business type
                  }}
                  disabled={isGenerating}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-base"
                >
                  {isGenerating ? "Creating Website..." : "Create Website"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* View website button - when website exists */}
      {websiteStructure && (
        <div className="fixed top-16 right-0 p-2 z-10">
          <Button
            onClick={() => setShowWebsitePreview(true)}
            className="rounded-full w-10 h-10 bg-green-500 hover:bg-green-600 flex items-center justify-center"
            title="View Your Website"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </Button>
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
          
          <div className="flex-1 relative flex items-center">
            <textarea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                // Auto-resize the textarea
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              placeholder="Type a message..."
              className="w-full py-2 px-4 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 pr-12 resize-none"
              style={{ 
                minHeight: '40px', 
                maxHeight: '120px',
                height: 'auto',
                lineHeight: '1.5',
                paddingRight: '3rem',
                overflowY: 'auto'
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="absolute right-1 w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: inputMessage.trim() ? '#3b82f6' : '#d1d5db' }}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}