const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // ALLOW NESTED ROUTES
  // IF WE DON'T SPECIFY THE TOUR ID, SO RETRIEVE IT FROM THE URL
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
}
exports.createReview = factory.createOne(Review);

exports.getAllReviews = catchAsync(async (req, res, next) => {
    // IN THIS WAY, WE SET THE FILTER OBJ, IF WE FIND A TOURID IN THE URL, SO WE RETRIEVE ONE TOUR, IF WE DIDN'T FIND IT, THE FILTER OBJ WILL BE EMPTY ALL THE FIND METHOD WILL RETRIEVE ALL THE REVIEWS
    let filter = {};
    if (req.params.tourId) filter = {tour: req.params.tourId};
    const reviews = await Review.find(filter);

    res.status(200).json({
        stauts: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
})

// INSTEAD OF HAVE A DELETE FUNCTION EXPLICITY FOR THIS CONTROLLER, WE CREATE A DELETE FUNCTION GLOBAL, AND ALL WE NEED TO DO Is PASS THE MODEL NAME
exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);