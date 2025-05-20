import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TestUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('websiteId', '1');
      
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      
      // Extract image URLs and add timestamp to prevent caching
      const imageUrls = data.map((img: any) => `${img.url}?t=${Date.now()}`);
      setUploadedImages(imageUrls);
      
      toast({
        title: "Upload successful",
        description: `Uploaded ${files.length} files`,
      });
    } catch (error) {
      console.error("Upload error:", error);
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
    <div className="container max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Image Upload</h1>
      
      <div className="mb-4">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
          className="border p-2 w-full rounded"
        />
      </div>
      
      <div className="mb-4">
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || files.length === 0}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </div>
      
      {uploadedImages.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Uploaded Images:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="overflow-hidden rounded border">
                <img 
                  src={url} 
                  alt={`Uploaded ${index}`} 
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}