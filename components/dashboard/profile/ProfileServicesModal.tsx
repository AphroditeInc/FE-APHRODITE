"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUpdateProfileMutation } from "@/feature/profile/profileApiSlice";

type ProfileServicesModalProps = {
  open: boolean;
  onClose: () => void;
  profileId: string;
  existingServices: any[] | undefined;
  onUpdated: () => Promise<void> | void;
};

const availableServices = [
  "Domination (Receiving)",
  "Lap Dance",
  "Belly Dance",
  "Tango",
  "Pole Fitness",
  "Being Filmed",
  "Salsa",
  "Bachata",
  "Girlfriend Experience",
  "Sex Toys",
  "Role Play & Fantasies",
  "Erotic Massage",
  "Erotic Spanking",
  "MMF 3somes",
  "Dinner Dates",
  "French Kissing",
  "Smoking Fetish",
  "Missionary",
  "69",
  "Doggy",
];

export function ProfileServicesModal({
  open,
  onClose,
  profileId,
  existingServices,
  onUpdated,
}: ProfileServicesModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState("");

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  useEffect(() => {
    if (!open) return;

    if (existingServices && Array.isArray(existingServices)) {
      const existingServiceNames = existingServices
        .map(service =>
          typeof service === "string" ? service : service.name || service.id || ""
        )
        .filter((s): s is string => s !== "");

      const availableServiceNames = existingServiceNames.filter(name =>
        availableServices.includes(name)
      );
      const customServiceNames = existingServiceNames.filter(
        name => !availableServices.includes(name)
      );

      setSelectedServices(availableServiceNames);
      setCustomServices(customServiceNames);
    } else {
      setSelectedServices([]);
      setCustomServices([]);
    }
    setCustomServiceInput("");
  }, [open, existingServices]);

  const handleClose = () => {
    onClose();
  };

  const handleToggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleAddCustomService = () => {
    if (customServiceInput.trim() && !customServices.includes(customServiceInput.trim())) {
      setCustomServices(prev => [...prev, customServiceInput.trim()]);
      setCustomServiceInput("");
    }
  };

  const handleRemoveCustomService = (service: string) => {
    setCustomServices(prev => prev.filter(s => s !== service));
  };

  const handleSubmit = async () => {
    if (!profileId) {
      alert("Profile ID not found. Please ensure your profile is created first.");
      return;
    }

    const allServices = [...selectedServices, ...customServices];

    if (allServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    try {
      // Send the new list directly. The API (or backend) should handle replacement.
      // Based on standard "Edit" modal behavior, we expect the sent list to become the new state.
      const result = await updateProfile({
        id: String(profileId),
        data: {
          services: allServices,
        },
      }).unwrap();

      if (result) {
        await onUpdated();
        handleClose();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Unknown error occurred during service update.";
      alert(`Error updating services: ${errorMessage}`);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F1B2C] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Services</h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {availableServices.map(service => (
              <button
                key={service}
                onClick={() => handleToggleService(service)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedServices.includes(service)
                    ? "bg-pink-500 text-white border-2 border-pink-500"
                    : "bg-transparent text-white border-2 border-white/30 hover:border-white/50"
                  }`}
              >
                {service}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Others</h3>

            {customServices.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customServices.map((service, index) => (
                  <div
                    key={`${service}-${index}`}
                    className="flex items-center gap-2 px-3 py-1 bg-pink-500 text-white rounded-full text-sm"
                  >
                    <span>{service}</span>
                    <button
                      onClick={() => handleRemoveCustomService(service)}
                      className="hover:text-pink-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={customServiceInput}
                onChange={e => setCustomServiceInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomService();
                  }
                }}
                placeholder="Type here"
                className="flex-1 px-4 py-3 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-pink-500 transition-colors"
              />
              <button
                onClick={handleAddCustomService}
                disabled={!customServiceInput.trim()}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 mt-6 border-t border-white/10">
          <button
            onClick={handleClose}
            className="px-4 sm:px-6 py-2 sm:py-3 text-pink-500 font-medium hover:text-pink-400 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdatingProfile}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm sm:text-base disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isUpdatingProfile ? "Updating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

