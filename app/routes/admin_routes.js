let adminController = require('../controllers/admin_controller');
let adminAuth = require('../../config/admin_authorization');

module.exports = function (app) {
    app.route('/api/admin/signup').post(adminController.signup);
    app.route('/api/admin/signin').post(adminController.signIn);
    app.route('/api/admins').get(adminAuth, adminController.list);
    app.route('/api/admin/:adminId').get(adminAuth, adminController.read);

    app.param('adminId', adminController.adminById);
};