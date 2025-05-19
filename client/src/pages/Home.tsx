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
      const newImages = [...uploadedImages];
      newImages.splice(index, 1);
      clearUploadedImages();
      handleImageUpload(
        newImages.map((img) => {
          // Convert URL to File object
          const filename = img.filename;
          const url = img.url;
          // This is a placeholder. In a real app, you would need to handle this differently
          return new File([], filename);
        })
      );
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel: Chat Interface */}
        <div className="w-full md:w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-180px)]">
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
        <div className="w-full md:w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-180px)]">
          <WebsitePreview
            websiteStructure={websiteStructure}
            isGenerating={isGeneratingWebsite}
          />
        </div>
      </div>
    </main>
  );
}
