const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.createReview = catchAsync(async (req, res, next) => {
    // ALLOW NESTED ROUTES
    // IF WE DON'T SPECIFY THE TOUR ID, SO RETRIEVE IT FROM THE URL
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newReview
        }
    });
})

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();

    res.status(200).json({
        stauts: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
})