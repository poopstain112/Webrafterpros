import { useState } from "react";
import { MessageSquare, Image, Zap, Eye } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import WebsitePreview from "@/components/WebsitePreview";
import { useChat } from "@/hooks/use-chat";
import { UploadedImage } from "@/types";

export default function Home() {
  const {
    messages,
    isLoading,
    uploadedImages,
    websiteStructure,
    isGeneratingWebsite,
    sendMessage,
    handleImageUpload,
    generateWebsiteContent,
    clearUploadedImages,
  } = useChat();

  // Tab system for mobile interface
  const [activeTab, setActiveTab] = useState<"chat" | "images" | "generate" | "preview">("chat");

  const handleRemoveImage = (index: number) => {
    if (uploadedImages) {
      // Just remove the image from the uploaded images array
      const newImages = [...uploadedImages];
      newImages.splice(index, 1);
      clearUploadedImages();
    }
  };

  // Function to render image gallery
  const renderImageGallery = () => {
    return (
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <h2 className="text-lg font-medium mb-4">Your Uploaded Images</h2>
        {uploadedImages && uploadedImages.length > 0 ? (
          <div className="image-gallery">
            {uploadedImages.map((image: UploadedImage, index: number) => (
              <div key={index} className="image-item">
                <img src={image.url} alt={`Uploaded ${index + 1}`} />
                <button 
                  className="remove-image"
                  onClick={() => handleRemoveImage(index)}
                  aria-label="Remove image"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Image className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">No images uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Upload images from the chat interface to see them here
            </p>
          </div>
        )}
      </div>
    );
  };

  // Function to render generate website panel
  const renderGeneratePanel = () => {
    return (
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-md mx-auto text-center">
          <Zap className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Generate Your Website
          </h2>
          <p className="text-gray-600 mb-6">
            Create a professional business website using the images you've uploaded. Our AI will design a custom website just for you!
          </p>
          <button
            onClick={() => {
              generateWebsiteContent("Create a professional business website with modern design using the uploaded images");
              setActiveTab("preview");
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            disabled={!uploadedImages || uploadedImages.length === 0}
          >
            <Zap className="w-5 h-5 mr-2" />
            Generate Website
          </button>
          {(!uploadedImages || uploadedImages.length === 0) && (
            <p className="text-amber-500 text-sm mt-3">
              Please upload at least one image before generating your website
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="main-content">
      {/* Desktop Layout: Two panels side by side */}
      <div className="hidden md:block app-panel">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onImageUpload={handleImageUpload}
          uploadedImages={uploadedImages}
          onRemoveImage={handleRemoveImage}
          onGenerateWebsite={generateWebsiteContent}
        />
      </div>

      <div className="hidden md:block app-panel">
        <WebsitePreview
          websiteStructure={websiteStructure}
          isGenerating={isGeneratingWebsite}
        />
      </div>

      {/* Mobile Layout: Tabbed interface */}
      <div className="md:hidden app-panel">
        <div className="tab-container">
          <div className="tab-nav">
            <button 
              className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              <MessageSquare className="w-4 h-4 mr-1 inline-block" />
              <span>Chat</span>
            </button>
            <button 
              className={`tab-button ${activeTab === "images" ? "active" : ""}`}
              onClick={() => setActiveTab("images")}
            >
              <Image className="w-4 h-4 mr-1 inline-block" />
              <span>Images</span>
              {uploadedImages && uploadedImages.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {uploadedImages.length}
                </span>
              )}
            </button>
            <button 
              className={`tab-button ${activeTab === "generate" ? "active" : ""}`}
              onClick={() => setActiveTab("generate")}
            >
              <Zap className="w-4 h-4 mr-1 inline-block" />
              <span>Generate</span>
            </button>
            <button 
              className={`tab-button ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              <Eye className="w-4 h-4 mr-1 inline-block" />
              <span>Preview</span>
            </button>
          </div>
          
          <div className="tab-content h-[calc(100vh-10rem)]">
            <div className={`tab-panel ${activeTab === "chat" ? "active" : ""} h-full`}>
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                onImageUpload={handleImageUpload}
                uploadedImages={uploadedImages}
                onRemoveImage={handleRemoveImage}
                onGenerateWebsite={generateWebsiteContent}
              />
            </div>
            
            <div className={`tab-panel ${activeTab === "images" ? "active" : ""} h-full`}>
              {renderImageGallery()}
            </div>
            
            <div className={`tab-panel ${activeTab === "generate" ? "active" : ""} h-full`}>
              {renderGeneratePanel()}
            </div>
            
            <div className={`tab-panel ${activeTab === "preview" ? "active" : ""} h-full`}>
              <WebsitePreview
                websiteStructure={websiteStructure}
                isGenerating={isGeneratingWebsite}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
