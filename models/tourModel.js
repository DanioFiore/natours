// this is the schema, where we define the documents property
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a name']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty']
  },
  ratingsAverage: {
    type: Number
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: {
    type: Number,
  },
  summary: {
    type: String,
    // trim works only for trim that remove all the white space at the beginning and at the end
    trim: true,
    required: [true, 'A tour must have a summary']
  },
  description: {
    type: String, 
    trim: true,
    required: [true, 'A tour must have a description']
  },
  imageCover: {
    // an image is basically a string
    type: String,
    required: [true, 'A tour must have an image']
  },
  // like this, we pass an ARRAY OF STRING
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false // by default we don't send that field to the client
  },
  startDates: [Date]
});

// this is the model that allows us to interact with the documents, we pass the name of the model and the schema. If we don't have a tour collection, it will be automatic created a tours(plural) collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
