const Tour = require('./../models/tourModel');

exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price',
        })
    }
    next();
};

exports.getAllTours = (req, res) => {

};

exports.getTour = (req, res) => {

};

exports.addTour = (req, res) => {

};

exports.deleteTour = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'not available yet'
    })
};

