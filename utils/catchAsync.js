/**
 * Create this catchAsync to avoid the rendundant try/catch block, so we catch the async error like this.
 * - wrap our async function in our new catchAsyng function
 * - catchAsync will return an anonymous function witch will then be assigned to
 * - so, is catchAsync function that is called when the endpoint is hitten
 * - that's why catchAsync have (req, res, next)
 * - in the return statement, will be called the function that we passed to catchAsync, so fn
 * - our async function into createTour, will return a promise, and in case of error, we catch the error in catchAsync
 * - we use next, and the error goes directly in our global error hanlder
 * - this is how asyncronus code works
 *
 */

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
