const Tour = require('./../models/tourModel');

exports.getAllTours = (req, res) => {

};

exports.getTour = (req, res) => {

};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      tour: newTour,
    })
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: 'invalid data sent'
    })
  }
  
};

exports.deleteTour = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'not available yet'
    })
};

