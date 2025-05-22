import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import WebsitePreview from '@/components/WebsitePreview';
import MobilePullToRefresh from '@/components/MobilePullToRefresh';
import { useChat } from '@/hooks/use-chat';
import { useToast } from '@/hooks/use-toast';

const WebsitePreviewScreen = () => {
  const [websiteHtml, setWebsiteHtml] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { socialMediaLinks, editWebsiteContent } = useChat();
  const { toast } = useToast();

  // Load website HTML from localStorage with multiple key attempts
  const loadWebsiteHTML = () => {
    // Try multiple possible storage keys
    const possibleKeys = ['generatedWebsiteHTML', 'websiteHtml', 'enhancedHTML'];
    
    for (const key of possibleKeys) {
      const storedHtml = localStorage.getItem(key);
      if (storedHtml) {
        console.log(`Found HTML with key: ${key}, length: ${storedHtml.length}`);
        setWebsiteHtml(storedHtml);
        return true;
      }
    }
    
    console.log("No HTML found in localStorage with any key");
    return false;
  };
  
  // Handle pull-to-refresh
  const handleRefresh = async () => {
    console.log("Pull-to-refresh triggered");
    loadWebsiteHTML();
    toast({
      title: "Website Refreshed",
      description: "Your website has been reloaded"
    });
  };
  
  // Load website only once on component mount
  useEffect(() => {
    loadWebsiteHTML();
  }, []);

  const handleBackToChat = () => {
    setLocation('/');
  };

  // Empty state if no website is found
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
      {/* Enhanced Header with Gradient */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-400 text-white p-3 shadow-md">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToChat}
            className="text-white hover:bg-blue-700/50 mr-2 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Website Preview
          </h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleBackToChat}
          className="text-blue-600 bg-white border-white hover:bg-blue-50 shadow-sm transition-all font-medium"
        >
          <Home className="h-4 w-4 mr-1.5" />
          Back to Chat
        </Button>
      </div>
      
      {/* Website Preview with pull-to-refresh */}
      <div className="flex-1 bg-gray-100" style={{ height: 'calc(100vh - 56px)' }}>
        {websiteHtml ? (
          <MobilePullToRefresh onRefresh={handleRefresh}>
            <WebsitePreview 
              html={websiteHtml} 
              socialMediaLinks={socialMediaLinks}
              onEdit={(instructions) => editWebsiteContent(instructions)}
            />
          </MobilePullToRefresh>
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