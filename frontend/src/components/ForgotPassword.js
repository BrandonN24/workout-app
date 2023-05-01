import React, {useState} from 'react';
import './../css/ForgotPassword.css'

function ForgotPassword()
{
    const [message, setMessage] = useState('');

    const [email, setEmail]  = useState('');; // this holds the email entered by the user
    const [login, setLogin]  = useState('');; // this holds the login entered by the user
    const [vCodeString, setVCode] = useState(''); // this holds the verification code entered by the user

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
                localStorage.setItem('user_data', login.value);
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

        if(email === "" || email === undefined)
            return;

        // create the JSON payload
        let temp =
        {
            email: email.value,
            vCode: vCodeString.value
        };

        let js = JSON.stringify(temp);

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
        <div class="forgotPasswordContainer">
            <div class="forgotPasswordInfo">
                <form>
                    <span>Enter your login here:</span>
                    <input type="text" id="forgotLoginBox" placeholder="Login" ref={(capture) => setLogin(capture)} /><br /><br/>
                    <span>Enter your email here:</span>
                    <input type="text" id="forgotEmailBox" placeholder="Email" ref={(capture) => setEmail(capture)} />
                </form>
            </div>
            <div class="ForgotPasswordEmailDiv">
                <form onSubmit={sendEmail}>
                    <span id="inner-title">Click to send verification code</span><br />
                    <input type="button" id="sendCodeButton" class="buttons" value = "Send Code"
                    onClick={sendEmail} />
                </form>
                <br/>
                <form onSubmit={verifyPasswordChange}>
                    <span id="inner-title">Enter your verification code:</span><br />
                    <input type="text" id="verifyCode" placeholder="Verification Code" ref={(c) => setVCode(c)}/><br />
                    <input type="submit" id="verifyPasswordChangeButton" class="buttons" value = "Verify" onClick={verifyPasswordChange} />
                    <br/><br/>
                    <span id="VerifyResult">{message}</span>
                </form>
            </div>
        </div>
            
        </>
    );    

}

export default ForgotPassword;