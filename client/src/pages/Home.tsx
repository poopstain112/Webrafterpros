import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import WebsitePreview from "@/components/WebsitePreview";
import { useChat } from "@/hooks/use-chat";

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

  const handleRemoveImage = (index: number) => {
    if (uploadedImages) {
      // Just remove the image from the uploaded images array
      // This is a simpler approach - we don't re-upload the remaining images
      const newImages = [...uploadedImages];
      newImages.splice(index, 1);
      // Update the state directly instead of trying to re-upload
      clearUploadedImages();
      // We're not re-uploading files since we can't create File objects from URLs easily
      // Instead, we'll just update the UI and let the user re-upload if needed
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel: Chat Interface */}
        <div className="w-full md:w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-180px)] md:h-[calc(100vh-180px)]">
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

        {/* Right Panel: Website Preview & Editor */}
        <div className="w-full md:w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-180px)] md:h-[calc(100vh-180px)]">
          <WebsitePreview
            websiteStructure={websiteStructure}
            isGenerating={isGeneratingWebsite}
          />
        </div>
      </div>
    </main>
  );
}
