import { useState, useEffect, useRef } from "react";
import { MessageSquare, Settings, Image, Send, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { useToast } from "@/hooks/use-toast";
import { Message, UploadedImage } from "@/types";
import { resetChat, uploadImages, generateWebsite } from "@/lib/openai";
import WebsiteLoadingScreen from "./WebsiteLoadingScreen";

// Helper function to extract business info from messages
function extractBusinessInfo(messages: Message[]) {
  const businessInfo: {
    name?: string;
    location?: string;
    services?: string;
    uniqueSellingPoint?: string;
    targetCustomers?: string;
    slogan?: string;
    hours?: string;
    contactInfo?: string;
    colors?: string;
    socialMedia?: string;
  } = {};
  
  // Simple pattern matching to extract key information
  // Start with the first user message as the business name
  if (messages.length > 0 && messages[0].role === "user") {
    businessInfo.name = messages[0].content;
  }
  
  // Extract other information from subsequent messages
  for (let i = 1; i < messages.length; i++) {
    const message = messages[i];
    const prevMessage = messages[i-1];
    
    if (message.role === "user" && prevMessage.role === "assistant") {
      const question = prevMessage.content.toLowerCase();
      const answer = message.content;
      
      if (question.includes("located") || question.includes("location") || question.includes("where")) {
        businessInfo.location = answer;
      } else if (question.includes("services") || question.includes("products") || question.includes("offer")) {
        businessInfo.services = answer;
      } else if (question.includes("unique") || question.includes("competitors")) {
        businessInfo.uniqueSellingPoint = answer;
      } else if (question.includes("ideal customer") || question.includes("target")) {
        businessInfo.targetCustomers = answer;
      } else if (question.includes("slogan") || question.includes("tagline")) {
        businessInfo.slogan = answer;
      } else if (question.includes("hours") || question.includes("time")) {
        businessInfo.hours = answer;
      } else if (question.includes("contact") || question.includes("phone") || question.includes("email")) {
        businessInfo.contactInfo = answer;
      } else if (question.includes("color") || question.includes("brand")) {
        businessInfo.colors = answer;
      } else if (question.includes("social media") || question.includes("accounts")) {
        businessInfo.socialMedia = answer;
      }
    }
  }
  
  return businessInfo;
}

// Helper function to create a detailed description from messages
function createDetailedDescription(messages: Message[], businessInfo: any): string {
  let description = `Business Name: ${businessInfo.name || 'Not specified'}\n`;
  description += `Location: ${businessInfo.location || 'Not specified'}\n`;
  description += `Services: ${businessInfo.services || 'Not specified'}\n`;
  description += `Unique Selling Point: ${businessInfo.uniqueSellingPoint || 'Not specified'}\n`;
  description += `Target Customers: ${businessInfo.targetCustomers || 'Not specified'}\n`;
  description += `Business Hours: ${businessInfo.hours || 'Not specified'}\n`;
  description += `Contact Information: ${businessInfo.contactInfo || 'Not specified'}\n`;
  description += `Brand Colors: ${businessInfo.colors || 'Not specified'}\n`;
  description += `Social Media: ${businessInfo.socialMedia || 'Not specified'}\n\n`;
  
  description += "Detailed Information:\n";
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role === "user") {
      const question = i > 0 ? messages[i-1].content : "What is your business name?";
      description += `Q: ${question}\nA: ${message.content}\n\n`;
    }
  }
  
  return description;
}

