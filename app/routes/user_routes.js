let userController = require('../controllers/user_controller');
let isAdmin = require('../../config/admin_authorization');
let requiresLogin = require('../../config/user_authentication');

module.exports = function (app) {
    app.route('/api/auth/signup').post(userController.signup);
    app.route('/api/auth/signin').post(userController.signIn);
    app.route('/api/auth/users').get(isAdmin, userController.list);
    app.route('/api/auth/users/:userId').get(userController.read).delete(requiresLogin,
        userController.isUserAuthorized, userController.delete).delete(isAdmin,
            userController.delete);

    app.param('userId', userController.userById);
};