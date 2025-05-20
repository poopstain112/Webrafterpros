import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadedImage } from "@/types";
import useEmblaCarousel from 'embla-carousel-react';

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  uploadedImages: UploadedImage[];
  onRemoveImage: (index: number) => void;
  isVisible: boolean;
  onToggleVisible: () => void;
}

export default function ImageUpload({
  onUpload,
  uploadedImages,
  onRemoveImage,
  isVisible,
  onToggleVisible,
}: ImageUploadProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Update current slide when carousel scrolls
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    // Initial call to set first slide
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Filter out non-image files and files larger than 5MB
      const validFiles = acceptedFiles.filter(
        (file) =>
          file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
      );

      if (validFiles.length !== acceptedFiles.length) {
        console.warn(
          "Some files were rejected. Only images under 5MB are allowed."
        );
      }

      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    // Prevent camera capture to avoid black screen freezing on mobile
    preventDropOnDocument: true,
    useFsAccessApi: false,
    multiple: true
  });

  return (
    <div className="w-full">
      {!isVisible ? (
        <Button
          type="button"
          onClick={onToggleVisible}
          variant="ghost"
          className="text-gray-400 hover:text-blue-500 transition rounded-full"
          size="icon"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Close button */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onToggleVisible}
              variant="ghost"
              size="sm"
              className="text-gray-500"
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          </div>
          
          {/* Upload button */}
          <Button
            type="button"
            onClick={() => {
              // Create a file input and trigger it instead of using react-dropzone
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/jpeg,image/png,image/gif,image/webp';
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                const validFiles = files.filter(
                  file => file.size <= 5 * 1024 * 1024
                );
                if (validFiles.length > 0) {
                  onUpload(validFiles);
                }
              };
              input.click();
            }}
            className="w-full py-6 h-auto flex flex-col items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-center"
          >
            <div className="mb-3 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <ImageIcon className="h-7 w-7 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-blue-700">
              Select photos from gallery
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Tap to browse your files
            </p>
            <p className="text-xs text-blue-400 mt-1">
              Max 5MB per image • JPEG, PNG, GIF, WEBP
            </p>
          </Button>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-medium text-gray-500">
              {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
            </div>
            <div className="text-xs text-blue-500 font-medium">
              Swipe to view
            </div>
          </div>
          
          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
            {/* Carousel for uploaded images */}
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {uploadedImages.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative min-w-0 flex-[0_0_100%] h-60"
                    >
                      <img
                        src={`${image.url}?t=${Date.now()}`}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error(`Error loading thumbnail for image ${index}:`, image.url);
                          // Retry with a new timestamp
                          setTimeout(() => {
                            e.currentTarget.src = `${image.url}?t=${Date.now() + 100}`;
                          }, 500);
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveImage(index);
                          }}
                          className="bg-white text-red-500 rounded-full p-1.5 shadow-md hover:bg-red-50 transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                        {index + 1} / {uploadedImages.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation buttons */}
              {uploadedImages.length > 1 && (
                <>
                  <button 
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md z-10"
                    onClick={() => emblaApi?.scrollPrev()}
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md z-10"
                    onClick={() => emblaApi?.scrollNext()}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail preview */}
            <div className="flex overflow-x-auto py-2 px-2 gap-2 bg-gray-50 border-t border-gray-100">
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer transition ${
                    currentSlide === index ? 'border-2 border-blue-500' : 'border-2 border-transparent hover:border-blue-300'
                  }`}
                  onClick={() => emblaApi?.scrollTo(index)}
                >
                  <img
                    src={`${image.url}?t=${Date.now()}`}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
