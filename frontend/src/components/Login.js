import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useJwt, isExpired, decodeToken} from "react-jwt";

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
                localStorage.setItem('user_data', JSON.stringify(userInfo));

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
        <span id="loginResult">{message}</span><br />
     
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
