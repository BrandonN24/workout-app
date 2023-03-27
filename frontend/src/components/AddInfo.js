import React, {useState} from 'react';

function AddInfo()
{
    const [message, setMessage] = useState('');

    var userID = JSON.parse(localStorage.getItem("user_data"));
    var addAge;
    var addHeight;
    var addWeight;

    const doAddInfo = async event =>
    {
        event.preventDefault();

        addAge = parseFloat(addAge);
        addHeight = parseFloat(addHeight);
        addWeight = parseFloat(addWeight);    

        var temp = 
        {
            login:userID.login,
            age:addAge,
            height:addHeight,
            weight:addWeight
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
                var user = {login:res.login,age:res.age,height:res.height,weight:res.weight}
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