const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
    if (val > tours.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'ID not found',
      });
    }
    next();
}

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    time: req.requestTime,
    data: {
      tours: tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find((el) => el.id == req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.addTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'not available yet'
    })
};

