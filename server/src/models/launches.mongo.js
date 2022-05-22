const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    launchDate: {
        type: Date,
        required: true,
    },
    rocket: {
        type: String,
        required: true,
    },
    mission: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
    },
    customers: [String],
    success: {
        type: Boolean,
        required: true,
    },
    upcoming: {
        type: Boolean,
        required: true,
    },
});

// Connect launches Schema with launches model
module.exports = mongoose.model('Launch', launchesSchema);