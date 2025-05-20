import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface WebsitePreviewProps {
  websiteStructure?: {
    html: string;
    css: string;
    structure: any;
    recommendation?: string;
  };
  onClose: () => void;
  onEdit: (instructions?: string) => void;
}

export default function WebsitePreview({ websiteStructure, onClose, onEdit }: WebsitePreviewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  
  // Load website content from props or localStorage
  useEffect(() => {
    if (websiteStructure) {
      // Use passed props if available
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
  }, [websiteStructure]);

  // Create a combined HTML document with the CSS included
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${css}</style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;
  
  // Handle submitting edit instructions
  const handleSubmitEdit = () => {
    if (editInstructions.trim()) {
      onEdit(editInstructions);
      setIsEditMode(false);
      setEditInstructions("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
      <div className="bg-white p-4 shadow-md flex items-center justify-between">
        <h2 className="text-xl font-bold">Website Preview</h2>
        <div className="flex space-x-2">
          {!isEditMode ? (
            <>
              <Button 
                onClick={() => setIsEditMode(true)} 
                variant="outline"
              >
                Edit Website
              </Button>
              <Button onClick={onClose}>Close Preview</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditMode(false)} variant="outline">
                Cancel Edit
              </Button>
              <Button onClick={onClose}>Close Preview</Button>
            </>
          )}
        </div>
      </div>
      
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
        <div className="flex-1 bg-gray-100 overflow-y-auto">
          <iframe 
            srcDoc={fullHtml}
            title="Website Preview"
            className="w-full h-full border-none"
            sandbox="allow-same-origin"
          />
        </div>
      )}
      
      {recommendation && !isEditMode && showRecommendation && (
        <div className="bg-blue-50 p-4 border-t border-blue-100 relative">
          <button 
            onClick={() => setShowRecommendation(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Close recommendations"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <p className="text-sm text-gray-700">{recommendation}</p>
        </div>
      )}
    </div>
  );
}