"use client";

import { useState } from "react";
import { useChat } from "@/lib/hooks";
import { Send } from "lucide-react";

/**
 * Example component demonstrating how to send a message
 * 
 * This component shows how to use the sendMessage function
 * with all the parameters you specified:
 * - receiverId
 * - content
 * - type
 * - metadata
 * - attachments
 * - replyTo
 * - tempId
 */
export default function MessageSender({ receiverId }: { receiverId?: string }) {
  const { sendMessage, isSending, error } = useChat();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleSend = async () => {
    if (!content.trim()) return;

    // Generate a temporary ID for optimistic UI updates
    const tempId = `temp_${Date.now()}`;

    // Prepare the message payload exactly as specified
    const payload = {
      receiverId: receiverId || "507f1f77bcf86cd799439011", // Replace with actual receiver ID
      content: content,
      type: "text" as const,
      metadata: imageUrl
        ? {
            imageUrl: imageUrl,
          }
        : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      // replyTo: "507f1f77bcf86cd799439012", // Uncomment if replying to a message
      tempId: tempId,
    };

    // Send the message
    const response = await sendMessage(payload);

    if (response.success && response.data) {
      console.log("Message sent successfully:", response.data);
      // Clear the form
      setContent("");
      setImageUrl("");
      setAttachments([]);
    } else {
      console.error("Failed to send message:", response.error);
    }
  };

  const handleAddAttachment = () => {
    const url = prompt("Enter attachment URL:");
    if (url) {
      setAttachments([...attachments, url]);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Message Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message here..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Image URL (optional)</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Attachments</label>
          <div className="flex flex-wrap gap-2">
            {attachments.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg"
              >
                <span className="text-sm truncate max-w-xs">{url}</span>
                <button
                  onClick={() =>
                    setAttachments(attachments.filter((_, i) => i !== index))
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleAddAttachment}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Add Attachment
        </button>
        <button
          onClick={handleSend}
          disabled={isSending || !content.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}
    </div>
  );
}

