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
      <Button
        type="button"
        onClick={onToggleVisible}
        variant="ghost"
        className="text-gray-400 hover:text-blue-500 transition"
        size="icon"
      >
        <ImageIcon className="h-5 w-5" />
      </Button>

      {isVisible && (
        <div
          {...getRootProps()}
          className={`mt-3 border-2 border-dashed rounded-lg p-4 text-center transition cursor-pointer ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-500"
          }`}
        >
          <input {...getInputProps()} />
          <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
          <p className="text-sm text-gray-500 mt-1">
            {isDragActive
              ? "Drop the images here"
              : "Drop images here or click to browse"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max 5MB per image, JPEG, PNG, GIF, WEBP
          </p>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {uploadedImages.map((image, index) => (
            <div
              key={index}
              className="relative group w-16 h-16 rounded-md overflow-hidden border border-gray-200"
            >
              <img
                src={image.url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(index);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
