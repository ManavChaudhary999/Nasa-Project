// This is our express handling file seprating it from http server file.
// Using both because of more funcitonality
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // third party module used to log every request, so we dont have to write our own middleware.

const api = require('./routes/api');

const app = express();

app.use(cors({origin: 'http://localhost:3000'}));
app.use(morgan('combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Versioning our API
app.use('/v1', api);

// we dont have to use this as all static files will serve on "/" automatically
app.get("/", (req, res) => {
    res.send(path.join(__dirname, '..', 'public', 'index.html'));
});


module.exports = app;