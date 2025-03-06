// components/content/ThumbnailUploader.tsx
import React, { ChangeEvent } from "react";
import Image from "next/image";

interface ThumbnailUploaderProps {
  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;
  thumbnailPreview: string;
  setThumbnailPreview: (preview: string) => void;
  validationError?: string;
}

const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({
  thumbnail,
  setThumbnail,
  thumbnailPreview,
  setThumbnailPreview,
  validationError,
}) => {
  // Handle file upload for thumbnail
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label
        htmlFor="thumbnail"
        className="block text-sm font-medium text-gray-700"
      >
        Thumbnail (opsional)
      </label>
      <div className="mt-1 flex items-center">
        <div className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {thumbnailPreview ? (
              <div className="mb-3">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  width={128}
                  height={128}
                  className="mx-auto h-32 w-auto object-cover"
                  unoptimized={true}
                />
              </div>
            ) : (
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="thumbnail"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload gambar</span>
                <input
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleThumbnailChange}
                />
              </label>
              <p className="pl-1">atau seret dan lepas</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF sampai 2MB
            </p>
          </div>
        </div>
      </div>
      {validationError && (
        <p className="mt-2 text-sm text-red-600">
          {validationError}
        </p>
      )}
    </div>
  );
};

export default ThumbnailUploader;