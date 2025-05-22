import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, ExternalLink } from "lucide-react";
import { UploadedImage } from "@/types";

interface WebsiteControlsProps {
  uploadedImages: UploadedImage[];
  onImageUpload: (files: File[]) => Promise<void>;
  onGenerateWebsite: () => Promise<void>;
  onViewWebsite: () => void;
  hasWebsite: boolean;
  isGenerating: boolean;
}

export default function WebsiteControls({ 
  uploadedImages, 
  onImageUpload, 
  onGenerateWebsite, 
  onViewWebsite, 
  hasWebsite, 
  isGenerating 
}: WebsiteControlsProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      
      // Check if user selected more than 5 images
      if (files.length > 5) {
        // This should trigger the parent component's toast
        return;
      }
      
      setIsUploading(true);
      try {
        await onImageUpload(files);
        event.target.value = ""; // Reset the input
      } catch (error) {
        console.error("Error uploading images:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="bg-gray-50 p-4 space-y-3">
      {/* Image Upload Section */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Website Images</h3>
          <span className="text-sm text-gray-500">{uploadedImages.length}/5</span>
        </div>
        
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <label
          htmlFor="image-upload"
          className="flex items-center justify-center w-full p-4 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="text-center">
            <Camera className="mx-auto h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-blue-600">
              {isUploading ? "Uploading..." : "Upload Images (Max 5)"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Choose up to 5 high-quality images for your website
            </p>
          </div>
        </label>

        {/* Uploaded Images Grid */}
        {uploadedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image.url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Website Generation Section */}
      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3">Generate Website</h3>
          
          <Button 
            onClick={onGenerateWebsite} 
            disabled={isGenerating || isUploading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl shadow-md font-medium text-lg transition-all duration-200 hover:shadow-lg"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Create Your Website
              </span>
            )}
          </Button>
        </div>
      )}

      {/* View Website Section */}
      {hasWebsite && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <Button
            onClick={onViewWebsite}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl shadow-md font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Website
          </Button>
        </div>
      )}
    </div>
  );
}