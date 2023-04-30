import React, {useState} from 'react';
import './../css/ForgotPassword.css'

function ForgotPassword()
{
    const [message, setMessage] = useState('');

    let email; // this holds the email entered by the user
    let login; // this holds the login entered by the user

    // Create variable to hold verification code entered from user.
    let vCode;

    // Function to send email containing code to user's email.
    const sendEmail = async event =>
    {
        event.preventDefault();
        
        if(email === "" || email === undefined || login === "" || login === undefined)
            return;

        // create json incoming payload to findUser API
        let findUserPayload =
        {
            login: login.value,
            email: email.value
        };

        // stringify the payload.
        let findUserPayloadJson = JSON.stringify(findUserPayload);

        let findUserRes;

        try
        {
            let bp = require('./Path.js');

            const findUserResponse = await fetch(bp.buildPath('api/findUser'),
                {method:'POST',body:findUserPayloadJson,headers:{'Content-Type': 'application/json'}});

            // parse the response from the API
            findUserRes = JSON.parse(await findUserResponse.text());

            if(findUserRes.error !== '')
            {
                setMessage(findUserRes.error);
                return;
            }
            else{
                setMessage("User found!");
            }
        }
        catch(e){
            alert(e.toString());
        }

        if(findUserRes.exists)
        {
                // Create json incoming payload
            let sendEmailPayload = 
            {
                email: email.value
            };

            // stringify the payload.
            let sendEmailPayloadJson = JSON.stringify(sendEmailPayload);
            console.log(sendEmailPayloadJson);

            try
            {   
                // get the api buildpath
                var bp = require('./Path.js');
                
                // make the call to the sendEmail API
                const sendEmailResponse = await fetch(bp.buildPath('api/sendEmailTokenless'),
                    {method:'POST',body:sendEmailPayloadJson,headers:{'Content-Type': 'application/json'}});
                
                if( sendEmailResponse.status !== 200)
                {
                    setMessage(sendEmailResponse.status);
                    return;
                }
                else
                {
                    setMessage('Email Sent!');
                }

            }
            catch(e)
            {
                alert(e.toString());
                return;
            }
        }
        else
        {
            return;
        }

            
    };

    const verifyPasswordChange = async event => 
    {
        event.preventDefault();

        // store the verificationCode in a constant variable.
        const vCodeString = vCode.value;

        if(email === "" || email === undefined)
            return;

        // create the JSON payload
        let temp =
        {
            email: email.value,
            vCode: vCodeString
        };

        let js = JSON.stringify(temp);
        console.log(js);

        try
        {    
            var bp = require('./Path.js');

            // Make the verifyEmail API call
            const response = await fetch(bp.buildPath('api/verifyPasswordChange'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            var res = JSON.parse(await response.text());

            if( res.error !== '')
            {
                setMessage(res.error);
                return;
            }
            else
            {
                setMessage('Password Change verified');
                window.location.href = '/NewPasswordPage';
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    }

    return (
        <>
            <div id="forgotPasswordInfo">
                <form>
                    <input type="text" id="forgotLoginBox" placeholder="Login" ref={(capture) => login = capture} /><br />
                    <input type="text" id="forgotEmailBox" placeholder="Email" ref={(capture) => email = capture} /><br />
                </form>
            </div>
            <div id="ForgotPasswordEmailDiv">
                <form onSubmit={sendEmail}>
                    <span id="inner-title">Click to get verification code</span><br />
                    <input type="button" id="sendEmailButton" class="buttons" value = "Send Code"
                    onClick={sendEmail} />
                    <span id="VerifyResult">{message}</span>
                </form>

                <form onSubmit={verifyPasswordChange}>
                    <span id="inner-title">Enter your verification code here</span><br />
                    <input type="text" id="verifyCode" placeholder="Verification Code" ref={(c) => vCode = c}/><br />
                    <input type="submit" id="verifyPasswordChangeButton" class="buttons" value = "Verify" onClick={verifyPasswordChange} />
                </form>

                
            </div>
        </>
    );    

}

export default ForgotPassword;