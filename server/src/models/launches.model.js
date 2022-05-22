const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const axios = require("axios");

const DEFAULT_FLIGHT_NO = 100;

const launch = {
    flightNumber: 100, // flight_number
    mission: 'Kepler Exploration X', // name
    rocket: 'Explorer ISI', // rocket.name
    launchDate: new Date('December 07, 2030'), //date_local
    destination: 'Kepler-442 b', // Not Applicable
    customers: ['Manav', 'SpaceX'], // payloads.customers
    upcoming: true, // upcoming
    success: true, // success
};

// Get Latest FNo From MongoDB
async function getLatestFlightNumber()
{
    // sort() is a mongodb method which sort on the basis of properties.
    // getting sorted data on the basis of flightNumber using -ve because sorting in desecending order.
    // find one find lastest or can say first object of document.
    const latestLaunch = await launches.findOne().sort("-flightNumber");

    if(!latestLaunch) return DEFAULT_FLIGHT_NO;

    return latestLaunch.flightNumber;
}

// Save Launch To MongoDB
async function saveLaunch(launch)
{
    // We can use create and update both mongo method but instead using upsert property.
    // upsert will make sure that we will create data only if it not exists meaning cant find matching document then create.
    await launches.findOneAndUpdate({ flightNumber: launch.flightNumber }, launch , { upsert: true } );
    // using findOneAndUpdate instead of UpdateOne because updateOne also include some other properties not only in mongo document but also in out local memory
    // now we are returning this object and then returning as response with also include additional property which we dont want thats why using findOneAndUpdate.
}

// saveLaunches(launch); // first time

// Schedule New Launch by some validation
async function scheduleNewLaunch(newLaunch)
{
    const planet = await planets.findOne({keplerName: newLaunch.destination});

    if(!planet) throw new Error("Cant Find Matching Planet");

    const latestFlightNumber = (await getLatestFlightNumber()) + 1;

    const modifiedLaunch = Object.assign(newLaunch, {
        flightNumber: latestFlightNumber,
        customers: ['Manav', 'SpaceX'],
        upcoming: true,
        success: true,
    });

    await saveLaunch(modifiedLaunch);
}

async function findLaunch(filter){
    return await launches.findOne(filter);
}
async function isLauchIdExists(launchId)
{
    return await findLaunch({flightNumber: launchId});
}

async function abortLaunchById(launchId){
    const abortLaunch = await launches.updateOne(
        {flightNumber: launchId},
        {upcoming: false, success: false}
    );
    // updateOne returns some meta data of document like response.
    return abortLaunch.ok === 1 && abortLaunch.nModified === 1;
}

const SPACEX_URL = "https://api.spacexdata.com/v4/launches/query";

async function saveSpaceXLaunches()
{
    console.log("Fetching SpaceX Data....");
    const response = await axios.post(SPACEX_URL, {
        query: {},
        options: {
            // This api uses pagination meaning load only 10 launches on single page, So we can either skip to another page
            // by using page: 3, or increase limit by limit: 20 to load 20 launches on single page, but we want whole data so using ->
            pagination: false,
            populate: [
            {
                path: 'rocket',
                select: {
                    name: 1
                }
            },
            {
                path: 'payloads',
                select: {
                    customers: 1
                }
            }
        ]
    }
    });

    if(response.status !== 200){
        console.log("Problem in Fetching Data");
        throw new Error("Something Wrong in Fetching SpaceX Launches API");
    }

    // axios return in data object that's why using data and spaceXapi return launches in docs: [array]
    const launchesDocs = response.data.docs;
    for(const launchDoc of launchesDocs){
        const payloads = launchDoc['payloads'];
        // Using FlatMap to return data in one lists.
        const customers = payloads.flatMap((payload) => {
            return payload['customers']; // payload have many customers array properties (for every customer it stores the value in array)
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission:  launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            customers,
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success']
        };

        await saveLaunch(launch);
    }
}

async function loadLaunchesData()
{
    const firstSpaceXLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if(firstSpaceXLaunch) console.log("Already Fetched Data...");
    else await saveSpaceXLaunches();
}

async function getAllLaunches(skip, limit){
    return await launches.find({}, {"_id": 0, "__v": 0})
                    .sort({flightNumber: 1}) // sorting in ascending order
                    .skip(skip) // mongoose method to skip n no of documents
                    .limit(limit); // mongoose method to return n no of documents
}

module.exports = {
    isLauchIdExists,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    loadLaunchesData
};