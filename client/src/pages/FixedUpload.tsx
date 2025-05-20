import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function FixedUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('websiteId', '1');
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Uploaded successfully:", data);
      
      // Add a unique timestamp to each URL to prevent browser caching
      const timestamp = Date.now();
      const imagesWithTimestamps = data.map((img: any) => ({
        ...img,
        url: `${img.url}?t=${timestamp + Math.floor(Math.random() * 1000)}`
      }));
      
      setUploadedImages(imagesWithTimestamps);
      
      toast({
        title: "Upload successful",
        description: `Uploaded ${selectedFiles.length} images`
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Simple Image Upload</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Images</label>
        <input 
          type="file" 
          multiple 
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">You can select multiple images</p>
      </div>
      
      <Button 
        onClick={handleUpload}
        disabled={isUploading || selectedFiles.length === 0}
        className="w-full mb-6"
      >
        {isUploading ? 'Uploading...' : 'Upload Images'}
      </Button>
      
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-medium mb-2">Selected Files:</h2>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
            ))}
          </ul>
        </div>
      )}
      
      {uploadedImages.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-3">Uploaded Images:</h2>
          <div className="grid grid-cols-2 gap-3">
            {uploadedImages.map((image, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <img 
                  src={image.url} 
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image at ${image.url}`);
                    // Try again with a new timestamp
                    const newTimestamp = Date.now();
                    e.currentTarget.src = `${image.url.split('?')[0]}?t=${newTimestamp}`;
                  }}
                />
                <div className="p-2 text-xs break-all bg-gray-50">
                  <div>URL: {image.url}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}