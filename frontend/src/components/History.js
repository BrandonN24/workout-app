import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function History() {
  const [date, setDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState(null);

  const userID = JSON.parse(localStorage.getItem("user_data"));

  const handleDateChange = async (date) => {
    setDate(date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '/');
    const response = await fetchWorkouts(formattedDate);
    if (response.ok) {
      setWorkouts(response.data.workouts);
      setError(null);
    } else {
      setError(response.data.error);
    }
  };

  const fetchWorkouts = async (date) => {
    try {
      console.log('date is',date,'login is', 'DerekA');

      var obj = {login:'DerekA',date: date};
      var js = JSON.stringify(obj);

      var bp = require('./Path.js');
      const response = await fetch(bp.buildPath('api/workoutByDate'),
          {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

      const data = await response.json();
      console.log(data);
      return {ok: response.ok, data};
    } catch (error) {
      setError('Unable to fetch workouts');
      return {ok: false, data: {error: 'Unable to fetch workouts'}};
    }
  };

  return (
    <div>
      <h1>Workout Calendar</h1>
      <Calendar
        onChange={handleDateChange}
        value={date}
      />
      {error && <div>{error}</div>}
      {workouts.length > 0 && (
        <div>
          <h2>Workouts on {date.toLocaleDateString()}</h2>
          <ul>
            {workouts.map(workout => (
              <li key={workout._id}>
                {workout.exercise} - {workout.weight} lbs x {workout.reps}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default History;