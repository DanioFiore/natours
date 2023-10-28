const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
    
  })
  return newObj;
}
exports.getAllUsers = catchAsync( async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync( async(req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for update passwords. Please use /updateMyPassword',
        400
      )
    );
  }

  // 2) Filter out unwanted fields name that are not allowed
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
})

exports.deleteMe = catchAsync( async(req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false});

  res.status(204).json({
    status: 'success',
    data: null
  })
})

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

// DO NOT UPDATE PASSWORD WITH THIS! BECAUSE WITH FINDBYIDANDUPDATE, THE VALIDATORS DONT WORK
exports.updateUser = factory.updateOne(User);

// INSTEAD OF HAVE A DELETE FUNCTION EXPLICITY FOR THIS CONTROLLER, WE CREATE A DELETE FUNCTION GLOBAL, AND ALL WE NEED TO DO Is PASS THE MODEL NAME
exports.deleteUser = factory.deleteOne(User);
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Route not yet defined',
//   });
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};
