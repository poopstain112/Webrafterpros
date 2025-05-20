import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function SimpleTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('websiteId', '1');
      formData.append('images', selectedFile);

      console.log("Uploading single file:", selectedFile.name);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Upload success, server response:", data);

      if (data && data[0] && data[0].url) {
        // Add timestamp to prevent caching
        const imageUrl = `${data[0].url}?t=${Date.now()}`;
        setUploadedImage(imageUrl);
      } else {
        throw new Error("Server response did not include image URL");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Simple Image Upload Test</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select a single image to upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0 file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="w-full"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </Button>
        
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {error}
          </div>
        )}
        
        {uploadedImage && (
          <div className="space-y-3">
            <div className="text-green-600 font-medium">Image uploaded successfully!</div>
            <div className="border rounded-md overflow-hidden">
              <img
                src={uploadedImage}
                alt="Uploaded image"
                className="w-full h-auto"
                onError={(e) => {
                  console.error("Image failed to load:", uploadedImage);
                  setError("Failed to display uploaded image");
                }}
              />
            </div>
            <div className="text-sm text-gray-500">
              Image URL: {uploadedImage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}