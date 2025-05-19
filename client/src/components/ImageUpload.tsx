import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadedImage } from "@/types";

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
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="mb-3 mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <ImageIcon className="h-7 w-7 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {isDragActive
              ? "Drop images here"
              : "Add photos to your website"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max 5MB per image • JPEG, PNG, GIF, WEBP
          </p>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-medium text-gray-500 mb-2">Uploaded images</div>
          <div className="flex flex-wrap gap-3">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white"
                style={{ width: "80px", height: "80px" }}
              >
                <img
                  src={image.url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(index);
                    }}
                    className="bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
