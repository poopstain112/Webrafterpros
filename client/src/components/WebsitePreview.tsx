import React from 'react';
import { Button } from '@/components/ui/button';

interface WebsitePreviewProps {
  websiteStructure: {
    html: string;
    css: string;
    structure: any;
    recommendation?: string;
  };
  onClose: () => void;
  onEdit: () => void;
}

export default function WebsitePreview({ websiteStructure, onClose, onEdit }: WebsitePreviewProps) {
  const { html, css, structure, recommendation } = websiteStructure;

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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
      <div className="bg-white p-4 shadow-md flex items-center justify-between">
        <h2 className="text-xl font-bold">Website Preview</h2>
        <div className="flex space-x-2">
          <Button onClick={onEdit} variant="outline">Edit Website</Button>
          <Button onClick={onClose}>Close Preview</Button>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <iframe 
          srcDoc={fullHtml}
          title="Website Preview"
          className="w-full h-full border-none"
          sandbox="allow-same-origin"
        />
      </div>
      
      {recommendation && (
        <div className="bg-blue-50 p-4 border-t border-blue-100">
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <p className="text-sm text-gray-700">{recommendation}</p>
        </div>
      )}
    </div>
  );
}