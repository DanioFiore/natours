const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// we can add a parameter to the url like :id and we can make it optional by adding a question mark :id?. We can access to req.params to see the url parameters
router.route('/:id').get(tourController.getTour);
// we can add together the request with the same url
// app.post('/api/v1/tours', addTour);
// app.get('/api/v1/tours', getAllTours);
router.route('/').get(tourController.getAllTours).post(tourController.addTour);

module.exports = router;