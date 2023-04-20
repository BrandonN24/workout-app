import React, { useState } from 'react';

function History() {
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const handlePrevClick = () => {
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
    setDate(prevMonth);
  };

  const handleNextClick = () => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
    setDate(nextMonth);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const monthName = date.toLocaleDateString(undefined, { month: 'long' });
  const year = date.getFullYear();

  const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, date.getMonth(), 1).getDay();

  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
   <div>
    <h1 id="title">History</h1>
    <div className='calendar'> 
      <h2>{monthName} {year}</h2>
      <div>
        <button onClick={handlePrevClick}>Prev</button>
        <button onClick={handleNextClick}>Next</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>
          {Array(Math.ceil((daysInMonth + firstDayOfMonth) / 7)).fill().map((_, weekIndex) => (
            <tr key={weekIndex}>
              {Array(7).fill().map((_, dayIndex) => {
                const dayNumber = (weekIndex * 7) + dayIndex + 1 - firstDayOfMonth;
                return (
                  <td key={dayIndex}>
                    {dayNumber > 0 && dayNumber <= daysInMonth && (
                      <div>
                        <button onClick={() => handleDateClick(dayNumber)}>{dayNumber}</button>
                        {selectedDate === dayNumber && (
                          <div>
                            Information for {monthName} {dayNumber}, {year}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div> 
  );
}

export default History;


