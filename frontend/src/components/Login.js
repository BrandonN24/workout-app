import React, {useState} from 'react';
import {Link} from 'react-router-dom';

function Login()
{

    var loginName;
    var loginPassword;

    const [message,setMessage] = useState('');

    const doLogin = async event => 
    {
        event.preventDefault();

        var obj = {login:loginName.value,password:loginPassword.value};
        var js = JSON.stringify(obj);

        try
        {    
            var bp = require('./Path.js');
            const response = await fetch(bp.buildPath('api/login'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            var res = JSON.parse(await response.text());

            if( res.id <= 0 )
            {
                setMessage('User/Password combination incorrect');
            }
            else
            {
                var user = {name:res.name,id:res.id}
                localStorage.setItem('user_data', JSON.stringify(user));

                setMessage('');
                window.location.href = '/HomePage';
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    };


    return(
      <div id="loginDiv">
        <form onSubmit={doLogin}>
        <span id="inner-title">PLEASE LOG IN</span><br />
        <input type="text" id="loginName" placeholder="Username" ref={(c) => loginName = c} /><br />
        <input type="password" id="loginPassword" placeholder="Password" ref={(c) => loginPassword = c} /><br />

        <input type="submit" id="loginButton" class="buttons" value = "Do It"
          onClick={doLogin} />
        </form>
        <span id="loginResult">{message}</span>
     
        <span className = "link register">
            <span style={{fontSize:15}}>
                No account? Register
            </span>
            <Link to='/RegisterPage'>
            <span style={{fontSize:15}}>
                &nbsp;here.
            </span>
            </Link>
        </span>
     </div>
    );
};

export default Login;
