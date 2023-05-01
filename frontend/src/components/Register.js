import React, {useState} from 'react';
import './../css/Register.css';


function Register()
{
    const [message, setMessage] = useState('');

    const [registerLogin, setRegisterLogin] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword , setConfirmPassword] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');



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
                setMessage(`${key} is empty!`);
                return;
            }
        }

        if(obj.password !== obj.confirmPassword)
        {
            setMessage('Passwords do not match!');
            return;
        }

        var passwordRegex = /^.{5,}$/; 
        if (!passwordRegex.test(obj.password)) {
          setMessage('Password must be at least 5 characters long');
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

                setMessage('');
                window.location.href = '/';
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    };



    return (
        <div id="registerContainer">
        <div id="registerDiv">
            <form onSubmit={doRegister}>
            <h2 id="registerTitle">Create Account</h2><span id="registerSpacing"/>
            <input type="text" id="registerName" placeholder="Name" ref={(c) => setRegisterName(c)} /><span id="regBetwFldSpac" />
            <input type="text" id="registerEmail" placeholder="Email" ref={(c) => setRegisterEmail(c)} /><span id="regBetwFldSpac" />
            <input type="text" id="registerLogin" placeholder="Username" ref={(c) => setRegisterLogin(c)} /><span id="regBetwFldSpac" />
            <input type="password" id="registerPassword" placeholder="Password" ref={(c) => setRegisterPassword(c)} /><span id="regBetwFldSpac" />
            <input type="password" id="confirmPassword" placeholder="Confirm Password" ref={(c) => setConfirmPassword(c)} /><span id="regBetwFldSpac" />

            <input type="submit" id="registerButton" class="buttons" value = "Sign Up"
            onClick={doRegister} />
            </form>
            <span id="registerResult">{message}</span>
        </div>
        </div>
    );    

}

export default Register;