export default function SimplifiedHome() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentScreen, setCurrentScreen] = useState<"chat" | "preview">("chat");
  const [websiteHtml, setWebsiteHtml] = useState<string>("");
  const [websiteStructure, setWebsiteStructure] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isGeneratingWebsite, setIsGeneratingWebsite] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [businessType, setBusinessType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sample questions to guide the user
  const questions = [
    "What is your business name?",
    "Where is your business located?",
    "What products or services do you offer?",
    "What makes your business unique compared to competitors?",
    "Who is your ideal customer?",
    "What's your business slogan or tagline?",
    "What are your business hours?",
    "What contact information should be included on the website?",
    "What are your primary business colors (if you have brand colors)?",
    "Do you have any social media accounts to link on the website?",
    "Please upload images for your website."
  ];
  
  // Load existing messages or start a new conversation
  const {
    messages: chatMessages,
    isLoading,
    appendMessage,
    resetMessages,
    uploadImageToChat,
    generateWebsiteFromChat,
  } = useChat({
    websiteId: 1, // Default website ID
    initialMessages: messages,
    onWebsiteGenerated: (data) => {
      setWebsiteHtml(data.html);
      setWebsiteStructure(data.structure);
      setIsGeneratingWebsite(false);
      setCurrentScreen("preview");
      toast({
        title: "Website Generated",
        description: "Your custom website has been created.",
      });
    },
    onError: (error) => {
      setIsGeneratingWebsite(false);
      toast({
        title: "Error",
        description: "Failed to generate website. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update local messages when chat messages change
  useEffect(() => {
    if (chatMessages.length > 0) {
      setMessages(chatMessages);
      
      // Update question index based on user messages count
      const userMessageCount = chatMessages.filter(msg => msg.role === "user").length;
      if (userMessageCount > 0 && userMessageCount <= questions.length) {
        setCurrentQuestionIndex(userMessageCount);
      }
      
      // Show image upload option after answering the required questions
      if (userMessageCount >= questions.length - 1) {
        setShowImageUpload(true);
      }
      
      // Try to determine business type from the messages
      const info = extractBusinessInfo(chatMessages);
      if (info.services) {
        const services = info.services.toLowerCase();
        if (services.includes("clean") || services.includes("janitorial") || services.includes("maid")) {
          setBusinessType("cleaning");
        } else if (services.includes("landscape") || services.includes("lawn") || services.includes("garden")) {
          setBusinessType("landscaping");
        } else if (services.includes("plumb") || services.includes("pipe")) {
          setBusinessType("plumbing");
        } else if (services.includes("elect") || services.includes("wiring")) {
          setBusinessType("electrical");
        } else if (services.includes("tax") || services.includes("account") || services.includes("bookkeeping")) {
          setBusinessType("accounting");
        } else if (services.includes("restau") || services.includes("food") || services.includes("catering")) {
          setBusinessType("restaurant");
        } else {
          setBusinessType("service");
        }
      }
    }
  }, [chatMessages]);
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    await appendMessage({
      role: "user",
      content: inputValue,
    });
    
    setInputValue("");
  };
  
  // Handle file selection for image upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    formData.append("websiteId", "1");
    
    // Add all selected files to form data
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
    
    try {
      const uploadedImages = await uploadImageToChat(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadProgress(0);
      setUploadedImages(uploadedImages);
      
      toast({
        title: "Images Uploaded",
        description: `${uploadedImages.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // State to control showing the dedicated loading screen
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  
  // Cancel loading and return to chat
  const cancelLoading = useCallback(() => {
    setShowLoadingScreen(false);
    setIsGeneratingWebsite(false);
  }, []);

  // Handle website generation
  const handleGenerateWebsite = async () => {
    try {
      // Show the dedicated loading screen first
      setShowLoadingScreen(true);
      setIsGeneratingWebsite(true);
      
      const businessInfo = extractBusinessInfo(messages);
      const description = createDetailedDescription(messages, businessInfo);
      
      await generateWebsiteFromChat(description, businessType);
    } catch (error) {
      setShowLoadingScreen(false);
      setIsGeneratingWebsite(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate website. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle reset chat
  const handleResetChat = async () => {
    try {
      await resetChat(1);
      resetMessages();
      setWebsiteStructure(null);
      setUploadedImages([]);
      setCurrentQuestionIndex(0);
      setShowImageUpload(false);
      setCurrentScreen("chat");
      
      toast({
        title: "Chat Reset",
        description: "Started a new conversation.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset chat. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Update website based on chat
  const updateWebsite = async () => {
    try {
      setIsGeneratingWebsite(true);
      
      const businessInfo = extractBusinessInfo(messages);
      const description = createDetailedDescription(messages, businessInfo);
      
      await generateWebsiteFromChat(description, businessType);
      
      toast({
        title: "Website updated",
        description: "Your website has been updated with the latest information",
      });
    } catch (error) {
      setIsGeneratingWebsite(false);
      toast({
        title: "Update Failed",
        description: "Failed to update website. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      {/* Show dedicated loading screen when generating website */}
      {showLoadingScreen && <WebsiteLoadingScreen onCancel={cancelLoading} />}
      {/* Debug information - for troubleshooting */}
      {/*<div className="fixed bottom-0 right-0 bg-black/70 text-white text-xs p-2 z-50">
        Website HTML Length: {websiteHtml?.length || 0}
      </div>*/}
      
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
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={handleResetChat}
          >
            <RefreshCw className="h-4 w-4 text-gray-700" />
          </button>
          
          {/* Settings button */}
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Settings className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </header>

      {currentScreen === "chat" ? (
        <>
          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="max-w-lg mx-auto space-y-4">
              {/* Show initial question if no messages yet */}
              {messages.length === 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-800">{questions[0]}</p>
                </div>
              )}
              
              {/* Display chat messages */}
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[80%] px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 shadow-sm rounded-bl-none"
                    }`}
                  >
                    {message.content}
                    
                    {/* Display images if message has them */}
                    {message.images && message.images.length > 0 && (
                      <div className="mt-2">
                        {message.images && message.images.length === 1 ? (
                          <img src={message.images[0]} alt="Uploaded" className="rounded-lg max-w-full h-auto" />
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {message.images.map((img, i) => (
                              <img key={i} src={img} alt={`Uploaded ${i}`} className="rounded-lg w-full h-auto" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Show current question based on conversation progress */}
              {messages.length > 0 && 
               messages[messages.length - 1].role === "user" && 
               currentQuestionIndex < questions.length && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-800">{questions[currentQuestionIndex]}</p>
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-sm rounded-bl-none max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Image Upload Section - Show after enough questions answered */}
          {showImageUpload && uploadedImages.length > 0 && (
            <div className="p-4 bg-white border-t">
              <div className="max-w-lg mx-auto">
                <p className="text-sm text-gray-600 mb-2">{uploadedImages.length} image(s) uploaded</p>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {uploadedImages.slice(0, 4).map((image, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-md bg-gray-100 group">
                      <img 
                        src={image.url} 
                        alt={`Uploaded ${idx}`} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.filename.length > 15 
                            ? image.filename.substring(0, 12) + '...' 
                            : image.filename}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {uploadedImages.length > 4 && (
                    <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-700 font-medium">+{uploadedImages.length - 4}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Add More
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-xs"
                    onClick={handleGenerateWebsite}
                  >
                    View All & Create Website
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className="p-3 border-t bg-white">
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex items-center gap-2">
              {/* Image upload button */}
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-5 w-5 text-gray-600" />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </button>
              
              {/* Text input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                />
                
                {/* Upload progress indicator */}
                {uploadProgress > 0 && (
                  <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                )}
                
                {/* Send button */}
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        // Website Preview Screen
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview iframe */}
          <div className="flex-1 bg-gray-100">
            {websiteHtml ? (
              <iframe
                srcDoc={websiteHtml}
                title="Website Preview"
                className="w-full h-full border-0"
                style={{width: '100%', height: '100%', border: 'none'}}
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No website generated yet</p>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="p-3 bg-white border-t">
            <div className="max-w-lg mx-auto">
              <Button
                onClick={updateWebsite}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Update Website
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add padding at the bottom to accommodate the fixed navigation */}
      <div className="h-16"></div>
    </div>
    </div>
  );
}