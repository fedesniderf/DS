import React, { useState } from 'react';

const CalendarView = ({ routines, onSelectRoutine }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay: firstDay === 0 ? 6 : firstDay - 1, daysInMonth }; // Adjust to make Monday 0
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null); // Empty days before the first day of the month
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getRoutineForDay = (day) => {
    // This is a simplified example. In a real app, you'd match routines by date.
    // For now, we'll just assign a routine if available.
    if (routines.length > 0 && day % 2 === 0) { // Example: assign routine to even days
      return routines[day % routines.length];
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-4">
        <div>Lun</div>
        <div>Mar</div>
        <div>Mié</div>
        <div>Jue</div>
        <div>Vie</div>
        <div>Sáb</div>
        <div>Dom</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const routineForDay = day ? getRoutineForDay(day) : null;
          return (
            <div
              key={index}
              className={`p-2 rounded-lg flex flex-col items-center justify-center h-24 ${
                day ? 'bg-gray-50 border border-gray-200' : 'bg-gray-100'
              } ${routineForDay ? 'bg-black text-white border-black cursor-pointer hover:bg-gray-800' : ''}`} // Botón negro
              onClick={() => routineForDay && onSelectRoutine(routineForDay)}
            >
              <span className="text-lg font-bold text-gray-800">{day}</span>
              {routineForDay && (
                <span className="text-xs text-white mt-1 text-center leading-tight">
                  {routineForDay.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;