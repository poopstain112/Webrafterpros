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
    console.log("WebsitePreviewScreen: Checking for stored HTML", storedHtml ? "HTML found, length: " + storedHtml.length : "No HTML found");
    
    if (storedHtml) {
      setWebsiteHtml(storedHtml);
    } else {
      // If no HTML is found, try to reload it a few times in case we arrived before localStorage was set
      let attempts = 0;
      const checkInterval = setInterval(() => {
        const html = localStorage.getItem('generatedWebsiteHTML');
        console.log("Retry attempt", attempts + 1, "for website HTML");
        
        if (html) {
          console.log("HTML found on retry! Length:", html.length);
          setWebsiteHtml(html);
          clearInterval(checkInterval);
        } else if (++attempts >= 5) {
          console.log("Failed to find HTML after 5 attempts");
          clearInterval(checkInterval);
        }
      }, 500);
      
      return () => clearInterval(checkInterval);
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 text-white p-3 shadow-md">
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
      
      {/* Website Preview - fixed height container resolves flickering */}
      <div className="flex-1 bg-gray-100" style={{ height: 'calc(100vh - 56px)' }}>
        {websiteHtml ? (
          <WebsitePreview html={websiteHtml} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading website preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsitePreviewScreen;