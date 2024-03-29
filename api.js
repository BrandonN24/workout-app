require('express');
require('mongodb');
var token = require('./createJWT.js');

exports.setApp = function (app, client)
{
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

    // Login API
    app.post('/api/login', async (req, res, next) => {
        // incoming: login, password
        // outgoing: JSON Web Token or negative id value in JSON obj on error
        
        var error = '';

        const { login, password } = req.body;

        // Establish connection to database and await info from it.
        const db = client.db("LargeProject");
        const userExists = await db.collection('userInfo').find({login:login,password:password}).toArray();

        let id = -1;
        let n = ''; // fill this with name from db.
        let email = '';
        let age = '';
        let height = '';
        let weight = '';
        let validated = ''; // contains state of whether user has done email verif.
    
        let ret;

        if( userExists.length > 0 ) {
            id = userExists[0]._id;              // case-sensitive to _id field on userInfo document
            n = userExists[0].name;              // case-senstive to name field on userInfo document
            email = userExists[0].email;         // case-senstive to email field on userInfo document
            age = userExists[0].age;             // case-senstive to age field on userInfo document
            height = userExists[0].height;       // case-senstive to height field on userInfo document
            weight = userExists[0].weight;       // case-senstive to weight field on userInfo document
            validated = userExists[0].validated; // case-senstive to validated field on userInfo document

            try {
                const token = require('./createJWT.js');
                ret = token.createToken(id, n, login, validated);
            } catch(e) {
                ret = {error: e.message};
            }
        }
        else{
            ret = {id: id};
            res.status(404).json(ret);
            return;
        }

        
        // return the json object containing the token or a negative id upon error
        res.status(200).json(ret);
    });
    // *******************
    // END OF LOGIN API
    // *******************

    // Register API
    app.post('/api/register', async (req, res, next) => {
        // incoming: name, login, password, email
        // outgoing: error

        // 200 - normal operation
        // 500 - DB call error
        
        var error = '';
        var ret = {};

        const { login, password, name, email } = req.body;

        // create newUser object
        // age, height, weight, and hasExercises are left blank for the addUserInfo api to fill later.
        const newUser = {
            login: login, 
            password: password, 
            name: name, 
            email: email, 
            age: -1, 
            height: -1, 
            weight: -1, 
            hasExercises: [], 
            validated: false,
            vCode: ""
        };

        const db = client.db("LargeProject");
        const userExists = await db.collection('userInfo').find({login:login}).toArray();

        try{ 
            if(userExists.length > 0) {
                throw "Username Taken";
            } else if (login.toLowerCase() == "public") {
                throw "Banned Name";
            } else {
                await db.collection('userInfo').insertOne(newUser);
                ret = {error: error};
            }
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();
            ret = {error: error};
            res.status(400).json(ret);
            return;
        }

        res.status(200).json(ret);  // return with HTML code 200 and error message json
    });
    // *******************
    // END OF REGISTER API
    // *******************
    
    // addUserInfo API
    // When the user first logs into their account they are prompted to input their age, weight, and height.
	app.post('/api/addUserInfo', async (req, res, next) => {
		// incoming: age, weight, height, login (to search for the user in the database), jwtToken
		// outgoing: error message, refreshedToken
		
		var error = '';

		const { login, age, weight, height, jwtToken } = req.body;
		
        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

		// Connect to the database and get the user object.
		const db = client.db("LargeProject");

        // Try to find and update a user given a login field and 
        // update with the given age, height, and weight parameters.
        try {
            userExists = await db.collection('userInfo').updateOne({"login" : login}, {$set: {"age" : age, "height": height, "weight" : weight}});
        } catch(e) {
            error = e.toString();
            // return error code 400, bad request.
            res.status(400).json({error: error});
        }

        // if we didn't find a login matching the one inputted,
        // then reflect that in the error message.
        if(userExists.matchedCount == 0){
            error = "User not found";
        }

        // refresh token if prev. tok not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        let ret = {
            error:error,
            refreshedToken: refreshedToken
        };

        res.status(200).json(ret);
	});
    // **********************
    // END OF ADDUSERINFO API
    // **********************

    // getUserInfo API
    app.post('/api/getUserInfo', async (req, res, next) => {
        // incoming: id (userID: looks like random string), jwtToken
        // outgoing: id, name, email, age, height, weight, hasExercises, validated, refreshedToken, error
        
        // error codes:
        // 401 - expired token
        // 200 - normal operation

        var error = '';

        const { id, jwtToken } = req.body;

        try {
            if( token.isExpired(jwtToken))
            {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        var ObjectId = require('mongodb').ObjectId; 

        let objId = new ObjectId(id);

        // Establish connection to database and await info from it.
        const db = client.db("LargeProject");
        const userInfo = await db.collection('userInfo').find({_id: objId}).toArray();

        let n = ''; // fill this with name from db.
        let email = '';
        let age = '';
        let height = '';
        let weight = '';
        let validated = ''; // contains state of whether user has done email verif.
        let hasExercises = '';
        let ret;

        if( userInfo.length > 0 ) {
            n = userInfo[0].name;              // case-senstive to name field on userInfo document
            email = userInfo[0].email;         // case-senstive to email field on userInfo document
            age = userInfo[0].age;             // case-senstive to age field on userInfo document
            height = userInfo[0].height;       // case-senstive to height field on userInfo document
            weight = userInfo[0].weight;       // case-senstive to weight field on userInfo document
            validated = userInfo[0].validated; // case-senstive to validated field on userInfo document
            hasExercises = userInfo[0].hasExercises;
        } else {
            ret = {error: "ID not found"};
        }

        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        // return json object containing user info
        ret = 
        {   
            id: id, 
            name:n,
            email:email,
            age: age,
            height:height,
            weight: weight,
            hasExercises: hasExercises,
            validated: validated,
            jwtToken : refreshedToken,
            error:error
        };
        res.status(200).json(ret);
    });
    // ********************************
    // END OF GETUSERINFO API
    // ********************************

    // deleteUser API
    // Delete a user given their login (used for testing purposes)
	app.post('/api/deleteUser', async (req, res, next) => {
		// incoming: login (to search for the user in the database), jwtToken
		// outgoing: error message, refreshedToken
		
		var error = '';

		const { login, jwtToken } = req.body;
		
        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

		// Connect to the database and get the user object.
		const db = client.db("LargeProject");

        // Try to find and update a user given a login field and 
        // update with the given age, height, and weight parameters.
        try {
            userExists = await db.collection('userInfo').deleteOne({"login" : login});
        } catch(e) {
            error = e.toString();
            // return error code 400, bad request.
            res.status(400).json({error: error});
        }

        // if we didn't find a login matching the one inputted,
        // then reflect that in the error message.
        if(userExists.matchedCount == 0){
            error = "User not found";
        }

        // refresh token if prev. tok not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        let ret = {
            error:error,
            refreshedToken: refreshedToken
        };

        res.status(200).json(ret);
	});
    // **********************
    // END OF ADDUSERINFO API
    // **********************

    // nodemailer setup
    // draw from dependencies
    const nodemailer = require('nodemailer');
    const { v4: uuidv4 } = require('uuid');
    // create the transporter object
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'workoutappgroup9@gmail.com',
        pass: 'wqdlbnimieqxzkee'
    }
    });

    //sendEmail API
    //Endpoint to initiate the email verification process
    app.post('/api/sendEmail', async (req, res) => {
        // incoming: email, jwtToken
        // outgoing: message, refreshedToken

        // error codes:
        // 401 - expired token, unauth'd access
        // 500 - email send error

        const { email, jwtToken } = req.body;

        // Check to see if token expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        // Generate a verification code
        const verificationCode = uuidv4();

        let ret = {};

        // Connect to the database and get the user object.
		const db = client.db("LargeProject");

        // Try to find and update a user given a login field and 
        // update with the given age, height, and weight parameters.
        try {
            result = await db.collection('userInfo').updateOne({"email" : email}, {$set: {"vCode" : verificationCode}});
        } catch(e) {
            error = e.toString();
            // return error code 400, bad request.
            res.status(400).json({error: error});
        }

         // Send the verification code to the user's email address
         transporter.sendMail({
            from: 'workoutappgroup9@gmail.com',
            to: req.body.email,
            subject: 'Email Verification Code',
            text: `Your email verification code is: ${verificationCode}`,
        }, (error, info) => {
            if (error) {
                console.log(error);

                // create json payload for outgoing
                ret =
                {
                    message : "Error sending email",
                    refreshedToken : refreshedToken
                }

                res.status(500).json(ret);
            } else {
                console.log('Email sent: ' + info.response);

                // Store the verification code in the database or cache
                // associated with the user's email address for later verification

                // create json payload for outgoing
                ret =
                {
                    message : "Verification email sent",
                    refreshedToken : refreshedToken
                }

                // Return a success response to the client
                res.status(200).json(ret);
            }
        });
    });
    // ********************************
    // END OF SENDMAIL API
    // ********************************

    //sendEmail tokenless API
    //Endpoint to initiate the email verification process
    app.post('/api/sendEmailTokenless', async (req, res) => {
        // incoming: email
        // outgoing: message

        // error codes:
        // 200 - normal operation
        // 400 - bad request
        // 500 - email send error

        const { email } = req.body;

        // Generate a verification code
        const verificationCode = uuidv4();

        let ret = {};

        // Connect to the database and get the user object.
		const db = client.db("LargeProject");

        // Try to find and update a user given a login field and 
        // update with the given age, height, and weight parameters.
        try {
            result = await db.collection('userInfo').updateOne({"email" : email}, {$set: {"vCode" : verificationCode}});
        } catch(e) {
            error = e.toString();
            // return error code 400, bad request.
            res.status(400).json({error: error});
        }

         // Send the verification code to the user's email address
         transporter.sendMail({
            from: 'workoutappgroup9@gmail.com',
            to: req.body.email,
            subject: 'Email Verification Code',
            text: `Your email verification code is: ${verificationCode}`,
        }, (error, info) => {
            if (error) {
                console.log(error);

                // create json payload for outgoing
                ret =
                {
                    message : "Error sending email",
                }

                res.status(500).json(ret);
            } else {
                console.log('Email sent: ' + info.response);

                // Store the verification code in the database or cache
                // associated with the user's email address for later verification

                // create json payload for outgoing
                ret =
                {
                    message : "Verification email sent",
                }

                // Return a success response to the client
                res.status(200).json(ret);
            }
        });
    });
    // ********************************
    // END OF SENDMAIL TOKENLESS API
    // ********************************

    // verifyEmail API
    // Checks if the User has inputted the correct verification code
    app.post('/api/verifyEmail', async (req, res) => {
        // incoming: email, verificationCode, jwtToken
        // outgoing: error, refreshedToken

        const { email, verificationCode, jwtToken } = req.body;
        
        // Check to see if token is expired
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. tok not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        let ret = {};

        try {
            // Find the user in the database by email
            const db = client.db("LargeProject");
            const user = await db.collection('userInfo').find({email: email}).toArray();
      
            // Check if the verification code matches the one stored in the user object
            if(user.length > 0) {
                if (user[0].vCode === verificationCode) {

                    // Set the verified status to true and save the user object
                    await db.collection('userInfo').updateOne({"email": email}, {$set: {validated : true}});
                    
                    // Create the json payload
                    ret =
                    {
                        error: "Validated",
                        refreshedToken: refreshedToken
                    }

                    res.status(200).json(ret);
                } else {
                    // create the json payload
                    ret =
                    {
                        error: "Invalid Verification code",
                        refreshedToken: refreshedToken
                    }
                    // Return an error if the verification code is invalid
                    res.status(400).json(ret);
                }
            } else {
                throw "No Such User";
            }
            
        } catch(e) {
            error = e.toString();

            // Create the json payload
            ret = 
            {
                error: error,
                refreshedToken: refreshedToken
            }

            res.status(404).json(ret);
        }
    });
    // ********************************
    // END OF VERIFYEMAIL API
    // ********************************

    // createExercise API
    // User adds an Exercise to their Database
    app.post('/api/createExercise', async (req, res, next) => {
		// incoming: exercise, name, login, effort, and jwtToken
		// outgoing: error message, refreshedToken

		var error = '';
        var temp = '';

		const { eName, login, effort, jwtToken } = req.body;
        
        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not epxired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        if(login.toLowerCase() == "public") {
            temp = login.toLowerCase();
        } else {
            temp = login;
        }
		
        // create newExercise object
        const newExercise = {
            name: eName,
            public: temp, 
            sets: [],
            effort: effort
            //caloriesBurned: caloriesBurned,
            //caloriesPerRep: caloriesPerRep
        };

        // create json outgoing payload
        let ret = {};

		// Connect to the database and get the user object.
		const db = client.db("LargeProject");

        const userExists = await db.collection('userInfo').find({login: temp}).toArray();

        // Try to find and update a user given a login field
        try {
            //if the user is found, or the name passed is "public", add the exercise
            if((userExists.length > 0) || (temp == "public")) {
                const usedEName = await db.collection('exerciseInfo').find({public: temp, name: eName}).toArray();

                if(usedEName.length > 0) {
                    throw "User Already Has This Exercise";
                } else {
                    const result = await db.collection('exerciseInfo').insertOne(newExercise);   
                }

            } else {
                throw "No Such User";
            }

            ret = {error:error, refreshedToken: refreshedToken};
            res.status(200).json(ret);
        } catch(e) {
            error = e.toString();
            // return error code 400, bad request.
            res.status(400).json({error: error, refreshedToken: refreshedToken});
        }

    });
    // ********************************
    // END OF CREATEEXERCISE API
    // ********************************

    // deleteExercise API
    // deletes an exercise from a user's exerciseInfo collection
    app.post('/api/deleteExercise', async(req, res, next) => {
        // incoming: exercise name, login, jwtToken
        // outgoing: error, refreshedToken

        // error codes:
        // 200 - normal operation
        // 401 - token expired
        // 404 - could not find user

        var error = '';

        const { eName, login, jwtToken } = req.body;

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken))
            {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const db = client.db("LargeProject");

        const userExists = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            //no such user has been found
            if(!(userExists.length > 0)) {
                throw "No Such User";
            }

            await db.collection('exerciseInfo').deleteOne({name: eName, public: login});     
            
            ret = {error:error, refreshedToken: refreshedToken};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            // return error code 404, User not found
            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
    });
    // ********************************
    // END OF DELETEEXERCISE API
    // ********************************

     // getExercise API
    // gets all exercises the user personally has as well as all public exercises
    app.post('/api/getExercise', async(req, res, next) => {
        // incoming: login, jwtToken
        // outgoing: all exercises this user has, refreshedToken

        // error codes:
        // 200 - normal operation
        // 401 - token expired

        var error = '';

        const { login, jwtToken } = req.body;

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const db = client.db("LargeProject");

        const userExists = await db.collection('userInfo').find({login: login}).toArray();

        // initialize a json outgoing payload object
        let ret = {};

        try {
            if(userExists.length > 0) {
                var searchPublic = userExists[0].login;
            } else {
                throw "No Such User";
            }

            const exercises = await db.collection('exerciseInfo').find({$or: [{public: "public"}, {public: searchPublic}]}).toArray();
        
            ret = {exercises: exercises, refreshedToken: refreshedToken};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
    });
    // ********************************
    // END OF GETEXERCISE API
    // ********************************

    // createWorkoutTemplate API
    // Creates a Workout object
    app.post('/api/createWorkoutTemplate', async (req, res, next) => {
		// incoming: name (of workout), login, jwtToken
		// outgoing: error message, refreshedToken
		
        // error codes:
        // 401 - token expired
        // 400 - workout name taken
        // 200 - successful operation

		var error = '';
        var temp = '';
        let ret = {};

        const db = client.db("LargeProject");

		const { name, login, jwtToken } = req.body;

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }


        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        if(login.toLowerCase() == "public") {
            temp = login.toLowerCase();
        } else {
            temp = login;
        }

        const takenWName = await db.collection('workoutInfo').find({public: temp, name: name}).toArray();

        if(takenWName.length != 0) {
            ret = 
            {
                error: "Workout Name Already Used By User",
                refreshedToken : refreshedToken
            }
            res.status(400).json(ret);
        } else {

            const date = new Date().toLocaleDateString('en-US');

            
            const newWorkout = {
                name: name,
                public: temp,
                dateDone: date,
                caloriesBurned: -1,
                duration: -1,
                exercises: []
            };
    
            const userExists = await db.collection('userInfo').find({login: temp}).toArray();
    
            try {
                if(!(userExists.length > 0) && temp != "public") {
                    throw "No Such User";
                }
    
                await db.collection('workoutInfo').insertOne(newWorkout);
    
                ret = 
                {
                    error: "",
                    refreshedToken : refreshedToken
                }
                res.status(200).json(ret);
            } catch(e) {
                error = e.toString();
                // return error code 400, bad request.
    
                ret = 
                {
                    error: error,
                    refreshedToken : refreshedToken
                }
                res.status(400).json({error: error});
            }
        }
    });
    // ********************************
    // END OF CREATEWORKOUTTEMPLATE API
    // ********************************

    // deleteWorkout API
    // deletes a workout from a user's list
    app.post('/api/deleteWorkout', async(req, res, next) => {
        // incoming: workout name, login, jwtToken
        // outgoing: error, refreshedToken

        // error codes:
        // 200 - normal operation
        // 401 - token expired
        // 404 - could not find user

        var error = '';

        const { wName, login, jwtToken } = req.body;

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken))
            {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const db = client.db("LargeProject");

        const userExists = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};        

        try {
            if(!(userExists.length > 0)) {
                throw "No Such User";
            }

            await db.collection('workoutInfo').deleteOne({name: wName, public: login});      
            
            ret = {error:error, refreshedToken: refreshedToken};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            // return error code 404, User not found
            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
    });
    // ********************************
    // END OF DELETEWORKOUT API
    // ********************************

    // getWorkout API
    // gets all workouts the user personally has as well as all public workouts
    app.post('/api/getWorkout', async(req, res, next) => {
        // incoming: login, jwtToken
        // outgoing: all workouts this user has, refreshedToken

        // error codes:
        // 200 - normal operation
        // 401 - token expired
        // 404 - could not find user

        var error = '';

        const { login, jwtToken } = req.body;

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const db = client.db("LargeProject");

        const userExists = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(userExists.length > 0) {
                var searchPublic = userExists[0].login;
            } else {
                throw "No Such User";
            }

            const workouts = await db.collection('workoutInfo').find({public: searchPublic}).toArray();
        
            ret = {workouts: workouts, refreshedToken: refreshedToken};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            // return error code 404, User not found
            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
    });
    // ********************************
    // END OF GETWORKOUT API
    // ********************************

    
    //addToWorkout API
    //adds an exercise to a workout in the workoutInfo collection
	app.post('/api/addToWorkout', async(req, res, next) => {		
		// incoming: login, wName, eName, effort, calories burned, calories per rep
		// outgoing: none
		
        // error codes:
        // 401 - expired token
        // 200 - normal operation
        // 404 - something went wrong with DB update call

		var error = '';
        var temp = '';
        const { login, wName, eName, effort, num, jwtToken } = req.body;

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }
        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const db = client.db("LargeProject");

        if(login.toLowerCase() == "public") {
            temp = login.toLowerCase();
        } else {
            temp = login;
        }

        const workoutExists = await db.collection('workoutInfo').find({name: wName, public: temp}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(workoutExists.length > 0) {

                var newExercise = {
                    Name: eName[0],
                    Sets: [],
		            effort: effort[0],
                    Public: temp
		        }

		    for(i = 0; i < num; i++) {
                newExercise = {
                    Name: eName[i],
                    Sets: [],
		            effort: effort[i],
                    Public: temp
		        }
					
		        await db.collection('workoutInfo').updateOne({name:wName, public: temp}, {$push: {exercises: newExercise}});
		    }

                ret = {newExercise: newExercise, error: error, refreshedToken: refreshedToken};
                res.status(200).json(ret);

            } else {
                throw "No Such Workout";
            }

        } catch (e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
	});

    // *****************
    // END OF ADDTOWORKOUT API
    // *****************

    // removeExercise API (WIP)
    // removes a exercise from particular workout
    /*app.post('/api/removeExercise', async(req, res, next) => {
        // incoming: workout name, exercise name, login
        // outgoing: none
        var error = '';
        const { wName, eName, userName } = req.body;
        const db = client.db("LargeProject");
        const results = await db.collection('userInfo').find({login: userName}).toArray();
        try {
            if(!(results.length > 0)) {
                throw "No Such User";
            }
            const result = await db.collection('workoutInfo').deleteOne({name: wName, public: userName}.{eName: eName});      
            
            var ret = {error:error};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();
            // return error code 404, User not found
            var ret = {error:error};
            res.status(404).json(ret);
        }
    });*/
    // ********************************
    // End of removeExercise API
    // ********************************
    
	//addSet API
    //adds a set to an exercise in the exerciseInfo DB, not the workoutInfo DB
	app.post('/api/addSet', async(req, res, next) => {		
		// incoming: exercise name, login, weight, reps, jwtToken
		// outgoing: the set added, error, refreshedToken
		
        // error codes:
        // 401 - expired token
        // 200 - normal operation
        // 404 - something went wrong with DB update call

		var error = '';
        var temp = '';
        const { eName, login, reps, weight, jwtToken } = req.body;

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const db = client.db("LargeProject");

        if(login.toLowerCase() == "public") {
            temp = login.toLowerCase();
        } else {
            temp = login;
        }

        const userExists = await db.collection('exerciseInfo').find({name: eName, public: temp}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(userExists.length > 0) {
                const newSet = {
                    reps:reps,
                    weight:weight
                }

                await db.collection('exerciseInfo').updateOne({name:eName, public: temp}, {$push: {sets: newSet}});
                ret = {newSet: newSet, error: error, refreshedToken: refreshedToken};
                res.status(200).json(ret);
            } else {
                throw "No Such Exercise";
            }

        } catch (e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
	});
    // *****************
    // END OF ADDSET API
    // *****************

    //deleteSet API
    //deletes a set from an exercise in the exerciseInfo DB, not the workoutInfo DB
	app.post('/api/deleteSet', async(req, res, next) => {		
		// incoming: exercise name, login, jwtToken
		// outgoing: the set added, error, refreshedToken

        // error codes:
        // 200 - normal operation
        // 401 - expired token
        // 404 - something went wrong with DB call
		
		var error = '';
        var temp = '';
        const { eName, login, jwtToken } = req.body;

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken))
            {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const db = client.db("LargeProject");

        if(login.toLowerCase() == "public") {
            temp = login.toLowerCase();
        } else {
            temp = login;
        }

        const userExists = await db.collection('exerciseInfo').find({name: eName, public: temp}).toArray();

        // Create json outgoing payload object
        let ret = {};

        try {
            if(userExists.length > 0) {
                await db.collection('exerciseInfo').updateOne({name:eName, public: temp}, {$pop: {sets: -1}});

                ret = {error: "Deleted Set", refreshedToken: refreshedToken};
                res.status(200).json(ret);
            } else {
                throw "No Such Exercise";
            }
        } catch (e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
	});
    // *****************
    // END OF DELETESET API
    // *****************

    // getPBs API
    // gets the user's personal bests for all exercise where they have one
    // we look at the hasExercises array in the userInfo collection.
	app.post('/api/getPBs', async(req, res, next) => {		
		// incoming: login, jwtToken
		// outgoing: personalBests

        // error codes;
        // 200 - normal operation
        // 401 - expired token
        // 404 - DB call failure
		
		var error = '';
        const {login, jwtToken} = req.body;

        const db = client.db("LargeProject");

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }

        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const userExists = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(userExists.length > 0) {
                if(userExists[0].hasExercises.length > 0) {
                    var personalBests = [];

                    for(var i = 0; i < userExists[0].hasExercises.length; i++) {
                        personalBests[i] = userExists[0].hasExercises[i].exerciseName + ": " + userExists[0].hasExercises[i].personalBest;
                    }

                    ret = {personalBests: personalBests, refreshedToken: refreshedToken}
                    res.status(200).json(ret);
                } else {
                    throw "No Personal Bests";
                }
               
            } else {
                throw "No Such User";
            }

        } catch (e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error, refreshedToken};
            res.status(404).json(ret);
        }
	});	
    // *****************
    // END OF GETPBS API
    // *****************

    // workoutByDate API
    // returns an array of workouts given a date formatted as MM/DD/YYYY
	app.post('/api/workoutByDate', async(req, res, next) => {		
		// incoming: login, date
		// outgoing: an array of workouts according to the sent date

        // error codes;
        // 200 - normal operation
        // 401 - expired token
        // 404 - DB call failure
		
		var error = '';
        const {login, date, jwtToken} = req.body;

        const db = client.db("LargeProject");

        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }
        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const userExists = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(userExists.length > 0) {
                const workouts = await db.collection('workoutInfo').find({dateDone: date, public: login}).toArray();

                ret = {workouts: workouts, refreshedToken: refreshedToken};
                res.status(200).json(ret);
            } else {
                throw "No Such User";
            }
        } catch (e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
	});	
    // *****************
    // END OF WORKOUTBYDATE API
    // *****************

    // weightByDate API
    // returns highest weight doen for a given exercise and date.
	app.post('/api/weightByDate', async(req, res, next) => {		
		// incoming: login, exercise
		// outgoing: highest weight done for a given exercise by date

        // error codes;
        // 200 - normal operation
        // 401 - expired token
        // 404 - DB call failure
		
		var error = '';
        const {login, eName} = req.body;

        const db = client.db("LargeProject");
/*
        // Check to see if token is expired, return error if so
        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }
        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }
*/
        const userExists = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(userExists.length > 0) {
                const workouts = await db.collection('workoutInfo').find({public: login}).toArray();

                for(var i = 0; i < workouts.length; i++) {
                    const exercises = workouts[i].exercises;

                    for(var j = 0; j < exercises.length; j++) {
                        console.log(exercises[j].Name);
                        /*if(exercises[j].Name == eName) {
                        }*/
                    }
                }

                ret = {workouts: result};
                res.status(200).json(ret);
            } else {
                throw "No Such User";
            }
        } catch (e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error/*, refreshedToken*/};
            res.status(404).json(ret);
        }
	});	
    // *****************
    // END OF WEIGHTBYDATE API
    // *****************

    //completeWorkout API
    //takes incoming exercises and sets and adds them to an existing workout
    app.post('/api/completeWorkout', async (req, res, next) => {
        const { wName, login, exercises, jwtToken } = req.body;
        //const { name, exercises } = workout;

        try {
            if( token.isExpired(jwtToken)) {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(401).json(r);
                return;
            }
        } catch(e) {
            console.log(e.message);
        }
        // refresh the token if prev. token not expired
        let refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch(e) {
            console.log(e.message);
        }

        const db = client.db("LargeProject");
      
        const userExists = await db.collection('userInfo').find({login: login}).toArray();

        let ret = {};

        try {
          if (userExists.length > 0) {
            const workoutExists = await db.collection('workoutInfo').find({name: wName, public: login}).toArray();

            if (!(workoutExists.length > 0)) {
                var date = new Date().toLocaleDateString('en-US');

                if(date.charAt(0) != '1') {
                    date = date.padStart((date.length + 1), "0");
                }

                const workout = {
                   name: wName,
                   public: login,
                   dateDone: date,
                   caloriesBurned: -1,
                   duration: -1,
                   exercises: exercises
                }
                
                await db.collection('workoutInfo').insertOne(workout);

                ret = {workout: workout, refreshedToken: refreshedToken};
                res.status(200).json(ret);
                /*const result = await db.collection('users').updateOne({ login: login }, {$push: {workouts: {name: name, date: new Date(date), exercises: exercises*/
            } else {
               throw "User Already Has Workout";
            }
        } else {
            throw "No Such User";
        }
    } catch (e) {
        error = e.toString();

        ret = {error: error, refreshedToken: refreshedToken};
        res.status(404).json(ret);
    }
    });
    // *****************
    // END OF COMPLETEWORKOUT API
    // *****************
	
    //findUser API
    //finds a user with a given login and email
    app.post('/api/findUser', async(req, res, next) => 
    {		
        // incoming: login, email
        // outgoing: boolean for whether the user exists

        // error codes;
        // 200 - normal operation
        // 404 - user not found
        // 400 - DB call failure
            
        const {login, email} = req.body;
            
        error = '';
        let ret = {};

        const db = client.db("LargeProject");
        const user = await db.collection('userInfo').find({login:login,email:email}).toArray();
        try
        {
            if(user.length > 0)
            {
                ret = {exists:true,error:error};
                res.status(200).json(ret);
            }
            else
            {
                error = "User not found";
                ret = {exists:false,error:error};
                res.status(404).json(ret);
            }
        }
        catch(e)
        {
            error = e.toString();
            ret = {exists:false,error:error};
            res.status(400).json(ret);
        }
            
    });
    // *****************
    // END OF FINDUSER API
    // *****************
	
    //verifyPasswordChange API
    //after verifying the password change (previous API), this one carries out the change
    app.post('/api/verifyPasswordChange', async(req, res, next) => {		
    // incoming: email, vcode
    // outgoing: newPass (whether or not they have the correct pw change code)

    // error codes;
    // 200 - normal operation
    // 400 - DB call failure
    // 401 - Invalid verification code
		
    var error = '';
    const {email, vCode} = req.body;
		
    let ret = {};

    const db = client.db("LargeProject");
    const user = await db.collection('userInfo').find({email:email}).toArray();
		
    try
    {
        if(user.length > 0)
	    {
            if(user[0].vCode === vCode)
            {
                await db.collection('userInfo').updateOne({email: email}, {$set: {newPass : true}});
                ret = {newPass:true,error:error}
            }
            else 
                await db.collection('userInfo').updateOne({email: email}, {$set: {newPass : false}});

	        res.status(200).json(ret);
	    }
	    else
        {
            error = "User not found";
            ret = {newPass:false,error:error};
            res.status(404).json(ret);
        }
			
    }
	catch(e)
	{
        error = e.toString();
	    ret = {newPass:false,error:error}
        res.status(400).json(ret);
    }
		
    });
    // *****************
    // END OF VERIFYPASSWORDCHANGE API
    // *****************
	
	//changePassword API
    //after verifying the password change (previous API), this one carries out the change
	app.post('/api/changePassword', async(req, res, next) => 
    {
		// incoming: login, password
		// outgoing: error

        // error codes;
        // 200 - normal operation
        // 400 - DB call failure
        // 404 - User not found
            
        var error = '';
        const {login, password} = req.body;
            
        let ret = {};

        const db = client.db("LargeProject");
        const user = await db.collection('userInfo').find({login:login}).toArray();
            
        try
        {
            if(user.length > 0)
            {
                // User exists, check for whether their password can change
                if(user[0].newPass)
                {
                    // Change their password
                    await db.collection('userInfo').updateOne({login : login}, {$set: {password:password}});
                    // update newPass flag to show that they no longer need to change their password
                    await db.collection('userInfo').updateOne({login: login}, {$set: {newPass : false}});
                    ret = {error:error};
                    res.status(200).json(ret);
                }
                else
                {
                    // Password change has not been verified
                    error = "No permission";
                    ret = {error:error};
                    res.status(200).json(ret);
                }
            }
            else
            {
                error = "User not found";
                ret = {error:error};
                res.status(404).json(ret);
            }
        }
        catch(e)
        {
            error = e.toString();
            ret = {error:error};
            res.status(400).json(ret);
        }
		
	});
	// *****************
    // END OF CHANGEPASSWORD API
    // *****************
}
