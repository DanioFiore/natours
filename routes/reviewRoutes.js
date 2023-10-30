const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

/**
 * By default, every router have access to params of their specific route. With
 * mergeParams, now we can get access to the params of the other routes, for example, 
 * the params in the route /:tourId/reviews in tourRoutes file. The route in this case will 
 * hit the route '/' here
 */
const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.protect, authController.restrictTo('admin', 'user'), reviewController.setTourUserIds, reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );
module.exports = router;