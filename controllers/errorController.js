const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

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

    sendErrorProd(err, res);
  }

};