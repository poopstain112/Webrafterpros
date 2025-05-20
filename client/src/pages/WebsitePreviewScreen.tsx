import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import WebsitePreview from '@/components/WebsitePreview';

const WebsitePreviewScreen = () => {
  const [websiteHtml, setWebsiteHtml] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get the stored website HTML from localStorage
    const storedHtml = localStorage.getItem('generatedWebsiteHTML');
    if (storedHtml) {
      setWebsiteHtml(storedHtml);
    }
  }, []);

  const handleBackToChat = () => {
    setLocation('/');
  };

  if (!websiteHtml) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-bold mb-4">No Website Found</h2>
        <p className="text-gray-600 mb-6">No generated website content was found.</p>
        <Button onClick={handleBackToChat}>Return to Chat</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 text-white p-3">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToChat}
            className="text-white hover:bg-blue-700 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Website Preview</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBackToChat}
            className="text-white border-white hover:bg-blue-700"
          >
            <Home className="h-4 w-4 mr-1" />
            Return to Chat
          </Button>
        </div>
      </div>
      
      {/* Website Preview */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <WebsitePreview html={websiteHtml} />
      </div>
    </div>
  );
};

export default WebsitePreviewScreen;