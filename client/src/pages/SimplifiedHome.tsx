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
      {/* Header */}
      <header className="p-4 border-b border-gray-200 flex items-center">
        <div className="flex items-center">
          {currentScreen === "preview" && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setCurrentScreen("chat")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-blue-600">Instant Website</h1>
        </div>

        {currentScreen === "chat" && (
          <>
            {uploadedImages.length > 0 && (
              <Button
                className="ml-auto bg-blue-500 text-white"
                onClick={handleGenerateWebsite}
              >
                Create Website
              </Button>
            )}
          </>
        )}

        {currentScreen === "preview" && (
          <Button
            className="ml-auto bg-green-500 text-white"
            onClick={handleDownloadWebsite}
            disabled={!websiteStructure || isGeneratingWebsite}
          >
            Download Website
          </Button>
        )}
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

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleUploadClick}
                >
                  <Image className="h-5 w-5 text-blue-500" />
                </Button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Describe your business website..."
                  className="flex-1 py-2 px-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />

                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full bg-blue-500"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="mt-2 flex overflow-x-auto gap-2 py-1">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.url}
                        alt={`Uploaded ${index + 1}`}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <button
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
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

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 bg-white px-4 py-2 flex justify-around">
        <Button
          variant={currentScreen === "chat" ? "default" : "ghost"}
          className="flex flex-col items-center rounded-none w-full mx-1"
          onClick={() => setCurrentScreen("chat")}
        >
          <MessageSquare className="h-5 w-5 mb-1" />
          <span className="text-xs">Chat</span>
        </Button>

        <Button
          variant={currentScreen === "preview" ? "default" : "ghost"}
          className="flex flex-col items-center rounded-none w-full mx-1"
          onClick={() => setCurrentScreen("preview")}
          disabled={!websiteStructure && !isGeneratingWebsite}
        >
          <Image className="h-5 w-5 mb-1" />
          <span className="text-xs">Website</span>
        </Button>
      </div>
    </div>
  );
}