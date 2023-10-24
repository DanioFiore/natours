// this is the schema, where we define the documents property
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      // * simple built-in mongoose validation
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // * validator.js
      validate: {
        validator: (val) => validator.isAlpha(val, ['en-US'], { ignore: ' ' }),
        message: 'Tour name must only contain characters',
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a name'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        // * this is the real validator syntax, we can't use the shortand here because we have an enum
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // * custom validator, we want to check if the price discount is less than the real price
      validate: {
        validator: function (val) {
          // * this function will not work with the update method. Only when creating a new document. The this keyword point to the actual document
          return val < this.price; // * it return true or false, if false, the validator fails
        },
        message: 'Discount price ({VALUE}) should be below the regular price', // * in ({VALUE}) we have the actual price
      },
    },
    summary: {
      type: String,
      // trim works only for trim that remove all the white space at the beginning and at the end
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      // an image is basically a string
      type: String,
      required: [true, 'A tour must have an image'],
    },
    // like this, we pass an ARRAY OF STRING
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // by default we don't send that field to the client
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON to specify geospecial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // Expect an arrya of numbers
      address: String,
      description: String,
    },
    // HERE WE USE AN ARRAY TO EMBED THE STARTLOCATIONS
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // reference user to the tour
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // to effectively see our virtual property, so a field that is not stored in the DB but calculated using some other value
    toObject: { virtuals: true },
  }
);

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
 * Virtual populate allows us to connect 2 models without have an array of ids as a field.
 * For example in this case, instead of write the review field in the model, we use this virtual
 * populate so, in the review field, we reference the Review model, a foreignField that is
 * the name of this model in the review model, so 'tour', and the localField that is the 
 * record's _id.
 * To make this work, we have to populate into the function we desire, passing 'reviews', for
 * example, in getTour
 */
tourSchema.virtual('reviews', {
  ref: 'Review',
  // THIS IS THE FIELD IN THE REVIEWMODEL
  foreignField: 'tour',
  localField: '_id'
})

/**
 * MONGOOSE DOCUMENT MIDDLEWARE: it runs before an event was triggered, in this case, .save() and .create()
 * If we use 'this', that will point to the actual document that is actually process, the document that is saving
 * so when we call a save endpoint of the tour, we can access to the tour before it will be saved in the db
 */
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true}); // remember to add to the schema
  next();
});

// Save also the guides complete documents, so embed the data. That is only an examble if we want to save it to the DB, but now we use referencing and not embedding
// tourSchema.pre('save', async function(next) {
//   // it will be an array of promises that will run with Promise.all
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

/**
 * post will be executed after the triggered event, so after a save in the db, and we have access to the doc
 */
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
// });

/**
 * MONGOOSE QUERY MIDDLEWARE: here we execute a function before or after a query, not a document.
 * In this case we listen to the find event, so this function will be executed BEFORE a query that starts with find (findOne, findOneAndDelete) method will be launched, like in our
 * tourController.getAllTours
 */
tourSchema.pre(/^find/, function(next) {
  // * with this keyword we reference to the actual query, so we can use all the query method
  this.find({secretTour: { $ne: true }});

  // * the query is like a regular object so we can give to it a property
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  // With populate, we populate the guides in our tour document, where the guides are referenced and not embedded, so in the guides field we have the ids and we replace that id with the guide document.
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});
/**
 * Post query middleware will be executed after the query and we can have access to the document that the query returned
 */
tourSchema.post(/^find/, function(docs, next) {

  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});


/**
 * AGGREGATION WIDDLEWARE: like the document and query middleware, but we can have access to the actual aggregation object with the this keyword
 */
tourSchema.pre('aggregate', function(next) {

  this.pipeline().unshift({ $match: {secretTour: { $ne: true }} })
  console.log(this.pipeline()); // * the pipeline method is used to have access to the array we passed to the aggregation object ($match, $group, $sort)
  next();
});

// this is the model that allows us to interact with the documents, we pass the name of the model and the schema. If we don't have a tour collection, it will be automatic created a tours(plural) collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
