const MONGO_URL = process.env.MONGO_URL;

const mongoose = require('mongoose');

// using once instead of on because only want this event to trigger once
mongoose.connection.once('open', () => {
    console.log('MongoDb Connection Ready');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongodbConnect(){
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        // useFindAndModify: false,
        // useCreateIndex: true,
        useUnifiedTopology: true
    });
}

async function mongodbDisconnect(){
    await mongoose.disconnect();
}

module.exports = {mongodbConnect, mongodbDisconnect};
