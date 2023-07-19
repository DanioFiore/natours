const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};


exports.getAllTours = catchAsync(async (req, res, next) => {
  // this chain methods works because we return this in every method
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id); // we access to id that is the /:id we put in the url
  // findById is a mongoose method, it's a shorthand of this Tour.findOne({_id: req.params.id})

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    tour: newTour,
  });
  
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    // this will return to te client the new document
    new: true,
    // this will run again the validation in our schema
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return next(new AppError('No tour found with that id', 404));
    }

    res.status(204).json({
      status: 'success',
    });
});

/**
 * Aggregation pipeline, is a MongoDB feature and we can use it with mongoose.
 * We can aggregate information, like the average rating and price
 */
exports.getTourStats = catchAsync(async (req, res, next) => {
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
        _id: { $toUpper: '$difficulty' }, // always a $ in front of the field name. In this case we aggregate by the difficulty. To a better read of the grouping, we use $toUpper MongoDB operator to have an uppercase difficulty
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
      $sort: { avgPrice: 1 },
    },
    {
      // our id is now the difficulty, in this case we take the difficulty that is not equal to easy
      // $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      /**
       * $unwind desructure an array and return a tour for each element of that array, for example we have a tour with an array of 3
       * dates. It will return 3 same Tour but with different dates
       */
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStats: { $sum: 1 },
        tours: { $push: '$name' }, // use $push to create an array and in this case we push the name field of the tours
      },
    },
    {
      $addField: { month: '$_id' }, // add a new field, in the brackets we put the name of the new field and wich field we want to 'copy'
    },
    {
      // select the fields name, with 0 it will not showing up, instead with 1 it will showing up
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStats: -1 }, // descending
    },
    {
      $limit: 12, // limit the output we will see
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
