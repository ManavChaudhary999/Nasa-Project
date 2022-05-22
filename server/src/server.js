require('dotenv').config();

// If we have {"start": "PORT=5000 node server.js"} OR {"start": "set PORT=5000&& node src/server.js"} for default Windows shell in package.json scripts section
// And if we start our server.js file by command npm start
// Then process.env.PORT get the PORT=5000 from scripts section in package.json based on command(like npm start) and returns 5000
const PORT = process.env.PORT || 8000;

const http = require('http');

const app = require('./app.js');

const {mongodbConnect} = require('./services/mongodb'); 
const {loadPlanetsData} = require('./models/planets.model');
const {loadLaunchesData} = require('./models/launches.model');

const server = http.createServer(app);


// Using this cause await can't work without async function
async function startServer()
{
    await mongodbConnect();

    await loadPlanetsData();
    
    await loadLaunchesData();

    server.listen(PORT, ()=> {
        console.log(`Listening on Port ${PORT}...`);
    });
}

// Calling it
startServer();