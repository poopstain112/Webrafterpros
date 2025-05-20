import { useState, useEffect, useRef } from "react";
import { MessageSquare, Settings, Image, Send, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { useToast } from "@/hooks/use-toast";
import { Message, UploadedImage } from "@/types";
import { resetChat, uploadImages, generateWebsite } from "@/lib/openai";
import LoadingOverlay from "@/components/LoadingOverlay";

// Helper function to extract business info from messages
function extractBusinessInfo(messages: Message[]) {
  const businessInfo: {
    businessName?: string;
    businessType?: string;
    location?: string;
    services?: string[];
    contactInfo?: string;
    description?: string;
  } = {};
  
  // Match questions to answers with proper typing
  const questionMap: {[key: string]: keyof typeof businessInfo} = {
    "What's the name of your business?": "businessName",
    "Where is your business located?": "location",
    "What products or services do you offer?": "services"
  };
  
  // Power washing specific keywords
  const powerWashingKeywords = [
    'power wash', 'power washing', 'pressure wash', 'pressure washing', 
    'clean', 'cleaning', 'exterior cleaning', 'surface cleaning'
  ];
  
  // Extract info from conversation
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'assistant' && messages[i+1].role === 'user') {
      const question = messages[i].content;
      const answer = messages[i+1].content;
      
      // Map to the right field
      for (const [q, field] of Object.entries(questionMap)) {
        if (question.includes(q) && answer.trim()) {
          if (field === 'services') {
            businessInfo[field] = answer.split(',').map(s => s.trim());
          } else if (field === 'businessName' || field === 'location' || field === 'description' || field === 'contactInfo') {
            businessInfo[field] = answer.trim();
          }
        }
      }
      
      // Check for power washing indicators in services
      if (businessInfo.services) {
        for (const service of businessInfo.services) {
          for (const keyword of powerWashingKeywords) {
            if (service.toLowerCase().includes(keyword)) {
              businessInfo.businessType = 'power washing';
              break;
            }
          }
          if (businessInfo.businessType) break;
        }
      }
      
      // Check for power washing indicators in all answers
      if (!businessInfo.businessType && answer) {
        for (const keyword of powerWashingKeywords) {
          if (answer.toLowerCase().includes(keyword)) {
            businessInfo.businessType = 'power washing';
            break;
          }
        }
      }
    }
  }
  
  return businessInfo;
}

// Create a detailed description based on messages for better website generation
function createDetailedDescription(messages: Message[], businessInfo: any): string {
  let description = "";
  
  // Start with business name if available
  if (businessInfo.businessName) {
    description += `Business Name: ${businessInfo.businessName}. `;
  }
  
  // Add location
  if (businessInfo.location) {
    description += `Location: ${businessInfo.location}. `;
  }
  
  // Add services
  if (businessInfo.services && businessInfo.services.length > 0) {
    description += `Services: ${businessInfo.services.join(', ')}. `;
  }
  
  // Add all user responses to provide more context
  description += "Additional Information: ";
  for (const message of messages) {
    if (message.role === 'user') {
      description += message.content + ". ";
    }
  }
  
  // Special handling for power washing businesses
  if (businessInfo.businessType === 'power washing') {
    description += "This is a professional power washing business that needs a clean, modern website showcasing their cleaning services with before/after examples, service areas, and contact information. Include sections for residential and commercial power washing services.";
  }
  
  return description;
}

