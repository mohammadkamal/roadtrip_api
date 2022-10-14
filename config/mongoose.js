const { default: mongoose } = require("mongoose");
let config = require('./config');

module.exports = function () {
    let db = mongoose.connect(config.db);

    require('../app/models/user');
    require('../app/models/admin');

    return db;
}