const mongoose = require('mongoose');
const crypto = require('crypto');
let Schema = mongoose.Schema

let UserSchema = new Schema({
    fullName: { type: String },
    email: { type: String, match: [/.+@.+\..+/, 'Please fill a valid email address'] },
    display_name: { type: String },
    password: {
        type: String, validate: [
            function (password) {
                return password && password.length > 6;
            },
            'Password should be longer than 6 letters'
        ]
    },
    salt: { type: String },
    provider: { type: String, required: 'Provider is required' },
    provider_id: { type: String },
    provider_data: {},
    created: { type: Date, default: Date.now },
    token: { type: String },
    token_expiration: { type: Date },
    phone_number: { type: String },
    social_token: { type: String },
    trips: { type: Array },
    preferences: { type: Array }
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