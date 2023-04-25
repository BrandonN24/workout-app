import React, {useState} from 'react';

function VerifyEmail()
{
    const [message, setMessage] = useState('');

    const userID = JSON.parse(localStorage.getItem("user_data"));
    let vCode;

    const sendEmail = async event =>
    {
        let storage = require('../tokenStorage.js');
        event.preventDefault();   

        let temp = 
        {
            email: userID.email,
            jwtToken: storage.retrieveToken()
        };

        let js = JSON.stringify(temp);

        try
        {    
            var bp = require('./Path.js');
            const response = await fetch(bp.buildPath('api/sendEmail'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

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

        const vCodeString = vCode.value;

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