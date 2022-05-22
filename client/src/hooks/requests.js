const BASE_URL = 'http://localhost:8000/v1';

async function httpGetPlanets() {
  const request = await fetch(`${BASE_URL}/planets`);
  return await request.json();
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const request = await fetch(`${BASE_URL}/launches`);
  const launches = await request.json();
  return launches.sort((a, b) => a.flightNumber - b.flightNumber);
}

async function httpSubmitLaunch(launch) {
  try{return await fetch(`${BASE_URL}/launches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(launch)
  });
  }
  catch(e){
    return{
      ok: false
    };
  }
}

async function httpAbortLaunch(id) {
  try{
    return await fetch(`${BASE_URL}/launches/${id}` , {
      method: 'delete'
    });
  }
  catch(error){
    return{
      ok: false
    };
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};