const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

// we installed dotenv that is used to read our config.env file
dotenv.config({path: './config.env'});
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


// this is the schema, where we define the documents property
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: Number,
  price: {
    type: Number,
    default: 10,
  },
})

// this is the model that allows us to interact with the documents, we pass the name of the model and the schema. If we don't have a tour collection, it will be automatic created a tours(plural) collection
const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'The park camper',
  rating: 4.7,
  price: 497
});

testTour.save().then(document => {
  console.log(document);
}).catch(error => {
  console.log(error);
});
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});