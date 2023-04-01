const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createToken = function (id, name, login, validated)
{
    return _createToken (id, name, login, validated);
}

// create a JWT token using the user's name and their objectId from the mongoDB
_createToken = function (id, name, login, validated)
{
    try
    {
        const expiration = new Date();
        const user = {userId: id, name: name, validated: validated, login: login};

        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

        // In order to expire with a value other than the default, use the following
        /*
        const access Token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '30m'} );
            // you can replace 30m with 24h or 365d
        */

        var ret = {accessToken:accessToken};
    }
    // if token creation fails, send the error message.
    catch(e)
    {
        var ret = {error: e.message};
    }
    return ret;
}

// pass a token in and see if it's expired.
exports.isExpired = function (token)
{
    var isError = jwt.verify( token, process.env.ACCESS_TOKEN_SECRET,
        (err, verifiedJwt) => 
    {
        if(err)
        {
            return true;
        }
        else
        {
            return false;
        }
    });

    return isError;
}

// refreshes the current JWT token
exports.refresh = function (token)
{
    let userData = jwt.decode(token, {complete: true});

    let id = userData.payload.id; // note: userId corresponds to the _id field in the DB
    let name = userData.payload.name;
    let validated = userData.payload.validated;
    let login = userData.payload.login;

    return _createToken(id, name, login, validated);
}