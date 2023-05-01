import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './../css/History.css';

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
      let storage = require('../tokenStorage.js');
      console.log('date is',date,'login is', userID.login);

      var obj = 
      {
        login: userID.login,
        date: date,
        jwtToken: storage.retrieveToken()
      };
      var js = JSON.stringify(obj);

      var bp = require('./Path.js');
      const response = await fetch(bp.buildPath('api/workoutByDate'),
          {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

      const data = await response.json();
      console.log(data);

      storage.storeToken(data.refreshedToken);

      return {ok: response.ok, data};
    } catch (error) {
      setError('Unable to fetch workouts');
      return {ok: false, data: {error: 'Unable to fetch workouts'}};
    }
  };

  return (
    <div className="containerH">
      <h1 id="title">Workout Calendar</h1>
      <Calendar
        onChange={handleDateChange}
        value={date}
      />
      {error && <div>{error}</div>}
      {workouts.length > 0 && (
  <div className="containerW">
    <h2>Workout on {date.toLocaleDateString()}</h2>
    <ul>
      {workouts.map(workout => (
        <li key={workout._id}>
          {workout.exercises && workout.exercises.map((exercise, index) => (
            <div className="exerciseInfo" key={index}>
              <p className="exerciseName" ><strong>Exercise Name</strong> <br></br> {exercise.Name} <br></br> Effort Level: {exercise.effort}</p>
              <ul>
                {exercise.Sets && exercise.Sets.map((set, setIndex) => (
                  <li key={setIndex}>
                    <strong>Set {setIndex + 1}:</strong><br/>
                    Reps: {set.reps}<br/>
                    Weight: {set.weight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </li>
      ))}
    </ul>
  </div>
)}
    </div>
  );
}

export default History;