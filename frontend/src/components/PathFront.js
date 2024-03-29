// routes to localhost frontend when working locally
// routes to herokuapp address otherwise.
const app_name = 'workout-app-cop4331'
exports.buildPath = function buildPath(route)
{
    if (process.env.NODE_ENV === 'production') 
    {
        return 'https://' + app_name +  '.herokuapp.com/' + route;
    }
    else
    {        
        return 'http://localhost:3000/' + route;
    }
}  