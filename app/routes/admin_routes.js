let adminController = require('../controllers/admin_controller');

module.exports = function (app) {
    app.route('/api/admin/signup').post(adminController.signup);
    app.route('/api/admin/signin').post(adminController.signIn);
    app.route('/api/admins').get(adminController.isAuthorized, adminController.list);
    app.route('/api/admin/:adminId').get(adminController.isAuthorized, adminController.adminById);

    app.param('adminId', adminController.adminById);
};