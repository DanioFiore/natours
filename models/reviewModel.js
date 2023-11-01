// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const validator = require('validator');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, `You can't save a review without a review!`],
      maxlenght: [
        5000,
        'A review must have less or equal then 5000 characters',
      ],
      minlenght: [10, 'A review must have more or equal then 10 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'You must leave a rating!'],
      max: [5, 'You can assign max 5 stars!'],
      min: [1, 'You can assign min 1 star!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // by default we don't send that field to the client
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour!'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user!'],
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // to effectively see our virtual property, so a field that is not stored in the DB but calculated using some other value
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // With populate, we populate the guides in our tour document, where the guides are referenced and not embedded, so in the guides field we have the ids and we replace that id with the guide document.
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// STATIC FUNCTION
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // WE AGGREGATE THE RESULT. WE HAVE THE TOUR ID, AGGREGATE BY IT, SO USE $MATCH, GROUP BY TOUR, FOR EXAMPLE GROUP 4 REVIEWS OF THE TOUR ID 1, ADD 1 FOR EVERY RATING USING $SUM SO WE RETRIEVE THE NUMBER OF RATINGS AND THE RATINGS AVERAGE BY PASSING THE RATING FIELD
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId
      }
    },
    {
      $group: {
        _id: '$tour',
        nRating: {
          $sum: 1
        },
        avgRating: {
          $avg: '$rating'
        }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5, // default value when there are no reviews
    });
  }
}

reviewSchema.post('save', function() {
    // WITH THIS KEYWORD WE REFERENCE THE DOCUMENT, WITH CONSTRUCTOR WE REFERENCE THE MODEL THAT CREATE THE DOCUMENT AND THE MODEL CONTAINS THE FUNCTION
  this.constructor.calcAverageRatings(this.tour);
})

/**
 * Into pre query middleware,we have access to the query, into the post, no. Because the query is already executed. Into post also we cant use next. So we have to create a pre and post middleware, and pass through the review retrieved from the query. To do so, let's do that by saving the review into THIS
 */
// findByIdAndUpdate, findByIdAndDelete are a shorthand of mongoose of findOneAnd..
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); // r stands for review
  next();
})
reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;