class AppError extends Error {
    constructor(message, statusCode) {
        // * Remember that we use super() when we extend a parent class, and in this case we pass only message that is the only parameter that have the built-in error Class
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;