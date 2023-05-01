import React, {useState} from 'react';
import {useJwt, isExpired, decodeToken} from "react-jwt";
import './../css/AddInfo.css'

function AddInfo()
{
    const [message, setMessage] = useState('');

    const userID = JSON.parse(localStorage.getItem("user_data"));

    var addAge;
    var addHeight;
    var addWeight;

    const doAddInfo = async event =>
    {
        let storage = require('../tokenStorage.js');
        event.preventDefault();   
        const ageVal = parseInt(addAge.value);
        const heightVal = parseInt(addHeight.value);
        const weightVal = parseInt(addWeight.value);

        let token = storage.retrieveToken();

        var temp = 
        {
            login: decodeToken(token).login,
            age:ageVal,
            height:heightVal,
            weight:weightVal,
            jwtToken: token
        };

        var js = JSON.stringify(temp);

        try
        {    
            var bp = require('./Path.js');
            const response = await fetch(bp.buildPath('api/addUserInfo'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            var res = JSON.parse(await response.text());
            
            if( res.error !== '')
            {
                setMessage(res.error);
                return;
            }
            else
            {
                var user = {login:userID.login,age:ageVal,height:heightVal,weight:weightVal,id:userID.id}
                localStorage.setItem('user_data', JSON.stringify(user));
                
                setMessage('Info Added');
                window.location.href = '/HomePage';
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    };



    return (
        <div id="addInfoDiv">
            <form onSubmit={doAddInfo}>
            <span id="inner-title">PLEASE ADD SOME INFO</span><br />
            <input type="text" id="addAge" placeholder="Age" ref={(c) => addAge = c} /><br />
            <input type="text" id="addHeight" placeholder="Height(in.)" ref={(c) => addHeight = c} /><br />
            <input type="text" id="addWeight" placeholder="Weight(lbs.)" ref={(c) => addWeight = c} /><br />

            <input type="submit" id="addInfoButton" class="buttons" value = "Add"
            onClick={doAddInfo} />
            </form>
            <span id="addInfoResult">{message}</span>
        </div>
    );    

}

export default AddInfo;