export default function SimplifiedHome() {
  const { toast } = useToast();
  const {
    messages,
    isLoading,
    uploadedImages,
    sendMessage,
    handleImageUpload,
    generateWebsiteContent,
    websiteStructure,
    isGeneratingWebsite,
    clearUploadedImages,
    resetChat,
    fetchMessages,
  } = useChat();

  const [currentScreen, setCurrentScreen] = useState<"chat" | "preview">("chat");
  const [inputMessage, setInputMessage] = useState("");
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refs for pull-to-refresh functionality
  const pullStartY = useRef(0);
  const pullMoveY = useRef(0);
  const distanceThreshold = 100; // Minimum pull distance to trigger refresh
  const refreshAreaRef = useRef<HTMLDivElement>(null);
  const isRefreshingRef = useRef(false);

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
      
      // Check if we should update the website after sending this message
      // This triggers only if we've previously generated a website
      if (localStorage.getItem('websiteGenerated') === 'true' && 
          (inputMessage.toLowerCase().includes('update') || 
           inputMessage.toLowerCase().includes('change') ||
           inputMessage.toLowerCase().includes('modify') ||
           inputMessage.toLowerCase().includes('add'))) {
        
        // We'll update the website after a brief delay to allow the AI response
        setTimeout(() => {
          // Extract business information from updated messages
          const businessInfo = extractBusinessInfo(messages);
          
          // Create a more detailed description based on latest chat history
          const description = createDetailedDescription(messages, businessInfo);
          
          // Generate updated website with all the latest information
          generateWebsiteContent(
            description,
            businessInfo.businessType
          );
          
          // Notify user
          toast({
            title: "Website updated",
            description: "Your website has been updated based on your changes",
          });
        }, 2000);
      }
    }
  };

  // Handle image upload
  const handleUploadClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        try {
          // Show loading toast
          toast({
            title: "Uploading images...",
            description: "Please wait while your images are processed",
          });
          
          // Use the hook's function to upload images
          await handleImageUpload(files);
          
          // Success toast
          toast({
            title: "Images uploaded",
            description: `${files.length} image(s) added successfully`,
          });
        } catch (error) {
          console.error("Failed to upload images:", error);
          toast({
            title: "Upload failed",
            description: "There was a problem uploading your images. Please try again.",
            variant: "destructive"
          });
        }
      }
    };
    fileInput.click();
  };

  // Handle website generation with proper loading indicator
  const handleGenerateWebsite = () => {
    // Extract business information from chat messages
    const businessInfo = extractBusinessInfo(messages);
    
    // Create a comprehensive description based on chat history
    const description = createDetailedDescription(messages, businessInfo);
    
    // Important: Set loading state BEFORE switching screens
    // This ensures loading indicator is visible immediately 
    setIsGeneratingWebsite(true);
    
    // Show a toast notification
    toast({
      title: "Creating website",
      description: "Your professional website is being generated. This typically takes 30-60 seconds.",
    });
    
    // Add a loading message to chat
    const loadingMessage = {
      role: 'assistant',
      content: 'Generating your professional website based on your description. This may take a moment...',
      id: Date.now(),
      websiteId: 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, loadingMessage];
    setMessages(updatedMessages);
    
    // CRITICAL: First set the state, THEN switch screens after a small delay
    // This ensures React has time to process the state change before rendering the new screen
    setTimeout(() => {
      // Now switch screens - this ensures loading state is already true when screen changes
      setCurrentScreen("preview");
    }, 100);

    // Start the website generation
    generateWebsite(description, uploadedImages, businessInfo.businessType)
      .then(websiteData => {
        // Success handling
        setWebsiteStructure(websiteData);
        
        // Add success message
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: 'Your website has been generated! You can now preview it and make additional changes if needed.',
          id: Date.now() + 1,
          websiteId: 1,
          createdAt: new Date().toISOString()
        }]);
        
        // Save generation state to localStorage
        localStorage.setItem('websiteGenerated', 'true');
        
        // Success notification
        toast({
          title: "Website ready!",
          description: "Your professional website has been generated successfully!",
        });
      })
      .catch(error => {
        // Error handling
        console.error("Website generation error:", error);
        toast({
          title: "Error",
          description: "Failed to generate website. Please try again.",
          variant: "destructive"
        });
        
        // Switch back to chat screen on error
        setCurrentScreen("chat");
      })
      .finally(() => {
        // Regardless of success or failure, update loading state
        setIsGeneratingWebsite(false);
      });
  };

  // Handle downloading the website
  const handleDownloadWebsite = () => {
    if (!websiteStructure) return;

    // Create a full HTML document with CSS included
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${extractBusinessInfo(messages).businessName || 'Your Generated Website'}</title>
    <style>
${websiteStructure.css}
    </style>
</head>
<body>
${websiteStructure.html}
</body>
</html>
    `;

    try {
      // Create a blob with the website content
      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      
      // Create and trigger a download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `${extractBusinessInfo(messages).businessName || 'my-website'}.html`;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // Trigger the download with a slight delay to ensure it works
      setTimeout(() => {
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Website downloading",
        description: "Your website file is being downloaded to your device",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Unable to download the website. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle manually updating the website based on latest chat
  const handleUpdateWebsite = () => {
    if (messages.length === 0) {
      toast({
        title: "No chat history",
        description: "Please chat with the assistant first to provide business details",
        variant: "destructive",
      });
      return;
    }
    
    // Extract business information from chat messages
    const businessInfo = extractBusinessInfo(messages);
    
    // Create a comprehensive description based on chat history
    const description = createDetailedDescription(messages, businessInfo);
    
    // Generate updated website
    generateWebsiteContent(
      description,
      businessInfo.businessType
    );
    
    setCurrentScreen("preview");
    toast({
      title: "Website updated",
      description: "Your website has been updated with the latest information",
    });
  };

  return (
    <>
      {/* Global loading overlay - shows when website is generating */}
      {isGeneratingWebsite && <LoadingOverlay />}
      
      <div className="flex flex-col h-screen">
      {/* Modern Header - 2025 Style */}
      <header className="p-3 flex items-center justify-between bg-white/95 backdrop-blur-sm shadow-sm z-10 sticky top-0">
        <div className="flex items-center">
          {currentScreen === "preview" && (
            <button
              className="mr-2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              onClick={() => setCurrentScreen("chat")}
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
            Instant Website
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset button */}
          <button
            className="rounded-full h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={async () => {
              try {
                await resetChat();
                toast({
                  title: "Chat reset",
                  description: "Starting a new conversation"
                });
                
                // Clear local website data and reset to initial state
                setMessages([
                  {
                    role: 'assistant',
                    content: "What's the name of your business?",
                  },
                ]);
                setWebsiteStructure(null);
                setUploadedImages([]);
                setCurrentScreen("chat");
                
                // Force reload the page to reset everything cleanly
                window.location.reload();
              } catch (error) {
                console.error("Error resetting chat:", error);
                toast({
                  title: "Error",
                  description: "Failed to reset the chat",
                  variant: "destructive"
                });
              }
            }}
            title="Start new conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>

          {currentScreen === "chat" && (
            <>
              {uploadedImages.length > 0 && (
                <button
                  className="rounded-full px-4 py-2 font-medium text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:shadow-md transition-all"
                  onClick={handleGenerateWebsite}
                >
                  Create Website
                </button>
              )}
            </>
          )}

          {currentScreen === "preview" && (
            <div className="flex gap-2">
              <button
                className={`rounded-full px-4 py-2 font-medium text-sm transition-all ${
                  !websiteStructure || isGeneratingWebsite
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm hover:shadow-md"
                }`}
                onClick={handleUpdateWebsite}
                disabled={!websiteStructure || isGeneratingWebsite}
              >
                Update Website
              </button>
              <button
                className={`rounded-full px-4 py-2 font-medium text-sm transition-all ${
                  !websiteStructure || isGeneratingWebsite
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-sm hover:shadow-md"
                }`}
                onClick={handleDownloadWebsite}
                disabled={!websiteStructure || isGeneratingWebsite}
              >
                Download Website
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Chat Screen */}
        {currentScreen === "chat" && (
          <div className="h-full flex flex-col relative">
            {/* Pull-to-refresh indicator */}
            <div 
              ref={refreshAreaRef}
              className="absolute top-0 left-0 right-0 flex justify-center transform -translate-y-full transition-transform duration-300 z-10 bg-blue-50 py-2"
              style={{ 
                transform: isRefreshing 
                  ? 'translateY(0)' 
                  : pullMoveY.current > 0 
                    ? `translateY(${Math.min(pullMoveY.current * 0.4, 60)}px)` 
                    : 'translateY(-100%)' 
              }}
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className={`h-5 w-5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm text-blue-700">
                  {isRefreshing ? 'Refreshing...' : 'Pull down to refresh'}
                </span>
              </div>
            </div>
            
            {/* Messages - with padding at bottom to prevent input overlap */}
            <div 
              className="flex-1 overflow-y-auto p-4 pb-20 bg-gray-50 relative"
              onTouchStart={(e) => {
                // Only enable pull-to-refresh when at the top of the scroll
                const messageContainer = e.currentTarget;
                if (messageContainer.scrollTop <= 0) {
                  pullStartY.current = e.touches[0].clientY;
                  pullMoveY.current = 0;
                  isRefreshingRef.current = false;
                }
              }}
              onTouchMove={(e) => {
                // Calculate pull distance when at the top
                const messageContainer = e.currentTarget;
                if (pullStartY.current > 0 && messageContainer.scrollTop <= 0) {
                  pullMoveY.current = e.touches[0].clientY - pullStartY.current;
                  // Force UI update
                  if (pullMoveY.current > 0) {
                    if (e.currentTarget) {
                      e.currentTarget.style.overflow = 'hidden';
                    }
                    // Force state update to re-render pull indicator
                    setIsRefreshing(false);
                  }
                }
              }}
              onTouchEnd={(e) => {
                // Trigger refresh if pulled far enough
                if (pullMoveY.current > distanceThreshold && !isRefreshingRef.current) {
                  isRefreshingRef.current = true;
                  setIsRefreshing(true);
                  
                  // Perform the refresh
                  fetchMessages()
                    .then(() => {
                      setTimeout(() => {
                        setIsRefreshing(false);
                        pullStartY.current = 0;
                        pullMoveY.current = 0;
                        isRefreshingRef.current = false;
                        
                        if (e.currentTarget) {
                          e.currentTarget.style.overflow = 'auto';
                        }
                        
                        toast({
                          title: "Refreshed!",
                          description: "Chat content has been updated"
                        });
                      }, 800);
                    });
                } else {
                  // Reset if not pulled far enough
                  pullStartY.current = 0;
                  pullMoveY.current = 0;
                  
                  if (e.currentTarget) {
                    e.currentTarget.style.overflow = 'auto';
                  }
                }
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">Welcome!</h2>
                  <p className="text-gray-600 mb-4">
                    Upload images and describe your business to create a website instantly.
                  </p>
                  <Button onClick={handleUploadClick} variant="outline" className="mx-auto">
                    <Image className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-3 max-w-[80%] shadow-sm ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white border border-gray-200 rounded-bl-none"
                        }`}
                      >
                        <p>{msg.content}</p>
                        {msg.images && msg.images.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs opacity-70 mb-1">
                              {msg.images.length} image{msg.images.length !== 1 ? 's' : ''} uploaded
                            </p>
                            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                              {msg.images.map((img, i) => (
                                <div key={i} className="flex-shrink-0">
                                  <img
                                    src={img.url}
                                    alt={`Uploaded ${i + 1}`}
                                    className="h-24 w-auto rounded border border-gray-200 shadow-sm"
                                    onError={(e) => {
                                      console.error(`Failed to load image ${i}:`, img.url);
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI4IiBmaWxsPSIjRjNGNEY2Ii8+PHBhdGggZD0iTTM2IDQwSDY0VjcwSDM2VjQwWiIgc3Ryb2tlPSIjOTQ5N0EwIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNNDAgNjRMNDggNTZMNTIgNjBMNjAgNTIiIHN0cm9rZT0iIzk0OTdBMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI0NCIgY3k9IjQ4IiByPSIzIiBmaWxsPSIjOTQ5N0EwIi8+PC9zdmc+';
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simple Input Area - Basic Design */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                  onClick={handleUploadClick}
                >
                  <Image className="h-5 w-5 text-blue-500" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe your business website..."
                    className="w-full py-2.5 px-4 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  
                  {inputMessage.trim() && (
                    <button
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Modern Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} ready
                    </span>
                    <span className="text-xs text-blue-500">← Scroll →</span>
                  </div>
                  
                  <div className="overflow-x-auto pb-1">
                    <div className="flex gap-3 py-1" style={{ minWidth: 'min-content' }}>
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative group flex-shrink-0" style={{ width: '100px' }}>
                          <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200 aspect-square">
                            <img
                              src={img.url}
                              alt={`Uploaded ${index + 1}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error(`Failed to load image thumbnail ${index}:`, img.url);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI4IiBmaWxsPSIjRjNGNEY2Ii8+PHBhdGggZD0iTTM2IDQwSDY0VjcwSDM2VjQwWiIgc3Ryb2tlPSIjOTQ5N0EwIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNNDAgNjRMNDggNTZMNTIgNjBMNjAgNTIiIHN0cm9rZT0iIzk0OTdBMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI0NCIgY3k9IjQ4IiByPSIzIiBmaWxsPSIjOTQ5N0EwIi8+PC9zdmc+';
                              }}
                            />
                          </div>
                          <button
                            className="absolute -top-2 -right-2 bg-white shadow text-red-500 rounded-full w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                            onClick={() => {
                              // Remove this image from the array
                              const newImages = [...uploadedImages];
                              newImages.splice(index, 1);
                              // Update the state
                              setUploadedImages(newImages);
                            }}
                          >
                            ×
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/60 text-white px-1 py-0.5 truncate text-center">
                            Image {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Website Preview Screen */}
        {currentScreen === "preview" && (
          <div className="h-full flex flex-col">
            {isGeneratingWebsite ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg">
                  {/* Improved loading animation */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-3 border-8 border-blue-300 border-b-transparent rounded-full animate-spin animation-delay-150"></div>
                    <div className="absolute inset-6 border-8 border-blue-100 border-l-transparent rounded-full animate-spin animation-delay-300"></div>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                    Creating Your Website
                  </h2>
                  <p className="text-gray-600 mb-4">This typically takes 30-60 seconds. We're building a professional website based on your information.</p>
                  
                  {/* Animated progress bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-blue-500 rounded-full animate-pulse"
                      style={{ 
                        width: '100%', 
                        animationDuration: '1.5s'
                      }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-500 italic">
                    We're optimizing colors, layout, and content based on your business type
                  </p>
                </div>
              </div>
            ) : websiteStructure ? (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
                <div
                  className="bg-white rounded-lg shadow-md mx-auto max-w-4xl overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: websiteStructure.html }}
                ></div>
                <style>{websiteStructure.css}</style>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-8 w-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
                  <p className="text-gray-600 mb-4">
                    We couldn't generate your website. Please try again.
                  </p>
                  <Button
                    onClick={() => setCurrentScreen("chat")}
                    variant="outline"
                    className="mx-auto"
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Bottom Navigation - 2025 Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-2 z-30 backdrop-blur-md bg-white/90">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            className={`relative flex items-center justify-center h-12 w-20 rounded-2xl transition-all duration-200 ${
              currentScreen === "chat" 
                ? "bg-blue-500 text-white" 
                : "text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => setCurrentScreen("chat")}
          >
            <div className="flex flex-col items-center">
              <MessageSquare className={`h-5 w-5 ${currentScreen === "chat" ? "text-white" : ""}`} />
              <span className="text-xs font-medium mt-1">Chat</span>
            </div>
            {currentScreen === "chat" && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-white rounded-full"></div>
            )}
          </button>

          <button
            className={`relative flex items-center justify-center h-12 w-20 rounded-2xl transition-all duration-200 ${
              currentScreen === "preview" 
                ? "bg-blue-500 text-white" 
                : websiteStructure || isGeneratingWebsite ? "text-gray-500 hover:bg-gray-100" : "text-gray-300"
            }`}
            onClick={() => (websiteStructure || isGeneratingWebsite) && setCurrentScreen("preview")}
            disabled={!websiteStructure && !isGeneratingWebsite}
          >
            <div className="flex flex-col items-center">
              <Image className={`h-5 w-5 ${currentScreen === "preview" ? "text-white" : ""}`} />
              <span className="text-xs font-medium mt-1">Website</span>
            </div>
            {currentScreen === "preview" && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-white rounded-full"></div>
            )}
          </button>
        </div>
      </div>
      
      {/* Add padding at the bottom to accommodate the fixed navigation */}
      <div className="h-16"></div>
    </div>
  );
}