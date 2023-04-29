import React, {useState} from 'react';
import { Line } from 'react-chartjs-2';

function Stats()
{
  const userID = JSON.parse(localStorage.getItem("user_data"));
  let login = userID.login;
  let jwtToken = userID.jwtToken.accessToken;

  let exerciseQuery;

  // Create the data points table
  const [table, setTable] = useState([]);

  const doSearch = async event =>
  {
    setTable([]);
    event.preventDefault();

    let exerciseQuery = document.getElementById('exerciseQuery');

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

        // loop through each exercise in each workout
        for(let exercise of workout.exercises)
        {
          // remove all spaces and send characters to lowercase, then compare the names
          if(exercise.Name.replaceAll(" ", "").toLowerCase() === exerciseQuery.value.replaceAll(" ", "").toLowerCase())
          {
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
            maxWeight: maxWeight
          };

          newTable.push(dataPoint);
        }
      }

      setTable(newTable);
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
      
      <div className="searchbar">
        <form>
            <input type="text" id = "exerciseQuery" placeholder="search" ref={(c) => exerciseQuery = c}/>
            <input type="button" id="searchButton" onClick ={doSearch} value = 'Search'/>
            <span id="searchResult"></span>
        </form>
      </div>

      <div> 
        <h2>Highest Weight for Exercise by Date
        </h2> 
        <table> 
          <thead> 
            <tr><th>Date</th> <th>Highest Weight</th></tr> 
          </thead> 
          <tbody>{table.map((row) => (<tr key={row.date}> <td>{row.date}</td> <td>{row.maxWeight}</td></tr>))}</tbody> 
        </table> 
      </div>
    </>
    
   );
};

export default Stats;