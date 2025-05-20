import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Upload } from "lucide-react";

export default function DirectImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const selectedFiles = Array.from((e.target as HTMLInputElement).files || []);
      setFiles(selectedFiles);
    };
    
    input.click();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select images to upload",
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
      
      // Add timestamp to URLs to prevent caching
      const timestamp = Date.now();
      const imagesWithTimestamps = data.map((img: any) => ({
        ...img,
        url: `${img.url}?t=${timestamp}`
      }));
      
      setUploadedImages(imagesWithTimestamps);
      
      toast({
        title: "Upload successful",
        description: `Uploaded ${files.length} files successfully`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your images",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Upload Images</h2>
        <p className="text-gray-500 text-sm">Select your images then click Upload</p>
      </div>
      
      <Button 
        onClick={handleUploadClick}
        className="w-full h-20 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-dashed border-blue-300 mb-4"
      >
        <ImageIcon className="h-6 w-6 mb-1" />
        <span className="text-sm">Select Images</span>
      </Button>
      
      {files.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {files.length} file(s) selected
          </p>
          <Button 
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload
              </span>
            )}
          </Button>
        </div>
      )}
      
      {uploadedImages.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Uploaded Images:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {uploadedImages.map((image, index) => (
              <div key={index} className="aspect-square rounded overflow-hidden border">
                <img 
                  src={image.url}
                  alt={`Uploaded ${index}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log(`Image failed to load: ${image.url}, retrying...`);
                    e.currentTarget.src = `${image.url.split('?')[0]}?t=${Date.now()}`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}