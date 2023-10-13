const {promisify} = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  /**
   * Send the token back with cookie to have a more secure method. 
   * 1st parameter, cookie name
   * 2nd our token
   * 3rd the data of the cookie, essentially an expiring date that is from now to 90 days formatted in milliseconds
   * secure allows to use HTTPS, and httpOnly grants to send it back only for http requests
   * But now we are not in HTTPS, so we want to set the secure property only when we are in production mode
   */

  const cookieObject = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if(process.env.NODE_ENV === 'production') cookieObject.secure = true;

  res.cookie('jwt', token, cookieObject);

  // REMOVE THE PASSWORD FROM THE OUTPUT
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync( async (req, res, next) => {
    // * before destructuring: const email = req.body.email / const password = req.body.password, it will give an ES6 error
    const {email, password} = req.body;

    if(!email || !password) {
        // use the return statement so we make sure that this function ends here
        return next(new AppError('Please provide an email and password', 400));
    }

    // * we use + to select a field that is select: false in the model
    const user = await User.findOne({email}).select('+password');

    if (!user || !(await user.comparePasswords(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
});

exports.protect = catchAsync( async (req, res, next) => {
  // 1) Check the token
  /**
   * Normally, the JWT will be in the header, we can access to it with the autorization voice, and it's value will be splitted in 2:
   * and will start with Bearer, followed by the token itself.
   * headers; {
   *  'authorization': 'Bearer tokenonrewgoiwj209ur90324390ejoiqd932'
   * }
   *
   */
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in.', 401));
  }

  // 2) Verification token. Check if the jwt payload isn't manipulated by 3 parts
  /**
   * Promisify is used to await a promise of a function and then execute the function
   * decoded will contain the user id
   */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check the user still exists, for example, someone stole the JWT and try to have access to a deleted account
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists')
    );
  }

  // 4) Check if user change the password after an issue
  // iat is the timestamp
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(new AppError('User recently changed the password, please log in again', 401));
  // }
  
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
})

/**
 * We can't pass parameters to a middleware, but like this we can user the rest method ... to take the argument and return our middleware * * * *function
 * 
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new AppError('You have not the permissions to perform this actions', 403));
    }

    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user base on POSTed email
  const user = await User.findOne({ email: req.body.email });
  
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  // 2) Generate the random token
  const resetToken = user.createPasswordResetToken();

  // we have to save because in createPasswordResetToken() we had updated the passwordResetToken field and now we have to save it but disabling the validations
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore these email!.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (Valid for 10 mins)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later'), 500);
  }
})

exports.resetPassword = catchAsync( async(req, res, next) => {

  // 1) GET THE USER BASED ON THE TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ 
    passwordResetToken: hashedToken, 
    passwordResetExpires: { $gt: Date.now() } 
  });

  // 2) IF THE TOKEN IS NOT EXPIRED AND THERE IS USER, SET THE NEW PASSWORD
  if(!user) {
    return next(new AppError('Token is invalid or expired!', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) UPDATE CHANGEPASSWORDAT PROPERTY FOR THE USER

  // 4) LOG THE USER IN, SEND THE JWT
  createSendToken(user, 200, res);
})

exports.updatePassword = catchAsync( async(req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  console.log(req.body.passwordCurrent);
  // 2) Check if POSTed current password is correct
  if (!(await user.comparePasswords(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
})