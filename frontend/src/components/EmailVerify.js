import React, {useState} from 'react';
import './../css/EmailVerify.css'

function VerifyEmail()
{
    const [message, setMessage] = useState('');

    // Get object containing userData
    const userID = JSON.parse(localStorage.getItem("user_data"));

    // Create variable to hold verification code entered from user.
    let vCode;

    // Function to send email containing code to user's email.
    const sendEmail = async event =>
    {
        // Get token storage functions.
        let storage = require('../tokenStorage.js');
        event.preventDefault();   

        // Create json incoming payload
        let temp = 
        {
            email: userID.email,
            jwtToken: storage.retrieveToken()
        };

        // stringify the payload.
        let js = JSON.stringify(temp);

        try
        {   
            // get the api buildpath
            var bp = require('./Path.js');
            
            // make the call to the sendEmail API
            const response = await fetch(bp.buildPath('api/sendEmail'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            // parse the response from the API
            var res = JSON.parse(await response.text());
            
            if( res.error !== '')
            {
                setMessage(res.error);
                return;
            }
            else
            {
                setMessage('Email Sent');
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    };

    const verifyEmail = async event => 
    {
        let storage = require('../tokenStorage.js');
        event.preventDefault();

        // store the verificationCode in a constant variable.
        const vCodeString = vCode.value;

        // create the JSON payload
        let temp =
        {
            email: userID.email,
            verificationCode: vCodeString,
            jwtToken: storage.retrieveToken()
        };

        let js = JSON.stringify(temp);

        try
        {    
            var bp = require('./Path.js');

            // Make the verifyEmail API call
            const response = await fetch(bp.buildPath('api/verifyEmail'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            var res = JSON.parse(await response.text());

            if( res.error !== undefined)
            {
                setMessage(res.error);
                return;
            }
            else
            {
                setMessage('Email verified');
                window.location.href = '/AddInfoPage';
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    

    }




    return (
        <div id="EmailVerifyDiv">
            <form onSubmit={sendEmail}>
            <span id="inner-title">A verification code has been sent to your email!</span><br />
            <input type="button" id="sendEmailButton" class="buttons" value = "Resend Email"
            onClick={sendEmail} />
            </form>

            <form onSubmit={verifyEmail}>
            <span id="inner-title">Enter your verification code here</span><br />
            <input type="text" id="verifyCode" placeholder="Verification Code" ref={(c) => vCode = c} /><br />
            <input type="submit" id="verifyEmailButton" class="buttons" value = "Verify" onClick={verifyEmail} />
            </form>
            <span id="VerifyResult">{message}</span>
        </div>
    );    

}

export default VerifyEmail;