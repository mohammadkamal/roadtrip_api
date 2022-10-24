let Admin = require('mongoose').model('Admin');
let validateToken = require('./validate_token');

module.exports = async function (req, res, next) {
    const userId = validateToken(req, res);

    let admin = await Admin.findOne({
        userId
    });

    if (admin) {
        if (admin.token === req.headers.authorization.split(' ')[1]) {
            next();
        }
        else {
            return res.status(401).send({ error: "expired-token" });
        }
    }
    else {
        return res.status(401).send({ error: "unauthorized" });
    }
}