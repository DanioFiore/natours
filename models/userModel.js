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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
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
    passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
    // ONly run this function if password was actually modified
    if(!this.isModified('password')) return next();

    // encrypt the password, with the second param we indicate how much power the computer will use for this operation. 12 is ok as a cost. More cost = more time but more complexity of the password
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the password confirm field, we don't need it
    this.passwordConfirm = undefined;
})

/**
 * Instance method, a method that will be available for every instance of this document, in this case every user. We need to compare with bcrypt
 * because the user that login insert a password that is not hashed, like the password we retrieve from the DB, so if we didn't use bcrypt, we 
 * can never compare the two passwords
 * 
 */
userSchema.methods.comparePasswords = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp;
    }

    // false meant NOT changed
    return false;
}

const User = mongoose.model('User', userSchema);

module.exports = User;