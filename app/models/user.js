const mongoose = require('mongoose');
const crypto = require('crypto');
let Schema = mongoose.Schema

const provider_types = ['local', 'google', 'apple', 'facebook', 'twitter'];

let UserSchema = new Schema({
    full_name: { type: String },
    email: {
        type: String,
        match: [/.+@.+\..+/, 'Please fill a valid email address'],
        required: 'E-mail is required'
    },
    password: {
        type: String,
        validate: [
            function (password) {
                return password && password.length > 6;
            },
            'Password should be longer than 6 letters'
        ],
        required: 'Password is required'
    },
    salt: { type: String },
    provider: { type: String, enum: provider_types, default: 'local' },
    provider_id: { type: String },
    provider_data: { type: Map },
    created: { type: Date, default: Date.now },
    token: { type: String },
    token_expiration: { type: Date },
    phone_number: { type: String },
    social_token: { type: String },
    // TODO: Reach a decision about it
    //trips: { type: [Schema.Types.ObjectId], ref: 'Trip' },
    tourism_prefs: { type: [String] }
});

UserSchema.methods.hashPassword = function (password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
};

UserSchema.pre('save', function (next) {
    if (this.password) {
        this.salt = new Buffer.from(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

UserSchema.methods.authenticate = function (password) {
    return this.password = this.hashPassword(password);
}

UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
    let possibleUsername = username + (suffix || '');

    this.findOne({
        username: possibleUsername
    }, function (error, user) {
        if (!error) {
            if (!user) {
                callback(possibleUsername);
            } else {
                return this.findUniqueUsername(username, (suffix || 0) + 1, callback)
            }
        } else {
            callback(null);
        }
    });
};

UserSchema.set('toJSON', { getters: true, virtuals: true });
mongoose.model('User', UserSchema);