require('express');
require('mongodb');

exports.setApp = function (app, client){

    app.use((req, res, next) => 
    {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
    });

    app.post('/api/login', async (req, res, next) => 
    {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error
        
    var error = '';

    const { login, password } = req.body;

    // Establish connection to database and await info from it.
    const db = client.db("LargeProject");
    const results = await db.collection('userInfo').find({login:login,password:password}).toArray();

    let id = -1;
    let n = ''; // fill this with name from db.
    let email = '';
    let age = '';
    let height = '';
    let weight = '';

    if( results.length > 0 )
    {
        id = results[0]._id;  // case-sensitive to _id field on userInfo document
        n = results[0].name;  // case-senstive to name field on userInfo document
        email = results[0].email; // case-senstive to email field on userInfo document
        age = results[0].age; // case-senstive to age field on userInfo document
        height = results[0].height; // case-senstive to height field on userInfo document
        weight = results[0].weight; // case-senstive to weight field on userInfo document
    }

    // return json object containing user info
    var ret = {id: id, name:n, email: email, age: age, height: height, weight: weight, error:error};
    res.status(200).json(ret);
    });

    app.post('/api/register', async (req, res, next) => 
    {
    // incoming: name, login, password, email
    // outgoing: error
        
    var error = '';

    const { login, password, name, email } = req.body;

    // create newUser object
    // age, height, weight, and hasExercises are left blank for a different api to fill later.
    const newUser = {login: login, password: password, name: name, email: email, age: null, height: null, weight: null, hasExercises: null};

    try{
        const db = client.db("LargeProject");
        const results = await db.collection('userInfo').insertOne(newUser);
    }
    catch(e){
        // set error message to error from DB if that point fails.
        error = e.toString()
    }

    var ret = {error:error};
    res.status(200).json(ret);  // return with HTML code 200 and error message json
    });
    
}