import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Smartphone, Computer, Download, Save, Check, Home, MessageSquare, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { useToast } from '@/hooks/use-toast';
import { ViewMode } from '@/types';

export default function WebsitePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [websiteHtml, setWebsiteHtml] = useState("");
  const [websiteCss, setWebsiteCss] = useState("");
  
  const {
    uploadedImages,
    websiteStructure,
    isGeneratingWebsite,
    generateWebsiteContent,
  } = useChat();

  useEffect(() => {
    // If no images are uploaded, redirect back to chat
    if (!uploadedImages || uploadedImages.length === 0) {
      toast({
        title: "Upload images first",
        description: "Please upload some images before creating your website",
      });
      navigate('/chat');
    }
  }, [uploadedImages, navigate, toast]);

  useEffect(() => {
    if (websiteStructure?.html && websiteStructure?.css) {
      setWebsiteHtml(websiteStructure.html);
      setWebsiteCss(websiteStructure.css);
    }
  }, [websiteStructure]);

  const handleGenerateWebsite = async () => {
    setIsGenerating(true);
    try {
      await generateWebsiteContent("Create a professional business website using the uploaded images with modern design and intuitive navigation. Include home, about, services, gallery, and contact sections.");
      toast({
        title: "Website generated!",
        description: "Your professional website has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem generating your website. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    // Create a full HTML document with CSS included
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Generated Website</title>
    <style>
${websiteCss}
    </style>
</head>
<body>
${websiteHtml}
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
      title: "Website exported",
      description: "Your website has been downloaded as an HTML file.",
    });
  };

  const handleSave = () => {
    setIsSaved(true);
    toast({
      title: "Website saved",
      description: "Your website has been saved successfully.",
    });

    // Reset saved status after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-gray-200 shadow-sm bg-white">
        <Button
          onClick={() => navigate('/chat')}
          variant="ghost"
          size="icon"
          className="rounded-full mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="font-semibold">Website Preview</h1>
          <p className="text-xs text-gray-500">View your generated website</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Simple view mode toggle */}
          <Button
            onClick={() => setViewMode("mobile")}
            variant="ghost"
            size="sm"
            className={viewMode === "mobile" ? "bg-blue-100 text-blue-700" : ""}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            <span className="text-xs">Mobile</span>
          </Button>
          
          <Button
            onClick={() => setViewMode("desktop")}
            variant="ghost"
            size="sm"
            className={viewMode === "desktop" ? "bg-blue-100 text-blue-700" : ""}
          >
            <Computer className="h-4 w-4 mr-1" />
            <span className="text-xs">Desktop</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-grow overflow-y-auto bg-gray-50 p-4 flex flex-col items-center justify-center">
        {isGenerating || isGeneratingWebsite ? (
          <div className="text-center max-w-md">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Creating Your Website</h2>
            <p className="text-gray-600">
              Please wait while we generate your professional website. This may take a minute...
            </p>
          </div>
        ) : websiteHtml ? (
          <div className={`bg-white shadow-md rounded-lg overflow-hidden mx-auto border border-gray-200 transition-all ${
            viewMode === "mobile" ? "max-w-[375px]" : "max-w-4xl"
          }`}>
            <div 
              className="website-preview-container" 
              dangerouslySetInnerHTML={{ __html: websiteHtml }}
            />
            <style>{websiteCss}</style>
          </div>
        ) : (
          <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Computer className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Generate Your Website
            </h2>
            <p className="text-gray-600 mb-6">
              You've uploaded {uploadedImages?.length || 0} images. Click the button below to create your professional business website.
            </p>
            
            <Button
              onClick={handleGenerateWebsite}
              className="w-full py-4 px-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              disabled={isGenerating}
            >
              Generate My Website Now
            </Button>
          </div>
        )}
      </div>

      {/* Footer with actions - only show when website is generated */}
      {websiteHtml && (
        <div className="p-3 border-t border-gray-200 bg-white flex justify-center">
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              variant="outline"
              className="flex items-center gap-1 text-sm"
              disabled={isSaved}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Saved</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={handleExport}
              className="bg-blue-500 text-white flex items-center gap-1 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      )}

      {/* Bottom navigation (mobile only) */}
      <div className="sm:hidden bg-white border-t border-gray-200 py-2 px-4 flex justify-center">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex-col text-xs"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 mb-1" />
            Home
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-col text-xs"
            onClick={() => navigate('/chat')}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            Chat
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-col text-xs text-blue-500 border-t-2 border-blue-500 rounded-none"
          >
            <LayoutTemplate className="h-5 w-5 mb-1" />
            Website
          </Button>
        </div>
      </div>
    </div>
  );
}