"use client";

import { useState } from "react";
import { Edit, Play, X } from "lucide-react";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";
import { useUpdateProfileMediaMutation } from "@/feature/profile/profileApiSlice";

type ProfileMediaUploadModalProps = {
  open: boolean;
  onClose: () => void;
  profile: any;
  authUser: any;
  onUpdated: () => Promise<void> | void;
};

export function ProfileMediaUploadModal({
  open,
  onClose,
  profile,
  authUser,
  onUpdated,
}: ProfileMediaUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadMultiple, isUploading, progress, error: uploadError } = useCloudinaryUpload({
    folder: "aphrodite/profile-media",
    resourceType: "auto",
  });
  const [updateProfileMedia, { isLoading: isUpdatingMedia }] = useUpdateProfileMediaMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadMedia = async () => {
    const cloudinaryConfig = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (selectedFiles.length === 0) {
      alert("Please select at least one file to upload");
      return;
    }

    const profileId = profile?.id || null;

    if (!profileId) {
      alert("Profile ID not found. Please ensure your profile is created first.");
      return;
    }

    if (!cloudinaryConfig || !uploadPreset) {
      alert(
        "Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env.local file."
      );
      return;
    }

    try {
      const uploadResults = await uploadMultiple(selectedFiles);

      const uploadedUrls = uploadResults
        .filter(result => result.success && result.data?.secure_url)
        .map(result => result.data!.secure_url);

      if (uploadedUrls.length === 0) {
        const errors = uploadResults
          .filter(r => !r.success)
          .map(r => r.error)
          .filter(Boolean);
        alert(`Upload failed: ${errors.join(", ") || "Unknown error"}`);
        return;
      }

      const existingMediaUrls =
        profile?.media && Array.isArray(profile.media) ? profile.media : [];

      const combinedMediaUrls = [...existingMediaUrls, ...uploadedUrls];

      const updateResult = await updateProfileMedia({
        id: String(profileId),
        mediaUrls: combinedMediaUrls,
      }).unwrap();

      if (updateResult) {
        await onUpdated();
        setSelectedFiles([]);
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      alert(`Error uploading media: ${errorMessage}`);
    }
  };

  if (!open) return null;

  const isBusy = isUploading || isUpdatingMedia;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Add Media</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <Edit className="w-8 h-8 text-pink-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Upload Media</p>
                <p className="text-sm text-gray-500">Click to select images or videos</p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports: JPG, PNG, MP4, MOV, etc.
                </p>
              </div>
            </label>
          </div>

          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">Upload Error: {uploadError}</p>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Play className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      disabled={isBusy}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
            <button
              onClick={onClose}
              disabled={isBusy}
              className="px-4 sm:px-6 py-2 sm:py-3 text-pink-500 font-medium hover:text-pink-600 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadMedia}
              disabled={selectedFiles.length === 0 || isBusy}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isBusy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isUploading ? `Uploading... ${Math.round(progress)}%` : "Saving..."}
                </>
              ) : (
                `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

