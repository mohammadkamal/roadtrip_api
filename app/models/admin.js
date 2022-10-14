const mongoose = require('mongoose');
const crypto = require('crypto');
let Schema = mongoose.Schema

let AdminSchema = new Schema({
  username: { type: String },
  password: {
    type: String, validate: [
      function (password) {
        return password && password.length > 6;
      },
      'Password should be longer than 6 letters'
    ]
  },
  salt: { type: String },
  created: { type: Date, default: Date.now },
  token: { type: String },
  tokenExpiration: { type: Date }
});

AdminSchema.methods.hashPassword = function (password) {
  return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
};

AdminSchema.pre('save', function (next) {
  if (this.password) {
    this.salt = new Buffer.from(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

AdminSchema.methods.authenticate = function (password) {
  return this.password = this.hashPassword(password);
}

AdminSchema.statics.findUniqueUsername = function (username, suffix, callback) {
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

AdminSchema.set('toJSON', { getters: true, virtuals: true });
mongoose.model('Admin', AdminSchema);