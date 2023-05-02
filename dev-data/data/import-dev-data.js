const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
}).then(() => console.log('DB connection'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        process.exit();
    } catch(err) {
        console.log(err)
    }
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

// process.argv is an array that contains our terminal input, ex: node server.js --import, process.argv[0] is node ecc..
if(process.argv[2] === '--import') {
    importData();
} else if(process.argv[2] == '--delete') {
    deleteData();
}