const {isLauchIdExists, getAllLaunches, scheduleNewLaunch, abortLaunchById} = require('../../models/launches.model');
const {getPagination} = require("../pagination");

async function httpGetAllLaunches(req, res) {
    const {skip, limit} = getPagination(req.query);
    res.status(200).json(await getAllLaunches(skip, limit));
};

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if(!launch.destination || !launch.mission || !launch.rocket || !launch.launchDate){
        return res.status(400).json({
            error: "Launch property is not assigned"
        })
    }

    launch.launchDate = new Date(launch.launchDate);

    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: "Launch Date is Not Assigned Properly"
        })
    }

    await scheduleNewLaunch(launch);

    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res)
{
    const launchId = Number(req.params.id);

    const lauchExists = await isLauchIdExists(launchId);
    if(!lauchExists)
    {
        return res.status(400).json({
            error: "Lauch Doesnt Exist"
        });
    }

    const abortedLaunch = abortLaunchById(launchId);
    if(!abortedLaunch){
        return res.status(400).json({
            error: "Launch Not Aborted"
        });
    }
    return res.status(201).json({ok : true});
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
};