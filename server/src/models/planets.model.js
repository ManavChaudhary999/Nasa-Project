const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

function isHabitablePlanet(planet){
    return planet['koi_disposition'] === "CONFIRMED" 
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] <= 1.6 && planet['koi_prad'] > 0.5
        && planet['koi_period'] <= 365;
}

function loadPlanetsData(){
    return new Promise((resolve, reject) => { 
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true // allow data to be in key value pair instead of just value
        }))
        .on('data', async (data)=>{
            if(isHabitablePlanet(data))
                await savePlanets(data);
        })
        .on('error', (err)=>{
            console.error(err);
            reject(err);
        })
        .on('end', async ()=>{
            console.log(`${(await getAllPlanets())?.length} habitablePlanets found`);
            resolve();
        });
    });
}

// Saving To MondoDb Atlas
async function savePlanets(data)
{
    try
    {
        // This will create document but it will create or save planets every time the server loads.
        // planets.create({keplerName: data.kepler_name});

        // upsert = insert + update;
        await planets.updateOne(
            {
                keplerName: data.kepler_name // query for filter to find matching document
            },
            {
                keplerName: data.kepler_name // updated properties
            },
            {
                upsert: true // this will make sure that we will create data only if it not exists meaning cant find matching document then create.
            }
        );
    }
    catch(err)
    {
        console.error(err.message);
    }
}

// Getting From MondoDb Atlas
async function getAllPlanets()
{
    // No filtering condition becuase want all planets
    // Second argument means excluding properties, use falsy values to exclude
    return await planets.find({}, {"_id": false, "__v": false});
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
};