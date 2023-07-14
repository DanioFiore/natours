// this is the schema, where we define the documents property
const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  slug: String,
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
}, {
  toJSON: { virtual: true }, // to effectively see our virtual property. Every time our data will be outputted as json we call virtual
  toObject: { virtual: true }
});

/**
 * we use virtual to have a simply datas that will not be saved into the db, we pass to virtual the name of the data that we want to give
 * virtual will be called every time we take out some data from our db. To the getter method we pass a regular function (not arrow)
 * and we use a regular function when we want to use the this keyword, so everywhere in mongoose
 * that we will set the return that will be the value of durationWeeks field. In this case, we calculate that by divide by 7 the total
 * duration. REMEMBER to call it in the SCHEMA.
 * We can't use virtual property in a query because is not part of a db
 */
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

/**
 * MONGOOSE DOCUMENT MIDDLEWARE: it runs before an event was triggered, in this case, .save() and .create()
 * If we use 'this', that will point to the actual document that is actually process, the document that is saving
 * so when we call a save endpoint of the tour, we can access to the tour before it will be saved in the db
 */
// tourSchema.pre('save', function(next) {
//   this.slug = slugify(this.name, {lower: true}); // remember to add to the schema
//   next();
// });

/**
 * post will be executed after the triggered event, so after a save in the db, and we have access to the doc
 */
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
// });

// this is the model that allows us to interact with the documents, we pass the name of the model and the schema. If we don't have a tour collection, it will be automatic created a tours(plural) collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
