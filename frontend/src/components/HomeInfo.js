import React, { useState, useEffect } from 'react';
import './../css/HomeInfo.css';

function HomeInfo() {
  const [message, setMessage] = useState('');
  const [messageTwo, setMessageTwo] = useState('');
  const [workouts, setWorkouts] = useState([]);

  const userID = JSON.parse(localStorage.getItem('user_data'));
  let storage = require('../tokenStorage.js');
  let jwtToken = storage.retrieveToken();

  const loginName = userID.name;
  const ageVal = userID.age;
  const heightVal = userID.height;
  const weightVal = userID.weight;

  useEffect(() => {
    async function fetchData() {
      try {
        // import buildPath
        const bp = require('./Path.js');

        const inPayload = {
          login: userID.login,
          jwtToken: jwtToken,
        };

        const jsonPayload = JSON.stringify(inPayload);

        // Make API call
        const response = await fetch(bp.buildPath('api/getWorkout'), {
          method: 'POST',
          body: jsonPayload,
          headers: { 'Content-Type': 'application/json' },
        });

        // parse the outgoing payload from api
        // contains workout array and refreshedToken
        const res = JSON.parse(await response.text());

        if (!response.ok) {
          console.log(response);
        }

        const storage = require('../tokenStorage.js');
        storage.storeToken(res.refreshedToken);

        // set the workouts array
        setWorkouts(res.workouts);
      } catch (e) {
        alert(e.toString());
      }
    }
    fetchData();
  }, [userID.login, jwtToken]);

  const handleExerciseClick = (exerciseName) => {

    if(exerciseName === ''){
      setMessage('');
      setMessageTwo('');
      return;
    }

    let maxWeight = 0;
    for (let workout of workouts) {
      if (workout.public !== userID.login) continue;
      for (let exercise of workout.exercises) {
        if (
          exercise.Name.replaceAll(' ', '').toLowerCase() ===
          exerciseName.replaceAll(' ', '').toLowerCase()
        ) {
          for (let set of exercise.Sets) {
            if (set.weight > maxWeight) {
              maxWeight = set.weight;
            }
          }
        }
      }
    } 

    setMessage(`Max weight for ${exerciseName}:`);
    setMessageTwo(`${maxWeight} lbs`);
  };

  const exerciseNames = workouts.reduce((acc, workout) => {
    if (workout.public !== userID.login) return acc;
    for (let exercise of workout.exercises) {
      const name = exercise.Name;
      if (!acc.includes(name)) {
        acc.push(name);
      }
    }
    return acc;
  }, []);

  return (
    <div id="homeInfoDiv">
      <h1>Welcome Back,</h1>
      <h1>{loginName}!</h1>
      <h8 id="personalInfo">Age: {ageVal}</h8>
      <h8 id="personalInfo">Height: {heightVal} in</h8>
      <h8 id="personalInfo">Weight: {weightVal} lbs</h8>
      <h1 id="personalBest">View a Personal Best:</h1>
      <select
        id="exerciseQuery"
        onChange={(e) => handleExerciseClick(e.target.value)}
      >
        <option value="">--Please choose an exercise--</option>
        {exerciseNames.map((exerciseName) => (
          <option key={exerciseName} value={exerciseName}>
            {exerciseName}
          </option>
        ))}
      </select>
      <h1 id="personalBest">{message}</h1>
      <h1 id="personalBest">{messageTwo}</h1>
    </div>
  );
}

export default HomeInfo;