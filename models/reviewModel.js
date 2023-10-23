// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const validator = require('validator');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, `You can't save a review without a review!`],
      maxlenght: [
        5000,
        'A review must have less or equal then 5000 characters',
      ],
      minlenght: [250, 'A review must have more or equal then 250 characters'],
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
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;