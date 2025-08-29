"use client";

import { useState } from "react";
import BasicDetailsModal from "./BasicDetailsModal";

export default function ModalDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleContinue = (data: any) => {
    setFormData(data);
    setIsModalOpen(false);
    console.log("Form submitted:", data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4 font-urbanist">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Basic Details Modal Demo</h1>
        
        <button
          onClick={handleOpenModal}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium text-lg"
        >
          Open Basic Details Modal
        </button>

        {formData && (
          <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Submitted Data:</h2>
            <pre className="text-white/80 text-sm text-left">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        )}

        <BasicDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
}
