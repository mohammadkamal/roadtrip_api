const { default: mongoose } = require("mongoose");
let config = require('./config');

module.exports = function () {
    let db = mongoose.connect(config.db);

    require('../app/models/user');
    require('../app/models/admin');
    require('../app/models/landmark');
    require('../app/models/landmark_approvement');
    require('../app/models/trip_program');

    return db;
}