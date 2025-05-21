import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import SimplePullToRefresh from './SimplePullToRefresh';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
      } else {
        // Set default example website if nothing is found
        setHtmlContent(`
          <div class="container py-5">
            <header class="text-center mb-5">
              <h1 class="display-4">Your Business Name</h1>
              <p class="lead">Professional services for every need</p>
            </header>
            <section class="row">
              <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                  <div class="card-body">
                    <h3>Our Services</h3>
                    <p>We provide top-quality services tailored to your needs.</p>
                    <ul>
                      <li>Professional Consultation</li>
                      <li>Expert Solutions</li>
                      <li>Customer Support</li>
                    </ul>
                    <button class="btn btn-primary">Learn More</button>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                  <div class="card-body">
                    <h3>About Us</h3>
                    <p>With years of experience, our team is dedicated to delivering excellence.</p>
                    <p>We take pride in our work and commitment to customer satisfaction.</p>
                    <button class="btn btn-outline-primary">Contact Us</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        `);
        setCssContent(''); 
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
  const handleSubmitEdit = async () => {
    if (editInstructions.trim()) {
      try {
        // If there's an external edit handler, use it
        if (onEdit) {
          onEdit(editInstructions);
          setIsEditMode(false);
          setEditInstructions("");
          return;
        }
        
        // Otherwise, make a direct API call to edit the website
        setIsEditMode(false);
        
        // Show loading state
        const loadingToast = toast({
          title: "Updating Website",
          description: "Please wait while we apply your changes...",
          duration: 30000, // Long duration since this might take time
        });
        
        // Get current HTML
        const currentHtml = htmlContent;
        
        // Call the API to edit the website
        const response = await fetch('/api/edit-website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instructions: editInstructions,
            html: currentHtml,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update website');
        }
        
        // Get updated HTML
        const result = await response.json();
        
        // Update localStorage with the new HTML
        if (result && result.html) {
          localStorage.setItem('generatedWebsiteHTML', result.html);
          setHtmlContent(result.html);
          
          // Clear edit instructions
          setEditInstructions("");
          
          // Show success message and dismiss loading toast
          toast({
            title: "Success!",
            description: "Your website has been updated.",
            duration: 3000,
          });
        }
        
        // Dismiss loading toast
        loadingToast.dismiss();
        
      } catch (error) {
        console.error('Error updating website:', error);
        
        // Show error message
        toast({
          title: "Update Failed",
          description: "There was a problem updating your website. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
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
      
      {/* Show only Edit button in standalone mode (when on the dedicated preview page) */}
      {isStandalone && !isEditMode && (
        <div className="absolute top-3 right-3 z-10">
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
            <h3 className="text-xl font-bold mb-2">Edit Your Website</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose from the options below or describe custom changes.
            </p>
            
            {/* Quick edit options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Button 
                variant="outline"
                className="justify-start text-left p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => setEditInstructions("Change the color scheme to blue and white")}
              >
                <div>
                  <span className="font-medium">Change Color Scheme</span>
                  <p className="text-xs text-gray-500 mt-1">Update to blue and white colors</p>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="justify-start text-left p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => setEditInstructions("Add a contact form section at the bottom of the page")}
              >
                <div>
                  <span className="font-medium">Add Contact Form</span>
                  <p className="text-xs text-gray-500 mt-1">Include form with name, email and message fields</p>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="justify-start text-left p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => setEditInstructions("Make the buttons more prominent with rounded corners and a hover effect")}
              >
                <div>
                  <span className="font-medium">Improve Buttons</span>
                  <p className="text-xs text-gray-500 mt-1">Add hover effects and rounded corners</p>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="justify-start text-left p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => setEditInstructions("Add social media links in the footer")}
              >
                <div>
                  <span className="font-medium">Add Social Media</span>
                  <p className="text-xs text-gray-500 mt-1">Include Facebook, Instagram, and Twitter icons</p>
                </div>
              </Button>
            </div>
            
            {/* Custom edit option */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">Custom Changes</h4>
              <textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                placeholder="Describe what you'd like to change about your website..."
                className="w-full h-24 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => setIsEditMode(false)} 
                variant="outline"
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitEdit}
                disabled={!editInstructions.trim()}
                className="bg-blue-500 hover:bg-blue-600 font-medium"
              >
                Apply Changes
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-white border rounded overflow-hidden">
            <div className="text-center py-2 bg-gray-50 border-b text-sm text-gray-500">
              Preview (changes will appear after applying)
            </div>
            <iframe 
              srcDoc={fullHtml}
              title="Website Preview"
              className="w-full h-full border-none"
              sandbox="allow-same-origin"
              style={{ height: 'calc(100% - 30px)' }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-100 overflow-hidden" style={{ position: 'relative' }}>
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