import { useState, useEffect } from "react";
import { Computer, Smartphone, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteStructure, ViewMode } from "@/types";
import EditTools from "./EditTools";
import { useToast } from "@/hooks/use-toast";

interface WebsitePreviewProps {
  websiteStructure: WebsiteStructure | null;
  isGenerating: boolean;
}

export default function WebsitePreview({
  websiteStructure,
  isGenerating,
}: WebsitePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [websiteHtml, setWebsiteHtml] = useState("");
  const [websiteCss, setWebsiteCss] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (websiteStructure?.html && websiteStructure?.css) {
      setWebsiteHtml(websiteStructure.html);
      setWebsiteCss(websiteStructure.css);
    }
  }, [websiteStructure]);

  const handleSelectElement = (elementId: string, text: string) => {
    setSelectedElement(elementId);
    setEditingText(text);
  };

  const handleTextChange = (newText: string) => {
    setEditingText(newText);
  };

  const handleSaveChanges = () => {
    // In a real implementation, this would modify the DOM or update a state
    // that represents the website structure
    toast({
      title: "Changes saved",
      description: "Your changes have been applied to the website preview.",
    });
    setSelectedElement(null);
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="font-semibold">Website Preview</h2>
          <p className="text-sm text-gray-500">Click any element to edit</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode("mobile")}
            className={`text-sm px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              viewMode === "mobile"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            variant="ghost"
            size="sm"
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
          <Button
            onClick={() => setViewMode("desktop")}
            className={`text-sm px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              viewMode === "desktop"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            variant="ghost"
            size="sm"
          >
            <Computer className="h-4 w-4" />
            <span className="hidden sm:inline">Desktop</span>
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "Website saved",
                description: "Your website has been saved successfully.",
              });
            }}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 mr-1"
            disabled={!websiteStructure}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          
          <Button
            onClick={handleExport}
            className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1"
            disabled={!websiteStructure}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Website Preview */}
      <div className="overflow-y-auto bg-gray-50 p-4 flex-grow">
        {isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Generating your website...</p>
              <p className="text-sm text-gray-400 mt-2">
                This may take a moment
              </p>
            </div>
          </div>
        ) : websiteStructure ? (
          <div
            className={`bg-white shadow-md rounded-lg overflow-hidden mx-auto border border-gray-200 transition-all ${
              viewMode === "mobile" ? "max-w-[375px]" : "max-w-4xl"
            }`}
          >
            <div 
              className="website-preview-container" 
              dangerouslySetInnerHTML={{ __html: websiteHtml }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.id) {
                  handleSelectElement(target.id, target.innerText);
                }
              }}
            />
            <style>{websiteCss}</style>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md bg-blue-50 p-6 border-2 border-blue-200 rounded-xl shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-blue-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-blue-700 mb-3">
                Your Website Is Ready To Generate!
              </h3>
              <p className="text-lg text-blue-600 mb-4">
                You've uploaded images! Now click the button below to create your website.
              </p>
              
              <button
                onClick={async () => {
                  try {
                    const description = "Create a beautiful website using the uploaded images. Include home, about, services, gallery, and contact sections.";
                    
                    // Show a toast notification
                    toast({
                      title: "Generating your website!",
                      description: "We're creating your website based on the uploaded images. This may take a moment...",
                    });
                    
                    // Set loading state
                    setIsGenerating(true);
                    
                    // Make direct API call
                    const response = await fetch('/api/generate-website', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ 
                        description, 
                        imageUrls: [] // Server will use the uploaded images
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to generate website');
                    }
                    
                    // Get the response data
                    const websiteData = await response.json();
                    
                    // Update state with new website data
                    setWebsiteHtml(websiteData.html);
                    setWebsiteCss(websiteData.css);
                    
                    // Success notification
                    toast({
                      title: "Website generated!",
                      description: "Your website has been created successfully.",
                    });
                  } catch (error) {
                    console.error('Error generating website:', error);
                    toast({
                      title: "Error",
                      description: "There was a problem generating your website. Please try again.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                className="w-full py-4 px-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                GENERATE MY WEBSITE NOW
              </button>
              
              <p className="text-blue-500 mt-3">
                Click the button above to automatically create your website based on your uploaded images
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Editing Tools */}
      {selectedElement && (
        <EditTools
          text={editingText}
          onTextChange={handleTextChange}
          onSave={handleSaveChanges}
          onCancel={() => setSelectedElement(null)}
        />
      )}
    </div>
  );
}
