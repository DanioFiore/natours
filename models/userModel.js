const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true, // transform the email in lowercase
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // ! this only works on SAVE and CREATE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        },
    },
});

userSchema.pre('save', async function(next) {
    // ONly run this function if password was actually modified
    if(!this.isModified('password')) return next();

    // encrypt the password, with the second param we indicate how much power the computer will use for this operation. 12 is ok as a cost. More cost = more time but more complexity of the password
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the password confirm field, we don't need it
    this.passwordConfirm = undefined;
})

const User = mongoose.model('User', userSchema);

module.exports = User;