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

    // Login API
    app.post('/api/login', async (req, res, next) => {
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

            try
            {
                const token = require('./createJWT.js');
                ret = token.createToken(id, n, login, validated);
            }
            catch(e)
            {
                ret = {error: e.message};
            }
        }
        else
        {
            ret = {error: "Login/Password incorrect"};
        }

        // return json object containing user info
        //ret = {id: id, name:n, email: email, age: age, height: height, weight: weight, error:error};
        res.status(200).json(ret);
    });

    // *******************
    // END OF LOGIN API
    // *******************

    // Register API
    app.post('/api/register', async (req, res, next) => {
        // incoming: name, login, password, email
        // outgoing: error
        
        var error = '';

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
            validated: false
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
            error = e.toString()
        }

        var ret = {error:error};
        res.status(200).json(ret);  // return with HTML code 200 and error message json
    });
    
    // *******************
    // END OF REGISTER API
    // *******************
    
    // addUserInfo API
    // When the user first logs into their account they are prompted to input their age, weight, and height.
	app.post('/api/addUserInfo', async (req, res, next) => {
		// incoming: age, weight, height, login (to search for the user in the database)
		// outgoing: error message
		
		var error = '';

		const { login, age, weight, height } = req.body;
		
		// Connect to the database and get the user object.
		const db = client.db("LargeProject");

        // Try to find and update a user given a login field and 
        // update with the given age, height, and weight parameters.
        try{
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

        var ret = {error:error};
        res.status(200).json(ret);
	});

    // **********************
    // End of addUserInfo API
    // **********************

    // createExercise API
    // User adds an Exercise to their Database
    app.post('/api/createExercise', async (req, res, next) => {
		// incoming: exercise name and login
		// outgoing: none

		var error = '';
        var temp = '';

		const { eName, login, caloriesBurned, caloriesPerRep } = req.body;

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
            caloriesBurned: caloriesBurned,
            caloriesPerRep: caloriesPerRep
        };

		// Connect to the database and get the user object.
		const db = client.db("LargeProject");

        const results = await db.collection('userInfo').find({login: login}).toArray();

        // Try to find and update a user given a login field
        try{
            //if the user is found, or the name passed is "public", add the exercise
            if((results.length > 0) || (temp == "public")) {
                const result = await db.collection('exerciseInfo').insertOne(newExercise);
            } else {
                throw "No Such User";
            }

            var ret = {error:error};
            res.status(200).json(ret);
        } catch(e) {
            error = e.toString();
            // return error code 400, bad request.
            res.status(400).json({error: error});
        }
    });

    // ********************************
    // End of createExercise API
    // ********************************

    // createWorkoutTemplate API
    // Creates a Workout object
    app.post('/api/createWorkoutTemplate', async (req, res, next) => {
		// incoming: age, weight, height, login (to search for the user in the database)
		// outgoing: error message
		
		var error = '';
        var temp = '';

        const db = client.db("LargeProject");

		const { name, login } = req.body;

        if(login.toLowerCase() == "public") {
            temp = login.toLowerCase();
        } else {
            temp = login;
        }

        var tempDate = new Date();
        tempDate.setUTCFullYear(1999, 12, 31);
		
        const newWorkout = {
            name: name,
            public: temp,
            dateDone: tempDate,
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

            var ret = {error:error};
            res.status(200).json(ret);
        } catch(e) {
            error = e.toString();
            // return error code 400, bad request.

            var ret = {error:error};
            res.status(400).json({error: error});
        }
    });

    // ********************************
    // End of createWorkoutTemplate API
    // ********************************

    // getExercises API
    // Not sure
    app.post('/api/getExercises', async (req, res, next) => {
    	// incoming: none
	    // outgoing: an array containing the user's exercises
	
        var error = '';
	    const db = client.db("LargeProject");
	
        // return all results but exclude the fields that aren't the exercises array
        const results = await db.collection('workoutInfo').find({},{_id:0},{name:0},{date:0},{duration:0},{calories_burned:0}).toArray();
		
	    var ret = {error:error};
        res.status(200).json(ret);
    });

    // ********************************
    // End of getExercises API
    // ********************************

    // searchExercise API
    // gets all exercises the user personally has as well as all public exercises
    app.post('/api/searchExercise', async(req, res, next) => {
        // incoming: login
        // outgoing: all exercises this user has

        var error = '';

        const { userName } = req.body;

        const db = client.db("LargeProject");

        const results = await db.collection('userInfo').find({login: userName}).toArray();

        try {
            if(results.length > 0) {
                var searchPublic = results[0].login;
            } else {
                throw "No Such User";
            }

            const result = await db.collection('exerciseInfo').find({public: searchPublic}).toArray();
        
            result.push(await db.collection('exerciseInfo').find({public: "public"}).toArray());

            var ret = {exercises: result};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            var ret = {error:error};
            res.status(404).json(ret);
        }
    });

    // ********************************
    // End of searchExercise API
    // ********************************

    // searchWorkout API
    // gets all workouts the user personally has as well as all public workouts
    app.post('/api/searchWorkout', async(req, res, next) => {
        // incoming: login
        // outgoing: all exercises this user has

        var error = '';

        const { userName } = req.body;

        const db = client.db("LargeProject");

        const results = await db.collection('userInfo').find({login: userName}).toArray();

        try {
            if(results.length > 0) {
                var searchPublic = results[0].login;
            } else {
                throw "No Such User";
            }

            const result = await db.collection('workoutInfo').find({public: searchPublic}).toArray();
        
            result.push(await db.collection('workoutInfo').find({public: "public"}).toArray());

            var ret = {workouts: result};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            // return error code 404, User not found
            var ret = {error:error};
            res.status(404).json(ret);
        }
    });

    // ********************************
    // End of searchWorkout API
    // ********************************

    // deleteExercise API
    // deletes an exercise from a user's list
    app.post('/api/deleteExercise', async(req, res, next) => {
        // incoming: exercise name, login
        // outgoing: none

        var error = '';

        const { eName, userName } = req.body;

        const db = client.db("LargeProject");

        const results = await db.collection('userInfo').find({login: userName}).toArray();

        try {
            //no such user has been found
            if(!(results.length > 0)) {
                throw "No Such User";
            }

            const result = await db.collection('exerciseInfo').deleteOne({name: eName, public: userName});     
            
            var ret = {error:error};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            // return error code 404, User not found
            var ret = {error:error};
            res.status(404).json(ret);
        }
    });

    // ********************************
    // End of deleteExercise API
    // ********************************

    // deleteWorkout API
    // deletes a workout from a user's list
    app.post('/api/deleteWorkout', async(req, res, next) => {
        // incoming: workout name, login
        // outgoing: none

        var error = '';

        const { wName, userName } = req.body;

        const db = client.db("LargeProject");

        const results = await db.collection('userInfo').find({login: userName}).toArray();

        try {
            if(!(results.length > 0)) {
                throw "No Such User";
            }

            const result = await db.collection('workoutInfo').deleteOne({name: wName, public: userName});      
            
            var ret = {error:error};
            res.status(200).json(ret);
        } catch(e) {
            // set error message to error from DB if that point fails.
            error = e.toString();

            // return error code 404, User not found
            var ret = {error:error};
            res.status(404).json(ret);
        }
    });

    // ********************************
    // End of deleteWorkout API
    // ********************************

    // removeExercise API
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

    /* EMAIL AUTHENTICATION WORK IN PROGRESS
    app.get('/confirmation/:token', async (req, res) => {
        try{
            const { user: { id } } = jwt.verify(req.params.otken, EMAIL_SECRET);
            await db.collection('userInfo').updateOne({"login" : login}, {$set : {"validated" : true}});

        } catch (e) {
            res.send('error');
        }

        let bp = require('./PathFront.js');

        return res.redirect(bp.buildPath('')); // redirect to login page
    })\
    */
}