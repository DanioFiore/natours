const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());


const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getTour = (req, res) => {
  const tour = tours.find((el) => el.id == req.params.id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'ID not found',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const addTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
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

// we can add a parameter to the url like :id and we can make it optional by adding a question mark :id?. We can access to req.params to see the url parameters
app.get('/api/v1/tours/:id', getTour);
// we can add together the request with the same url
// app.post('/api/v1/tours', addTour);
// app.get('/api/v1/tours', getAllTours);
app.route('/api/v1/tours').get(getAllTours).post(addTour);


const port = 3001;
app.listen(port, () => {
    console.log(`Running on port: ${port}`);
});

