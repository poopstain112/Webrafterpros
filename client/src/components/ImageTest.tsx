import { useState, useEffect } from 'react';

// Simple component to test image loading
export function ImageTest() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  useEffect(() => {
    // Get the most recent images from the uploads folder
    fetch('/api/websites/1/messages')
      .then(res => res.json())
      .then(messages => {
        // Find any images in messages
        const images: string[] = [];
        messages.forEach((msg: any) => {
          if (msg.images && msg.images.length > 0) {
            msg.images.forEach((img: any) => {
              images.push(img.url);
            });
          }
        });
        setUploadedImages(images);
      })
      .catch(err => console.error("Error fetching images:", err));
  }, []);
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Image Loading Test</h2>
      
      {uploadedImages.length === 0 ? (
        <p>No images found in messages</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {uploadedImages.map((url, index) => (
            <div key={index} className="border p-2 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Image {index+1}: {url}</p>
              <div className="relative h-48 bg-gray-100 rounded">
                <img 
                  src={url} 
                  alt={`Test ${index+1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error(`Failed to load image ${index}:`, url);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTkgM0g1QzMuODk1NDMgMyAzIDMuODk1NDMgMyA1VjE5QzMgMjAuMTA0NiAzLjg5NTQzIDIxIDUgMjFIMTlDMjAuMTA0NiAyMSAyMSAyMC4xMDQ2IDIxIDE5VjVDMjEgMy44OTU0MyAyMC4xMDQ2IDMgMTkgM1oiIHN0cm9rZT0iI2ZmMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTguOSAxMC45Njg1QzEwLjA0NTUgMTAuOTY4NSAxMC45NjkgMTAuMDQ1MSAxMC45NjkgOC44OTk2QzEwLjk2OSA3Ljc1NDEgMTAuMDQ1NSA2LjgzMDYgOC45IDYuODMwNkM3Ljc1NDUgNi44MzA2IDYuODMxIDcuNzU0MSA2LjgzMSA4Ljg5OTZDNS44MzEgOS44OTk2IDcuNzU0NSAxMC45Njg1IDguOSAxMC45Njg1WiIgZmlsbD0iI2ZmMDAwMCIvPjxwYXRoIGQ9Ik0xNiAxNkg2TDkgMTIuNUwxMSAxNUwxMyAxM0wxNiAxNloiIGZpbGw9IiNmZjAwMDAiLz48L3N2Zz4=';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="font-bold">Try direct references:</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Try a direct reference to the most recent image */}
          {uploadedImages.length > 0 && (
            <div className="border p-2 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Using latest URL directly:</p>
              <img 
                src={uploadedImages[0]} 
                alt="Direct Test" 
                className="h-48 object-contain bg-gray-100"
                onError={(e) => {
                  console.error('Failed to load direct image:', uploadedImages[0]);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTkgM0g1QzMuODk1NDMgMyAzIDMuODk1NDMgMyA1VjE5QzMgMjAuMTA0NiAzLjg5NTQzIDIxIDUgMjFIMTlDMjAuMTA0NiAyMSAyMSAyMC4xMDQ2IDIxIDE5VjVDMjEgMy44OTU0MyAyMC4xMDQ2IDMgMTkgM1oiIHN0cm9rZT0iI2ZmMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTguOSAxMC45Njg1QzEwLjA0NTUgMTAuOTY4NSAxMC45NjkgMTAuMDQ1MSAxMC45NjkgOC44OTk2QzEwLjk2OSA3Ljc1NDEgMTAuMDQ1NSA2LjgzMDYgOC45IDYuODMwNkM3Ljc1NDUgNi44MzA2IDYuODMxIDcuNzU0MSA2LjgzMSA4Ljg5OTZDNS44MzEgOS44OTk2IDcuNzU0NSAxMC45Njg1IDguOSAxMC45Njg1WiIgZmlsbD0iI2ZmMDAwMCIvPjxwYXRoIGQ9Ik0xNiAxNkg2TDkgMTIuNUwxMSAxNUwxMyAxM0wxNiAxNloiIGZpbGw9IiNmZjAwMDAiLz48L3N2Zz4=';
                }}
              />
            </div>
          )}
          
          {/* Try a static reference */}
          <div className="border p-2 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Using static reference:</p>
            <img 
              src="/uploads/1747697781788-31728937.jpg" 
              alt="Static Test" 
              className="h-48 object-contain bg-gray-100"
              onError={(e) => {
                console.error('Failed to load static image');
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTkgM0g1QzMuODk1NDMgMyAzIDMuODk1NDMgMyA1VjE5QzMgMjAuMTA0NiAzLjg5NTQzIDIxIDUgMjFIMTlDMjAuMTA0NiAyMSAyMSAyMC4xMDQ2IDIxIDE5VjVDMjEgMy44OTU0MyAyMC4xMDQ2IDMgMTkgM1oiIHN0cm9rZT0iI2ZmMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTguOSAxMC45Njg1QzEwLjA0NTUgMTAuOTY4NSAxMC45NjkgMTAuMDQ1MSAxMC45NjkgOC44OTk2QzEwLjk2OSA3Ljc1NDEgMTAuMDQ1NSA2LjgzMDYgOC45IDYuODMwNkM3Ljc1NDUgNi44MzA2IDYuODMxIDcuNzU0MSA2LjgzMSA4Ljg5OTZDNS44MzEgOS44OTk2IDcuNzU0NSAxMC45Njg1IDguOSAxMC45Njg1WiIgZmlsbD0iI2ZmMDAwMCIvPjxwYXRoIGQ9Ik0xNiAxNkg2TDkgMTIuNUwxMSAxNUwxMyAxM0wxNiAxNloiIGZpbGw9IiNmZjAwMDAiLz48L3N2Zz4=';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageTest;