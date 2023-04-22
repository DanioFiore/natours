const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARE
// we use morgan only if we are in development mode
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(morgan('dev'));
// json is a middleware used to parse the body
app.use(express.json());
// this middleware i used for the static file, so now we can access to our html. Under the hood, happens that when we searh in our browser 127.0.0.1:3001/overview.html, express start to search for this url, and when he don't find that, go in the public folder and search for the overview.html file
app.use(express.static(`${__dirname}/public`));

// even a simple route is a middleware in express, the middlewares are executed in order in the code, so if i put a middleware up here, and don't specify a route, it will be applied to all the route, if we put it after the route (that is a middleware like i said before) it will not work
app.use((req, res, next) => {
    next();
})

app.use((req, res, next) => {
    // now this property is accessible in ALL our routes
    req.requestTime = new Date().toISOString();
    next();
})

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
