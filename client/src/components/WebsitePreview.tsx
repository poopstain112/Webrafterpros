import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface WebsitePreviewProps {
  websiteStructure: {
    html: string;
    css: string;
    structure: any;
    recommendation?: string;
  };
  onClose: () => void;
  onEdit: (instructions?: string) => void;
}

export default function WebsitePreview({ websiteStructure, onClose, onEdit }: WebsitePreviewProps) {
  const { html, css, structure, recommendation } = websiteStructure;
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");

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
      
      {recommendation && !isEditMode && (
        <div className="bg-blue-50 p-4 border-t border-blue-100">
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <p className="text-sm text-gray-700">{recommendation}</p>
        </div>
      )}
    </div>
  );
}