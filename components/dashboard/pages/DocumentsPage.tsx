"use client";

import { FileText, Upload, Download, Eye, Trash2 } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Documents</h1>
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      <div className="grid gap-6">
        {/* Document Upload Area */}
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
            <Upload className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Upload New Document</h3>
            <p className="text-white/60 mb-4">Drag and drop files here or click to browse</p>
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors">
              Choose Files
            </button>
          </div>
        </div>

        {/* Document List */}
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Your Documents</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="text-white font-medium">Driver&apos;s License</p>
                  <p className="text-sm text-white/60">Uploaded 2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-white/60 hover:text-white p-2">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-white/60 hover:text-white p-2">
                  <Download className="h-4 w-4" />
                </button>
                <button className="text-red-400 hover:text-red-300 p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
