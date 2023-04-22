const app = require('./app');
const dotenv = require('dotenv');

// we installed dotenv that is used to read our config.env file
dotenv.config({path: './config.env'});
// used to see our environment variable(global variable)
// console.log(process.env);

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});