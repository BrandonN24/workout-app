import React, {useState} from 'react';
import './../css/NewPassword.css';

function NewPassword() 
{
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const changePassword = async event =>
    {
        event.preventDefault();

        if(newPassword.value !== confirmPassword.value)
        {
            setMessage('Passwords do not match!');
            return;
        }
        else{
            setMessage('');
        }

        let login = localStorage.getItem('user_data');

        let changePasswordPayload =
        {
            login: login,
            password: newPassword.value
        }

        console.log(changePasswordPayload);

        let changePasswordPayloadJS = JSON.stringify(changePasswordPayload);

        try
        {
            let bp = require('./Path.js');

            const changePasswordResponse = await fetch(bp.buildPath('api/changePassword'),
                {method:'POST',body:changePasswordPayloadJS,headers:{'Content-Type': 'application/json'}});

            // parse the response from the api into JSON
            let changePasswordRes = JSON.parse(await changePasswordResponse.text());

            if(changePasswordRes.error !== '')
            {
                setMessage(changePasswordRes.error);
                return;
            }
            else{
                setMessage("Password changed!");
                window.location.href = '/';
            }
        }
        catch(e)
        {
            alert(e.toString());
        }
    }

    return (
        <>
            <div class="newPasswordContainer">
                <div class="newPasswordDiv">
                    <span>New Password:</span>
                    <br/>
                    <input type="password" id="newPassword" placeholder="New Password" ref={(capture) => setNewPassword(capture)} />
                </div>
                <div class="confirmPasswordDiv">
                    <span>Confirm Password:</span>
                    <br/>
                    <input type="password" id="confirmNewPassword" placeholder="Confirm Password" ref={(capture) => setConfirmPassword(capture)} />
                </div>
                <div class="changeButtonMessage">
                    <form onSubmit={changePassword}>
                        <input type="submit" id="changePasswordButton" class="buttons" value = "Change Password"
                        onClick={changePassword}/>
                    </form>
                    <span id="forgotPasswordResult">{message}</span>
                </div>
            </div>
            
        </>
    )
}

export default NewPassword;