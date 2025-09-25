"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  icon,
  className = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);
  const hasValue = value && value.trim() !== "";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Icon */}
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 z-10">
          {icon}
        </div>
      )}
      
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-12 pr-12 py-3 bg-transparent border rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-left ${
          isOpen 
            ? "ring-2 ring-pink-500 border-pink-500" 
            : hasValue 
              ? "border-pink-500" 
              : "border-white/20"
        }`}
      >
        <span className={`${hasValue ? "text-white" : "text-white/40"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </button>
      
      {/* Chevron Down Icon */}
      <ChevronDown 
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 transition-transform duration-200 pointer-events-none ${
          isOpen ? "rotate-180" : ""
        }`} 
      />

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-[20px] shadow-2xl z-50 overflow-hidden">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`w-full px-4 py-3 text-left text-white hover:bg-pink-500/20 transition-colors duration-200 flex items-center justify-between ${
                  option.value === value ? "bg-pink-500/10" : ""
                }`}
              >
                <span className="font-medium">{option.label}</span>
                {option.value === value && (
                  <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
