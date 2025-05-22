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

  // Load website HTML from API if not in localStorage
  const loadWebsiteHTML = async () => {
    // Try localStorage first
    const possibleKeys = ['generatedWebsiteHTML', 'websiteHtml', 'enhancedHTML'];
    
    for (const key of possibleKeys) {
      const storedHtml = localStorage.getItem(key);
      if (storedHtml) {
        console.log(`Found HTML with key: ${key}, length: ${storedHtml.length}`);
        setWebsiteHtml(storedHtml);
        return true;
      }
    }
    
    // If not in localStorage, generate a new one from chat data
    try {
      console.log("No HTML in localStorage, generating new website...");
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: 1 })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.html) {
          console.log(`Generated new HTML, length: ${data.html.length}`);
          setWebsiteHtml(data.html);
          return true;
        }
      }
    } catch (error) {
      console.error("Error generating website:", error);
    }
    
    console.log("No HTML found and generation failed");
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
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const instructions = prompt("What would you like to change about the website?");
              if (instructions) {
                editWebsiteContent(instructions);
              }
            }}
            className="text-blue-600 bg-white border-white hover:bg-blue-50 shadow-sm transition-all font-medium"
          >
            Edit Website
          </Button>
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