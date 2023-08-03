const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
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

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
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
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return new AppError('You are not logged in.', 401)
    }
    next();
})