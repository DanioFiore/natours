const express = require('express');
const tourController = require('../controllers/tourController');
const catchAsync = require('../utils/catchAsync');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');


const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

// this is a param middleware that it only function for the url with the specified parameter. Here we can also have the val variable that is the value of our parameter
// router.param('id', tourController.checkID);
// we can add a parameter to the url like :id and we can make it optional by adding a question mark :id?. We can access to req.params to see the url parameters
router
  .route('/:id')
  .get(tourController.getTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide', 'user'), tourController.deleteTour)
  .patch(tourController.updateTour);

// we can add together the request with the same url
// router.post('/api/v1/tours', addTour);
// router.get('/api/v1/tours', getAllTours);
// router.route('/').get(tourController.getAllTours).post(tourController.checkBody, tourController.addTour);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

// NESTED ROUTE
router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    reviewController.createReview
  );


module.exports = router;