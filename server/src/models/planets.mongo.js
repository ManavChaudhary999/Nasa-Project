const mongoose = require('mongoose');

const planetsSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true,
    }
});

// Connect planets Schema with planets model
module.exports = mongoose.model('Planet', planetsSchema);