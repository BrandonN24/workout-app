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
        const results = await db.collection('userInfo').find({login:login,password:password}).toArray();

        let id = -1;
        let n = ''; // fill this with name from db.
        let email = '';
        let age = '';
        let height = '';
        let weight = '';
        let validated = ''; // contains state of whether user has done email verif.
    
        let ret;

        if( results.length > 0 ) {
            id = results[0]._id;              // case-sensitive to _id field on userInfo document
            n = results[0].name;              // case-senstive to name field on userInfo document
            email = results[0].email;         // case-senstive to email field on userInfo document
            age = results[0].age;             // case-senstive to age field on userInfo document
            height = results[0].height;       // case-senstive to height field on userInfo document
            weight = results[0].weight;       // case-senstive to weight field on userInfo document
            validated = results[0].validated; // case-senstive to validated field on userInfo document

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
        const results = await db.collection('userInfo').find({login:login}).toArray();

        try{ 
            if(results.length > 0) {
                throw "Username Taken";
            } else if (login.toLowerCase() == "public") {
                throw "Banned Name";
            } else {
                const results = await db.collection('userInfo').insertOne(newUser);
            }
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();
            ret = {error: error};
            res.status(400).json(ret);
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
            result = await db.collection('userInfo').updateOne({"login" : login}, {$set: {"age" : age, "height": height, "weight" : weight}});
        } catch(e) {
            error = e.toString();
            // return error code 400, bad request.
            res.status(400).json({error: error});
        }

        // if we didn't find a login matching the one inputted,
        // then reflect that in the error message.
        if(result.matchedCount == 0){
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
        const results = await db.collection('userInfo').find({_id: objId}).toArray();

        let n = ''; // fill this with name from db.
        let email = '';
        let age = '';
        let height = '';
        let weight = '';
        let validated = ''; // contains state of whether user has done email verif.
        let hasExercises = '';
        let ret;

        if( results.length > 0 ) {
            n = results[0].name;              // case-senstive to name field on userInfo document
            email = results[0].email;         // case-senstive to email field on userInfo document
            age = results[0].age;             // case-senstive to age field on userInfo document
            height = results[0].height;       // case-senstive to height field on userInfo document
            weight = results[0].weight;       // case-senstive to weight field on userInfo document
            validated = results[0].validated; // case-senstive to validated field on userInfo document
            hasExercises = results[0].hasExercises;
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
                        message: "Validated",
                        refreshedToken: refreshedToken
                    }

                    res.status(200).json(ret);
                } else {
                    // create the json payload
                    ret =
                    {
                        message: "Invalid Verification code",
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

        const results = await db.collection('userInfo').find({login: temp}).toArray();

        // Try to find and update a user given a login field
        try {
            //if the user is found, or the name passed is "public", add the exercise
            if((results.length > 0) || (temp == "public")) {
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
    // deletes an exercise from a user's list
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

        const results = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            //no such user has been found
            if(!(results.length > 0)) {
                throw "No Such User";
            }

            const result = await db.collection('exerciseInfo').deleteOne({name: eName, public: login});     
            
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

     // searchExercise API
    // gets all exercises the user personally has as well as all public exercises
    app.post('/api/searchExercise', async(req, res, next) => {
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

        const results = await db.collection('userInfo').find({login: login}).toArray();

        // initialize a json outgoing payload object
        let ret = {};

        try {
            if(results.length > 0) {
                var searchPublic = results[0].login;
            } else {
                throw "No Such User";
            }

            const result = await db.collection('exerciseInfo').find({$or: [{public: "public"}, {public: searchPublic}]}).toArray();
        
            ret = {exercises: result, refreshedToken: refreshedToken};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error, refreshedToken: refreshedToken};
            res.status(404).json(ret);
        }
    });
    // ********************************
    // END OF SEARCHEXERCISE API
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

		const { name, date, login, jwtToken } = req.body;

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

            
            const newWorkout = {
                name: name,
                public: temp,
                dateDone: date,
                caloriesBurned: -1,
                duration: -1,
                exercises: []
            };
    
            const results = await db.collection('userInfo').find({login: temp}).toArray();
    
            try {
                if(!(results.length > 0) && temp != "public") {
                    throw "No Such User";
                }
    
                const result = await db.collection('workoutInfo').insertOne(newWorkout);
    
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

        const results = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};        

        try {
            if(!(results.length > 0)) {
                throw "No Such User";
            }

            const result = await db.collection('workoutInfo').deleteOne({name: wName, public: login});      
            
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

    // searchWorkout API
    // gets all workouts the user personally has as well as all public workouts
    app.post('/api/searchWorkout', async(req, res, next) => {
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

        const results = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(results.length > 0) {
                var searchPublic = results[0].login;
            } else {
                throw "No Such User";
            }

            const result = await db.collection('workoutInfo').find({$or: [{public: "public"}, {public: searchPublic}]}).toArray();
        
            result.push(await db.collection('workoutInfo').find({public: "public"}).toArray());

            ret = {workouts: result, refreshedToken: refreshedToken};
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
    // END OF SEARCHWORKOUT API
    // ********************************

    
    //addToWorkout API
    //adds an exercise to a workout in the workoutInfo DB
	app.post('/api/addToWorkout', async(req, res, next) => {		
		// incoming: login, wName, eName, calories burned, calories per rep
		// outgoing: none
		
        // error codes:
        // 401 - expired token
        // 200 - normal operation
        // 404 - something went wrong with DB update call

		var error = '';
        var temp = '';
        const { login, wName, eName, calBurn, calPR, num } = req.body;

        // Check to see if token is expired, return error if so
        /*try {
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
        }*/

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
                    caloriesBurned: calBurn[0],
                    Public: temp,
                    caloriesPerRep: calPR[0]
		        }

		    for(i = 0; i < num; i++)
		    {
                newExercise = {
                    Name: eName[i],
                    Sets: [],
                    caloriesBurned: calBurn[i],
                    Public: temp,
                    caloriesPerRep: calPR[i]
		        }
					
		        await db.collection('workoutInfo').updateOne({name:wName, public: temp}, {$push: {exercises: newExercise}});
		    }

                ret = {newExercise: newExercise, error: error/*, refreshedToken: refreshedToken*/};
                res.status(200).json(ret);

            } else {
                throw "No Such Workout";
            }

        } catch (e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            ret = {error:error/*, refreshedToken: refreshedToken*/};
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

        const results = await db.collection('exerciseInfo').find({name: eName, public: temp}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(results.length > 0) {
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
    //adds a set to an exercise in the exerciseInfo DB, not the workoutInfo DB
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

        const results = await db.collection('exerciseInfo').find({name: eName, public: temp}).toArray();

        // Create json outgoing payload object
        let ret = {};

        try {
            if(results.length > 0) {
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

    //getPBs API
    //gets the user's personal bests for all exercise where they have one
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

        const results = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(results.length > 0) {
                if(results[0].hasExercises.length > 0) {
                    var personalBests = [];

                    for(var i = 0; i < results[0].hasExercises.length; i++) {
                        personalBests[i] = personalBests[0].hasExercises[i].exerciseName + ": " + personalBests[0].hasExercises[i].personalBest;
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

    //workoutByDate API
    //gets the user's personal bests for all exercise where they have one
	app.post('/api/workoutByDate', async(req, res, next) => {		
		// incoming: login, date
		// outgoing: workouts according to the sent date

        // error codes;
        // 200 - normal operation
        // 401 - expired token
        // 404 - DB call failure
		
		var error = '';
        const {login, date} = req.body;

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
        const results = await db.collection('userInfo').find({login: login}).toArray();

        // create json outgoing payload object
        let ret = {};

        try {
            if(results.length > 0) {
                const result = await db.collection('workoutInfo').find({dateDone: date}).toArray();

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
    // END OF WORKOUTBYDATE API
    // *****************

    //weightByDate API
    //gets the user's personal bests for all exercise where they have one
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
}
