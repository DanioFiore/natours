const crypto = require('crypto'); // no need to install, already in node_modules
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// IF WE IMPORT THE DATA FROM import-dev-data.js, WE HAVE TO DISABILITATE THESE 2 MIDDLEWARE OF ENCRYPT PASSWORD
userSchema.pre('save', async function(next) {
    // ONly run this function if password was actually modified
    if(!this.isModified('password')) return next();

    // encrypt the password, with the second param we indicate how much power the computer will use for this operation. 12 is ok as a cost. More cost = more time but more complexity of the password
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the password confirm field, we don't need it
    this.passwordConfirm = undefined;
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) {
        return next();
    }

    // PUT 1SEC IN THE PAST THE TIMESTAMP BECAUSE SOMETIMES THE JWT TAKE TIME TO BE SAVED IN THE DB
    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/, function(next) {
    // at this point we had a lot of records without the active field. So we use active $not e qual to false, so we retrieve all the records that doesn't have that field
    this.find({active: {$ne: false}});

    next();
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

userSchema.methods.createPasswordResetToken = function() {
    // the token has to be a random string and send it back to the user
    const resetToken = crypto.randomBytes(32).toString('hex');

    // hash it so we can save it into DB and prevent hacking
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken}, this.passwordResetToken);

    // set an expire of 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;