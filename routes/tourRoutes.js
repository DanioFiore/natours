const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// this is a param middleware that it only function for the url with the specified parameter. Here we can also have the val variable that is the value of our parameter
// router.param('id', tourController.checkID);
// we can add a parameter to the url like :id and we can make it optional by adding a question mark :id?. We can access to req.params to see the url parameters
router.route('/:id').get(tourController.getTour).delete(tourController.deleteTour).patch(tourController.updateTour);
// we can add together the request with the same url
// router.post('/api/v1/tours', addTour);
// router.get('/api/v1/tours', getAllTours);
// router.route('/').get(tourController.getAllTours).post(tourController.checkBody, tourController.addTour);
router.route('/').get(tourController.getAllTours).post(tourController.createTour);

module.exports = router;