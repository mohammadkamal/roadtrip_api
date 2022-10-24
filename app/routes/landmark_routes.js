let landmarkController = require('../controllers/landmark_controller');
let isAdmin = require('../../config/admin_authorization');
let requiresLogin = require('../../config/user_authentication');

module.exports = function (app) {
    app.route('/api/landmark').post(requiresLogin, landmarkController.create);
    app.route('/api/landmarks').get(landmarkController.list);
    app.route('/api/landmarks/:landmarkId').get(landmarkController.read);

    app.param('landmarkId', landmarkController.landmarkByID);
};