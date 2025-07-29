import React, { useState, useRef, useEffect } from 'react';

const DatePicker = ({ selectedDate, onDateChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef(null);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday

  const date = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(date.getMonth());
  const [currentYear, setCurrentYear] = useState(date.getFullYear());

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear(currentYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear(currentYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };

  const handleDayClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateChange(newDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
    setIsOpen(false);
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Fill leading empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400"></div>);
    }

    // Fill days of the month
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate && new Date(selectedDate).toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm
            ${isSelected ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-200'}
            ${isToday && !isSelected ? 'border border-blue-500' : ''}
          `}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={datePickerRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={selectedDate || ''}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition cursor-pointer"
      />

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="font-semibold text-gray-800">{monthNames[currentMonth]} {currentYear}</span>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
            ))}
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;