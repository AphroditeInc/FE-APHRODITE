"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select Date",
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setFullYear(year);
      return newMonth;
    });
    setShowYearPicker(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(monthIndex);
      return newMonth;
    });
    setShowMonthPicker(false);
  };

  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      {/* Calendar Icon */}
      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 z-10" />
      
      {/* Date Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-12 pr-12 py-3 bg-transparent border rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-left ${
          isOpen 
            ? "ring-2 ring-pink-500 border-pink-500" 
            : selectedDate 
              ? "border-pink-500" 
              : "border-white/20"
        }`}
      >
        <span className={`${selectedDate ? "text-white" : "text-white/40"}`}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
      </button>
      
      {/* Chevron Down Icon */}
      <ChevronDown 
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 transition-transform duration-200 pointer-events-none ${
          isOpen ? "rotate-180" : ""
        }`} 
      />

      {/* Date Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-[20px] shadow-2xl z-50 overflow-hidden max-h-80">
          <div className="p-3 max-h-80 overflow-y-auto">
            {/* Header with Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="px-3 py-1 hover:bg-white/10 rounded-lg transition-colors text-white font-semibold text-lg"
                >
                  {months[currentMonth.getMonth()]}
                </button>
                <button
                  type="button"
                  onClick={() => setShowYearPicker(!showYearPicker)}
                  className="px-3 py-1 hover:bg-white/10 rounded-lg transition-colors text-white font-semibold text-lg"
                >
                  {currentMonth.getFullYear()}
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Year Picker */}
            {showYearPicker && (
              <div className="mb-3 p-2 bg-white/5 rounded-lg border border-white/10">
                <div className="text-white/60 text-xs mb-2">Select Year</div>
                <div className="grid grid-cols-5 gap-1 max-h-24 overflow-y-auto">
                  {getYearRange().map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`px-1 py-1 text-xs rounded transition-colors ${
                        year === currentMonth.getFullYear()
                          ? 'bg-pink-500 text-white'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Month Picker */}
            {showMonthPicker && (
              <div className="mb-3 p-2 bg-white/5 rounded-lg border border-white/10">
                <div className="text-white/60 text-xs mb-2">Select Month</div>
                <div className="grid grid-cols-4 gap-1">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`px-1 py-1 text-xs rounded transition-colors ${
                        index === currentMonth.getMonth()
                          ? 'bg-pink-500 text-white'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {days.map((day) => (
                <div key={day} className="text-center text-white/60 text-xs font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((date, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => date && handleDateSelect(date)}
                  disabled={!date}
                  className={`
                    aspect-square flex items-center justify-center text-xs font-medium rounded transition-colors
                    ${!date ? 'invisible' : ''}
                    ${isSelected(date) ? 'bg-pink-500 text-white' : ''}
                    ${!isSelected(date) && isToday(date) ? 'bg-pink-500/20 text-pink-400' : ''}
                    ${!isSelected(date) && !isToday(date) ? 'text-white hover:bg-white/10' : ''}
                  `}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>

            {/* Today Button */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  onChange(today.toISOString().split('T')[0]);
                  setIsOpen(false);
                }}
                className="w-full py-1.5 px-3 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors font-medium text-sm"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
