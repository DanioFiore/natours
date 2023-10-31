/**
 * In the factory, we create a function that return another function, for example, create
 * a delete function for EVERY controller
 */
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require ('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }

    res.status(204).json({
      status: 'success',
    });
});

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // this will return to te client the new document
      new: true,
      // this will run again the validation in our schema
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
});

exports.createOne = (Model) =>
catchAsync(async (req, res, next) => {
  const newDoc = await Model.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newDoc,
  });
})

exports.getOne = (Model, populateOpt) =>
catchAsync(async (req, res, next) => {
  // findById is a mongoose method, it's a shorthand of this Tour.findOne({_id: req.params.id})
  let query = Model.findById(req.params.id);
  if (populateOpt) query = query.populate(populateOpt);
  const doc = await query;
  console.log(doc);

  if (!doc) {
    return next(new AppError('No doc found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
})

exports.getAll = (Model) =>
catchAsync(async (req, res, next) => {
  // TO ALLOW FOR NESTET GET REVIEWS ON TOUR
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  // this chain methods works because we return this in every method
  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    // GIVES US ALL THE QUERY INFO, LIKE HOW MANY DOC ARE SCANNED
    //  const doc = await features.query.explain();
  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc
    },
  });
});

