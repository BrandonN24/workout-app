import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useJwt, isExpired, decodeToken} from "react-jwt";
import bootstrap from 'bootstrap';
import './../css/Login.css';

let cookieName = "";
let cookieID = [];

function saveCookie()
{
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime()+(minutes*60*1000));
    document.cookie = "name=" + cookieName + ",userID=" + cookieID + ";expires=" + date.toGMTString();
}

function Login()
{
    const [loginName, setLoginName] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [message,setMessage] = useState('');

    const doLogin = async event => 
    {
        event.preventDefault();

        var obj = 
        {
            login:loginName.value,
            password:loginPassword.value
        };
        var js = JSON.stringify(obj);

        try
        {   
            var bp = require('./Path.js');
            const response = await fetch(bp.buildPath('api/login'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            // will contain a JWT upon successful login
            var res = JSON.parse(await response.text());

            if( res.id <= 0 )
            {
                setMessage('User/Password combination incorrect');
            }
            else
            {
                //var user = {login: res.login, name:res.name, age:res.age,height:res.height,weight:res.weight, id:res.id}
                let storage = require('../tokenStorage.js');
                storage.storeToken(res);
                const decodedToken = decodeToken(res.accessToken);

                setMessage('');
                cookieName = decodedToken.name;
                cookieID = decodedToken.id;
                saveCookie();

                // prepare json payload with user objectId and jwt token
                let sendID = {id: decodedToken.id , jwtToken: storage.retrieveToken()};
                let jsIdObj = JSON.stringify(sendID);
                
                // make a call to get userInfo
                const infoRequest = await fetch(bp.buildPath('api/getUserInfo'),
                {method:'POST',body:jsIdObj,headers:{'Content-Type': 'application/json'}});

                // store JSON object from getUserInfo in userInfo variable
                let userInfo = JSON.parse(await infoRequest.text());
                userInfo.login = loginName.value;
                localStorage.setItem('user_data', JSON.stringify(userInfo));

                // If user has not been email verified, then send them to the email verification page
                if(!userInfo.validated)
                {
                    window.location.href = '/EmailVerificationPage';
                }
                // otherwise, user has been email verified
                else
                {
                    // if age is an invalid value, then send user to addInfoPage.
                    if(userInfo.age == -1)
                    {
                        window.location.href = '/AddInfoPage';    
                    }
                    else{
                        window.location.href = '/HomePage';
                    }   
                }
                 
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    };


    return(
        <div class="loginContainer">
            <div class="loginDiv">
                <form onSubmit={doLogin}>
                <input type="text" id="loginName" placeholder="Username" ref={(c) => setLoginName(c)} /><br />
                <input type="password" id="loginPassword" placeholder="Password" ref={(c) => setLoginPassword(c)} /><br />

                <input type="submit" id="loginButton" class="buttons" value = "Sign In"
                onClick={doLogin} />
                </form>
                <span id="loginResult">{message}</span>
            
                <div id = "registerPrompt">
                    <span style={{fontSize:15}}>
                        No account? Register
                    </span>
                    <Link class="registerLink"to='/RegisterPage'>
                    <span style={{fontSize:15}}>
                        here
                    </span>
                    </Link>
                </div>

                <div id="forgotPasswordPrompt">
                    <span style={{fontSize:15}}>
                        Forgot Password? Click
                    </span>
                    <Link class="forgotPasswordLink"to='/ForgotPasswordPage'>
                    <span style={{fontSize:15}}>
                        here
                    </span>
                    </Link>
                </div>

            </div>
        </div>
      
    );
};

export default Login;
