import { useState } from "react";
import { MessageSquare, Settings, Image, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { useToast } from "@/hooks/use-toast";

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
  } = useChat();

  const [currentScreen, setCurrentScreen] = useState<"chat" | "preview">("chat");
  const [inputMessage, setInputMessage] = useState("");
  const [showImageUploader, setShowImageUploader] = useState(false);

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  // Handle image upload
  const handleUploadClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        handleImageUpload(files);
        toast({
          title: "Images uploaded",
          description: `${files.length} image(s) added successfully`,
        });
      }
    };
    fileInput.click();
  };

  // Handle website generation
  const handleGenerateWebsite = () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "Upload images first",
        description: "Please upload at least one image to generate a website",
        variant: "destructive",
      });
      return;
    }

    generateWebsiteContent(
      "Create a professional business website using the uploaded images with modern design"
    );
    setCurrentScreen("preview");
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
    <title>Your Generated Website</title>
    <style>
${websiteStructure.css}
    </style>
</head>
<body>
${websiteStructure.html}
</body>
</html>
    `;

    // Create a blob and download link
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Website downloaded",
      description: "Your website has been downloaded as an HTML file",
    });
  };

  return (
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
            onClick={() => {
              resetChat();
              setCurrentScreen("chat");
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
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Chat Screen */}
        {currentScreen === "chat" && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
                            <div className="flex overflow-x-auto gap-2 py-1">
                              {msg.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img.url}
                                  alt={`Uploaded ${i + 1}`}
                                  className="h-24 w-auto rounded border border-gray-200"
                                />
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

            {/* Modern 2025 Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 shadow-sm">
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
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
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
                <div className="mt-2 flex overflow-x-auto gap-2 py-1 scrollbar-hide">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="h-14 w-14 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                        <img
                          src={img.url}
                          alt={`Uploaded ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        className="absolute -top-1.5 -right-1.5 bg-white shadow-md text-red-500 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newImages = [...uploadedImages];
                          newImages.splice(index, 1);
                          clearUploadedImages();
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h2 className="text-xl font-medium mb-2">Creating your website...</h2>
                  <p className="text-gray-600">Please wait a moment</p>
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