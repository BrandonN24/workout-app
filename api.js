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

    // *******************
    // END OF LOGIN API
    // *******************

    // Register API
    app.post('/api/register', async (req, res, next) => 
    {
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
        age: null, 
        height: null, 
        weight: null, 
        hasExercises: null, 
        validated: false
    };

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
    
    // *******************
    // END OF REGISTER API
    // *******************
    
    // addUserInfo API
    // When the user first logs into their account they are prompted to input their age, weight, and height.
	app.post('/api/addUserInfo', async (req, res, next) => 
    {
		// incoming: age, weight, height, login (to search for the user in the database)
		// outgoing: error message
		
		var error = '';

		const { login, age, weight, height } = req.body;
		
		// Connect to the database and get the user object.
		const db = client.db("LargeProject");

        // Try to find and update a user given a login field and 
        // update with the given age, height, and weight parameters.
        try{
            result = await db.collection('userInfo').updateOne(
                {"login" : login},  
                {$set: {
                    "age" : age, "height": height, "weight" : weight
                }}
            );
        }
        catch(e){
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

    app.post('/api/createWorkoutTemplate', async (req, res, next) => 
    {
		// incoming: age, weight, height, login (to search for the user in the database)
		// outgoing: error message
		
		var error = '';

		const { login, age, weight, height } = req.body;
		
        const newWorkout = {
            
        };

		// Connect to the database and get the user object.
		const db = client.db("LargeProject");

        // Try to find and update a user given a login field and 
        // update with the given age, height, and weight parameters.
        try{
            const result = await db.collection('workoutInfo').insertOne();
        }
        catch(e){
            error = e.toString();
            // return error code 400, bad request.
            res.status(400).json({error: error});
        }

        var ret = {error:error};
        res.status(200).json(ret);
    });

    // ********************************
    // End of createWorkoutTemplate API
    // ********************************
	
    app.post('/api/getExercises', async (req, res, next) => 
    {
	// incoming: none
	// outgoing: an array containing the user's exercises
	var error = '';
	const db = client.db("LargeProject");
	// return all results but exclude the fields that aren't the exercises array
        const results = await db.collection('workoutInfo').find({},{_id:0},{name:0},{date:0},{duration:0},{calories_burned:0}).toArray();
		
	var ret = {error:error};
        res.status(200).json(ret);
    }
	     
    // ***********************
    // End of getExercises API
    // ***********************
	
    app.post('/api/deleteWorkoutTemplate', async (req, res, next) => 
    {
	// incoming: workout id
	// outgoing: nothing?
		
	const { id } = req.body;
	var error = '';
		
	const db = client.db("LargeProject");
        await db.collection('workoutInfo').deleteOne({_id:id});
		
	var ret = {error:error};
        res.status(200).json(ret);
    }
	
    // ********************************
    // End of deleteWorkoutTemplate API
    // ********************************	     
}
