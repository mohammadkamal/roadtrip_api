let userController = require('../controllers/user_controller');

module.exports = function (app) {
    app.route('/api/auth/signup').post(userController.signup);
    app.route('/api/auth/signin').post(userController.signIn);
    app.route('/api/auth/users').get(userController.list);
    app.route('/api/auth/users/:userId').get(userController.userById);

    app.param('userId', userController.userById);
};