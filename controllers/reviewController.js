const Review = require('./../models/reviewModel');
// const AppError = require('./../utils/appError');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // ALLOW NESTED ROUTES
  // IF WE DON'T SPECIFY THE TOUR ID, SO RETRIEVE IT FROM THE URL
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
}
exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);

// INSTEAD OF HAVE A DELETE FUNCTION EXPLICITY FOR THIS CONTROLLER, WE CREATE A DELETE FUNCTION GLOBAL, AND ALL WE NEED TO DO Is PASS THE MODEL NAME
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);