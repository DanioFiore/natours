const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARE
app.use(morgan('dev'));

// json is a middleware used to parse the body
app.use(express.json());

// even a simple route is a middleware in express, the middlewares are executed in order in the code, so if i put a middleware up here, and don't specify a route, it will be applied to all the route, if we put it after the route (that is a middleware like i said before) it will not work
app.use((req, res, next) => {
    console.log('Middleware');
    next();
})

app.use((req, res, next) => {
    // now this property is accessible in ALL our routes
    req.requestTime = new Date().toISOString();
    next();
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


// 2) ROUTE HANDLERS
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    time: req.requestTime,
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

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  })
}

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

// 3) ROUTES
const tourRouter = express.Router();
app.use('/api/v1/tours', tourRouter);
// we can add a parameter to the url like :id and we can make it optional by adding a question mark :id?. We can access to req.params to see the url parameters
tourRouter.get('/:id', getTour);
// we can add together the request with the same url
// app.post('/api/v1/tours', addTour);
// app.get('/api/v1/tours', getAllTours);
tourRouter.route('/').get(getAllTours).post(addTour);

const userRouter = express.Router();
app.use('/api/v1/users', userRouter);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);



// 4) SERVER
const port = 3001;
app.listen(port, () => {
    console.log(`Running on port: ${port}`);
});

