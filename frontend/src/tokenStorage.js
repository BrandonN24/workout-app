exports.storeToken = function (tok)
{
    try
    {
        localStorage.setItem('token_data', tok.accessToken);
    }
    catch(e)
    {
        console.log(e.message);
    }
}

exports.retrieveToken = function ()
{
    let userData;
    try
    {
        userData = localStorage.getItem('token_data');
    }
    catch(e)
    {
        console.log(e.message);
    }
    return userData;
}