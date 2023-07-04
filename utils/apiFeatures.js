class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    /**
     * 1) Filtering
     * in JS we always create a reference to the object, but usign destructuring, we create a totally new object, a real copy
     */
    const queryObj = { ...this.queryString };
    // here we want to exclude the pagination query parameter, because otherwise we will not have a result, given that we have no DB records that contains, for example, the page field
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // we can add in the query some [property], like gte(greater than) ecc, but the problem is that if we access to req.query we see, for example {duration: {gte :5} WITHOUT the $ that is important for mongoDB cause he used that in some query parameter, so the result that we want is {duration: {$gte :5} and here we replace every math with the same match but with $ in front of
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));

    return this; // return the entire object, so we can chain other methods
  }

  sort() {
    // 2) Sorting
    /**
     * with sort method we sort our result from the query. Pay attention that mongoose accept the parameter separated by space, so * we retrieve the query parameter from the url and split them by comma, and then join them by space.
     */
    if (this.queryString.sort) {
      // we take the query sort parameter from the url and separate them because mongoose accept them separated
      let sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // default
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3) Fields Limiting
    /**
     * with select, we choose what fields we send to the client, like price, difficulty.
     * Also we can put - in front of the field, and that means that we want to REMOVE that field so we didn't send it to the client.
     * The id field is by default always included
     */
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    /**
     * The skip method are the number of records that we want to skip, and the limit is the number of recors we want to
     * display per page. For example, if we have 30 records, and we want limit 10, if we are in page 2, we want to skip
     * 10 records to see records from 11 to 20.
     */
    const page = this.queryString.page * 1 || 1; // * 1 is used to easly convert a string to a number
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;