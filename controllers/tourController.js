const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // 1) Filtering
    // in JS we always create a reference to the object, but usign destructuring, we create a totally new object, a real copy
    const queryObj = { ...req.query };

    // here we want to exclude the pagination query parameter, because otherwise we will not have a result, given that we have no DB records that contains, for example, the page field
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // we can add in the query some [property], like gte(greater than) ecc, but the problem is that if we access to req.query we see, for example {duration: {gte :5} WITHOUT the $ that is important for mongoDB cause he used that in some query parameter, so the result that we want is {duration: {$gte :5} and here we replace every math with the same match but with $ in front of
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    /**
     * with sort method we sort our result from the query. Pay attention that mongoose accept the parameter separated by space, so we retrieve the query parameter from the url and split them by comma, and then join them by space.
     */
    if(req.query.sort) {
      // we take the query sort parameter from the url and separate them because mongoose accept them separated
      let sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // default
      query = query.sort('-createdAt');
    }

    // 3) Fields Limiting
    /**
     * with select, we choose what fields we send to the client, like price, difficulty.
     * Also we can put - in front of the field, and that means that we want to REMOVE that field so we didn't send it to the client.
     * The id field is by default always included
     */
    if(req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    };

    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error
    })
  }
  
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); // we access to id that is the /:id we put in the url
    // findById is a mongoose method, it's a shorthand of this Tour.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      tour: newTour,
    })
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error
    })
  }
  
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      // this will return to te client the new document
      new: true,
      // this will run again the validation in our schema
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
}

exports.deleteTour = async (req, res) => {
    try {
      await Tour.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: 'success',
      })
    } catch (error) {
      res.status(404).json({
        status: 'failed',
        message: error,
      });
    }
};

