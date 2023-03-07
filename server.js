const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const path = require('path');           
const PORT = process.env.PORT || 5000; 

const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(cors());
app.use(bodyParser.json());

require('dotenv').config();
const url = process.env.MONGODB_URI;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
client.connect();

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

app.listen(PORT, () => 
{
  console.log('Server listening on port ' + PORT);
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
  // age, height, and weight are left blank for a different api to fill later.
  const newUser = {login: login, password: password, name: name, email: email, age: null, height: null, weight: null};

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

///////////////////////////////////////////////////
// For Heroku deployment

// Server static assets if in production
if (process.env.NODE_ENV === 'production') 
{
  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => 
 {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

