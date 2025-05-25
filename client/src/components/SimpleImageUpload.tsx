import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, X } from "lucide-react";
import { UploadedImage } from "@/types";

interface SimpleImageUploadProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
}

export default function SimpleImageUpload({ onImagesUploaded }: SimpleImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;
      
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('websiteId', '1');
        
        for (const file of files) {
          formData.append('images', file);
        }

        // Show loading toast
        toast({
          title: "Uploading images",
          description: `Uploading ${files.length} images...`,
        });

        console.log('Starting upload with FormData:', formData);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload error response:', errorText);
          throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Upload successful:', data);
        
        // Add a timestamp to prevent caching
        const imagesWithTimestamps = data.map((img: any) => ({
          ...img,
          displayUrl: `${img.url}?t=${Date.now()}`
        }));
        
        setUploadedImages(prev => [...prev, ...imagesWithTimestamps]);
        onImagesUploaded(imagesWithTimestamps);
        
        toast({
          title: "Upload complete",
          description: `Successfully uploaded ${files.length} images`,
        });
        
        // Redirect to loading screen after successful upload
        console.log('Upload successful, redirecting to generating variants...');
        window.location.href = '/generating-variants';
      } catch (error) {
        console.error('Error uploading images:', error);
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your images",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  };

  return (
    <div className="w-full space-y-4">
      <Button
        onClick={handleFileSelect}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-6 h-auto"
        variant="outline"
      >
        <ImageIcon className="h-5 w-5" />
        <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
      </Button>
      
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Images</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group aspect-square border rounded-md overflow-hidden">
                <img
                  src={image.displayUrl || `${image.url}?t=${Date.now()}`}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // On error, try loading with a new timestamp
                    const newTimestamp = Date.now();
                    console.log(`Image failed to load, retrying: ${image.url}?t=${newTimestamp}`);
                    e.currentTarget.src = `${image.url}?t=${newTimestamp}`;
                  }}
                />
                <button
                  className="absolute top-1 right-1 bg-black bg-opacity-70 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    const newImages = [...uploadedImages];
                    newImages.splice(index, 1);
                    setUploadedImages(newImages);
                    onImagesUploaded(newImages);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}