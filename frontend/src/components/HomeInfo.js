import React, {useState} from 'react';

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
            <p>Age: {ageVal}</p>
            <p>Height: {heightVal}</p>
            <p>Weight: {weightVal}</p>
        </div>


        
    );    

}

export default HomeInfo;