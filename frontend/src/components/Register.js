import React, {useState} from 'react';

function Register()
{
    const [message, setMessage] = useState('');

    var registerLogin;
    var registerPassword;
    var confirmPassword;
    var registerName;
    var registerEmail;

    const doRegister = async event =>
    {
        event.preventDefault();

        var obj = 
        {
            login:registerLogin.value,
            password:registerPassword.value,
            confirmPassword:confirmPassword.value,
            name: registerName.value,
            email: registerEmail.value
        };

        for(const [key, value] of Object.entries(obj)) 
        {
            obj[key] = value.trim();

            if (obj[key] === "") {
                setMessage(`${key} is empty`);
                return;
            }
        }

        if(obj.password !== obj.confirmPassword)
        {
            setMessage('Please confirm password.');
            return;
        }

        delete obj.confirmPassword;
        var js = JSON.stringify(obj);

        try
        {    
            var bp = require('./Path.js');
            const response = await fetch(bp.buildPath('api/register'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            var res = JSON.parse(await response.text());

            if( res.error !== '')
            {
                setMessage(res.error);
                return;
            }
            else
            {
                var user = {name:res.name,id:res.id}
                localStorage.setItem('user_data', JSON.stringify(user));

                setMessage('Welcome');
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
        <div id="registerDiv">
            <form onSubmit={doRegister}>
            <span id="inner-title">PLEASE Register</span><br />
            <input type="text" id="registerName" placeholder="Name" ref={(c) => registerName = c} /><br />
            <input type="text" id="registerEmail" placeholder="Email" ref={(c) => registerEmail = c} /><br />
            <input type="text" id="registerLogin" placeholder="Username" ref={(c) => registerLogin = c} /><br />
            <input type="password" id="registerPassword" placeholder="Password" ref={(c) => registerPassword = c} /><br />
            <input type="password" id="confirmPassword" placeholder="Confirm Password" ref={(c) => confirmPassword = c} /><br />

            <input type="submit" id="registerButton" class="buttons" value = "Sign Up"
            onClick={doRegister} />
            </form>
            <span id="registerResult">{message}</span>
        </div>
    );    

}

export default Register;