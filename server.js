const mongoose = require('mongoose');
const dotenv = require('dotenv');

// handling an uncaught exception
process.on('uncaughtException', err => {

  process.exit(1); // 1 indicates an unhandled rejection
})

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

const server = app.listen(process.env.PORT, () => {
  console.log('Server running on port ' + process.env.PORT);
});

// if we have a problem with the server, we have to handle that error because if the server didn't work, we can't use our error middleware
// handling an unhandled rejection
process.on('unhandledRejection', err => {
  
  server.close(() => {

    process.exit(1); // 1 indicates an unhandled rejection
  });
});

