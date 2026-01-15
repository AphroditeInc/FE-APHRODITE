"use client";

import { X } from "lucide-react";

type MediaModalContent =
  | {
      type: "video" | "image";
      src: string;
      duration?: string;
    }
  | null;

type MediaModalProps = {
  content: MediaModalContent;
  onClose: () => void;
};

export function MediaModal({ content, onClose }: MediaModalProps) {
  if (!content) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-black rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {content.type === "video" ? (
          <div className="relative">
            <video
              src={content.src}
              controls
              className="w-full h-auto max-h-[80vh]"
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
            {content.duration && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                {content.duration}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <img
              src={content.src}
              alt="Full size image"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}

