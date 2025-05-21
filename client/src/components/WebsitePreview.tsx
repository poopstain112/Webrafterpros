import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import SimplePullToRefresh from './SimplePullToRefresh';

interface WebsitePreviewProps {
  websiteStructure?: {
    html: string;
    css: string;
    structure: any;
    recommendation?: string;
  };
  onClose?: () => void;
  onEdit?: (instructions?: string) => void;
  html?: string;
}

export default function WebsitePreview({ websiteStructure, onClose, onEdit, html }: WebsitePreviewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setLocation] = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Load website content from props or localStorage
  useEffect(() => {
    if (html) {
      // If direct HTML is provided
      setHtmlContent(html);
      setCssContent('');
    } else if (websiteStructure) {
      // Use passed website structure if available
      setHtmlContent(websiteStructure.html || '');
      setCssContent(websiteStructure.css || '');
      setRecommendationText(websiteStructure.recommendation || '');
    } else {
      // Try to load from localStorage
      const storedHtml = localStorage.getItem('generatedWebsiteHTML');
      if (storedHtml) {
        setHtmlContent(storedHtml);
        setCssContent(''); // No CSS in localStorage version
      }
    }
  }, [websiteStructure, html]);

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Re-fetch content from localStorage
    const storedHtml = localStorage.getItem('generatedWebsiteHTML');
    if (storedHtml) {
      setHtmlContent(storedHtml);
    }
    
    // Simulate loading time
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Process HTML content - if it's already a full HTML document, use it as is
  const processHtmlContent = () => {
    // If the content already has DOCTYPE or <html> tag, it's likely a complete document
    if (htmlContent.trim().startsWith('<!DOCTYPE html>') || 
        htmlContent.trim().startsWith('<html')) {
      return htmlContent;
    }

    // Otherwise, wrap it in a full HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssContent}
    /* Add essential styles to ensure proper display */
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    * {
      box-sizing: border-box;
    }
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    header, nav, section, footer {
      width: 100%;
      display: block;
    }
  </style>
</head>
<body>
  ${htmlContent || '<div class="container"><h1>Website Preview</h1><p>Loading content...</p></div>'}
</body>
</html>`;
  };
  
  // Create the final HTML document to display
  const fullHtml = processHtmlContent();
  
  // Handle submitting edit instructions
  const handleSubmitEdit = () => {
    if (editInstructions.trim() && onEdit) {
      onEdit(editInstructions);
      setIsEditMode(false);
      setEditInstructions("");
    }
  };
  
  // Handle close preview
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // If no onClose handler, navigate back to chat
      setLocation('/');
    }
  };

  // Check if this is standalone mode (from WebsitePreviewScreen)
  const isStandalone = !onClose;

  return (
    <div className={`${isStandalone ? '' : 'fixed inset-0 bg-black/50 z-50'} flex flex-col h-full`}>
      {/* Only show header in popup mode, not in the dedicated preview screen */}
      {!isStandalone && !isEditMode && (
        <div className="bg-blue-600 text-white p-3 shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Website Preview</h2>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setIsEditMode(true)} 
              variant="outline"
              className="text-white border-white hover:bg-blue-700"
            >
              Edit Website
            </Button>
            <Button 
              onClick={handleClose}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      {/* Only show a "Back" button when in edit mode and not in standalone */}
      {!isStandalone && isEditMode && (
        <div className="bg-blue-600 text-white p-3 shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Edit Website</h2>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setIsEditMode(false)} 
              variant="outline"
              className="text-white border-white hover:bg-blue-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleClose}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      {/* Show Refresh and Edit buttons in standalone mode (when on the dedicated preview page) */}
      {isStandalone && !isEditMode && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            className="bg-white hover:bg-gray-100 text-blue-600 font-medium shadow-md flex items-center gap-1"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            onClick={() => setIsEditMode(true)} 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md"
          >
            Edit Website
          </Button>
        </div>
      )}
      
      {isEditMode ? (
        <div className="flex-1 flex flex-col bg-gray-100 p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Edit Your Website</h3>
            <p className="text-sm text-gray-600 mb-4">
              Describe the changes you want to make to your website and our AI will update it for you.
            </p>
            <textarea
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              placeholder="Example: Change the blue background to green, make the heading text larger, add a contact form section at the bottom..."
              className="w-full h-32 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-3 flex justify-end">
              <Button 
                onClick={handleSubmitEdit}
                disabled={!editInstructions.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Apply Changes
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-white border rounded overflow-hidden">
            <iframe 
              srcDoc={fullHtml}
              title="Website Preview"
              className="w-full h-full border-none"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-100 overflow-hidden" style={{ position: 'relative' }}>
          <SimplePullToRefresh onRefresh={handleRefresh}>
            <iframe 
              ref={(iframe) => {
                // Add listener to prevent navigation from opening in the same iframe
                if (iframe) {
                  iframe.onload = () => {
                    try {
                      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
                      if (iframeDocument) {
                        const links = iframeDocument.getElementsByTagName('a');
                        
                        // Prevent default navigation and stop event propagation for all links
                        for (let i = 0; i < links.length; i++) {
                          links[i].addEventListener('click', (e) => {
                            e.preventDefault();
                            // Either prevent navigation entirely or handle it in a specific way
                            console.log('Link clicked, navigation prevented');
                          });
                        }
                      }
                    } catch (e) {
                      console.error('Error adding navigation handlers:', e);
                    }
                  };
                }
              }}
              srcDoc={fullHtml}
              title="Website Preview"
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts allow-forms"
              style={{
                minHeight: "100vh",
                width: "100%",
                border: "none",
                display: "block"
              }}
            />
          </SimplePullToRefresh>
        </div>
      )}
      
      {recommendationText && !isEditMode && showRecommendation && (
        <div className="bg-blue-50 p-4 border-t border-blue-100 relative">
          <button 
            onClick={() => setShowRecommendation(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Close recommendations"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <p className="text-sm text-gray-700">{recommendationText}</p>
        </div>
      )}
    </div>
  );
}