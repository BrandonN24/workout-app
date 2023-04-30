import React, {useState} from 'react';
import './../css/HomeInfo.css';

function HomeInfo()
{
    const [message, setMessage] = useState('');

    const userID = JSON.parse(localStorage.getItem("user_data"));

        var loginName = userID.name;
        var ageVal = userID.age;
        var heightVal = userID.height;
        var weightVal = userID.weight;


    return (
        <div id="homeInfoDiv">
            <h1>Welcome Back {loginName}!</h1>
            <h8 id="personalInfo">Age: {ageVal}</h8>
            <h8 id="personalInfo">Height: {heightVal} in</h8>
            <h8 id="personalInfo">Weight: {weightVal} lbs</h8>
        </div>


        
    );    

}

export default HomeInfo;