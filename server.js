const mongoose = require('mongoose');
const dotenv = require('dotenv');

// we installed dotenv that is used to read our config.env file
dotenv.config({path: './config.env'});

const app = require('./app');

// used to see our environment variable(global variable)
// console.log(process.env);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(connection.connections);
    console.log('DB connection successfull');
  });

app.listen(process.env.PORT, () => {
  console.log('Server running on port ' + process.env.PORT);
})