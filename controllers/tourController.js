const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};


exports.getAllTours = async (req, res) => {
  try {
    // this chain methods works because we return this in every method
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
    const tours = await features.query;

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
    });
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

/**
 * Aggregation pipeline, is a MongoDB feature and we can use it with mongoose.
 * We can aggregate information, like the average rating and price
 */
exports.getTourStats = async (req, res) => {
  try {
    // we put in the aggregate an array of stages
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 },
        },
      },
      {
        // in the aggregation, give a new name to the fields, like numTours
        $group: {
          _id: { $toUpper: '$difficulty'}, // always a $ in front of the field name. In this case we aggregate by the difficulty. To a better read of the grouping, we use $toUpper MongoDB operator to have an uppercase difficulty
          numTours: { $sum: 1 }, // we sum 1 every time enter this function, so we have a total of our tours
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      // after aggregation, we will use the new fields name
      {
        // we sort by average price previously aggregated and use 1 for ascending
        $sort: { avgPrice: 1 }
      },
      {
        // our id is now the difficulty, in this case we take the difficulty that is not equal to easy
        // $match: { _id: { $ne: 'EASY' } },
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error.message,
      error: error,
      stack: error.stack
    });
  }
}
