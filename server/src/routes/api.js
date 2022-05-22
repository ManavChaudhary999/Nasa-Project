const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');

const express = require('express');

const api = express.Router();

api.use('/launches', launchesRouter);
api.use('/planets', planetsRouter);

module.exports = api;