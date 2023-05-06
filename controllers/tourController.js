const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // in JS we always create a reference to the object, but usign destructuring, we create a totally new object, a real copy
    const queryObj = { ...req.query };

    // here we want to exclude the pagination query parameter, because otherwise we will not have a result, given that we have no DB recors that contains, for example, the page field
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    const tours = await Tour.find(queryObj);
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy'
    // }); // find() retrieve all the results in that collection, but we can pass an object to filter the results

    // we can have access to the query using req.query
    // or we can use mongoose to make filtering, we can do that because the find() method will return an object type query
    // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

    // we can add in the query some [property] to our query, like gte(greater than) ecc, but the problem is that if we access to req.query we see, for example {duration: {gte :5} WITHOUT the $ that is important for mongoDB cause he used that in some query parameter, so the result that we want is {duration: {$gte :5} and here we replace every math with the same match but with $ in front of
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

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

