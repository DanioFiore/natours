const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

// node ./dev-data/data/import-dev-data.js --delete TO DELETE ALL DATAS
// node ./dev-data/data/import-dev-data.js --import TO IMPORT ALL DATAS
// REMEMBER TO COMMENT IN THE USER MODEL THE 2 PRE MIDDLEWARE OF ENCRYPTING PASSWORD
dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
}).then(() => console.log('DB connection'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false }); // URN OFF PASSWORD VALIDATION
        await Review.create(reviews);
        process.exit();
    } catch(err) {
        console.log(err)
    }
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
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