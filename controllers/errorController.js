const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {

  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {

  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. PLease use another value.`;

  return new AppError(message, 500);
};

const handleValidationErrorDB = err => {

  const errors = Object.values(err.errors).map(el = el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {

  // Operational (user enter invalid data, hit a route that not exist..), trusted error will be send to the client, if it's a third party error we don't send it
  if(err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {

    console.log('ERROR', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    })
  }
}

module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // * we separate the error response, if we are in development mode we want more information, if we are in production, we have to give less information to the client
  if(process.env.NODE_ENV === 'development') {
    
    sendErrorDev(err, res);
  } else if(process.env.NODE_ENV === 'production') {
    let error = null;
    if(err.name === 'CastError') error = handleCastErrorDB(err);
    if(err.code === 11000) error = handleDuplicateFieldsDB(err);
    if(err.name === 'ValidationError') error = handleValidationErrorDB(err);

    sendErrorProd(error, res);
  }
};