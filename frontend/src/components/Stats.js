import React, {useState} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './../css/Stats.css';

function Stats()
{
  const userID = JSON.parse(localStorage.getItem("user_data"));
  let login = userID.login;
  let storage = require('../tokenStorage.js');
  let jwtToken = storage.retrieveToken();

  const [exerciseQuery, setExerciseQuery] = useState('');

  // Create the data points table
  const [table, setTable] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const doSearch = async event =>
  {
    setTable([]);
    event.preventDefault();

    let inPayload = {
      login: login,
      jwtToken: jwtToken
    }
    
    let jsonPayload = JSON.stringify(inPayload);

    try
    {
      // import buildPath
      let bp = require('./Path.js');

      // Make API call
      const response = await fetch(bp.buildPath('api/getWorkout'),
        {method: 'POST',
          body:jsonPayload,
          headers:{'Content-Type': 'application/json'}});
      
      // parse the outgoing payload from api
      // contains workout array and refreshedToken

      let res = JSON.parse(await response.text());

      if(!response.ok){
        console.log(response);
      }

      let storage = require('../tokenStorage.js');
      storage.storeToken(res.refreshedToken);

      // Create a new data points table.
      let newTable = [];

      // loop through each workout given
      for(let workout of res.workouts)
      {
        if(workout.public !== login)
          continue;
        
        let maxWeight = 0;
        let update = false;
        let effort = 0;

        // loop through each exercise in each workout
        for(let exercise of workout.exercises)
        {
          // remove all spaces and send characters to lowercase, then compare the names
          if(exercise.Name.replaceAll(" ", "").toLowerCase() === exerciseQuery.value.replaceAll(" ", "").toLowerCase())
          {
            effort = exercise.effort;
            update = true;
            // loop through each set in the exercise
            for(let set of exercise.Sets)
              {
                if(set.weight > maxWeight){
                  maxWeight = set.weight;
                }
              }
          }
        }
        
        // create new datapoint object
        let dataPoint;
        if(update)
        {
          dataPoint = {
            date: workout.dateDone,
            Weight: maxWeight,
            effort: effort
          };

          newTable.push(dataPoint);
        }
      }

      setTable(newTable);
      setSearchPerformed(true);
      return;
    }
    catch(e)
    {
      alert(e.toString());
      return;
    }
  }

   return(
    <>
      <div>
       <h1 id="title">Stats</h1>
      </div>
      
      <div id="statContainer">
      <div class="searchbar">
        <form>
            <input type="text" id = "exerciseQuery" placeholder="Exercise" ref={(c) => setExerciseQuery(c)}/>
            <input type="button" id="searchButton" onClick ={doSearch} value = 'Search'/>
            <span id="searchResult"></span>
        </form>
      </div>

      {table.length > 0 && (
      <>
        <h5>Highest Weight for Exercise by Date</h5> 
        <div className="container">
          <div className="table"> 
            <table> 
              <thead> 
                <tr><th>Date</th> <th>Highest Weight</th> <th>Effort Level (1-10)</th></tr>
              </thead> 
              <tbody>{table.map((row) => (<tr key={row.date}> <td>{row.date}</td> <td>{row.Weight} lbs</td> <td>{row.effort}</td></tr>))}</tbody> 
            </table> 
          </div>
          <div className="graph">
            <LineChart  width={600} height={350} data={table}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Weight" stroke="#3C6E71" />
            </LineChart>
          </div>
        </div>
      </>
     
    )}
    </div>
  </>
);
};

export default Stats;