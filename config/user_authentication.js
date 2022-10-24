let User = require('mongoose').model('User');
let validateToken = require('./validate_token');

module.exports = async function (req, res, next) {
    const userId = validateToken(req, res);

    let user = await User.findOne({ userId });

    if (user) {
        if (user.token === req.headers.authorization.split(' ')[1]) {
            return next();
        }
        else {
            return res.status(401).send({ error: "expired-token" });
        }
    }
    else {
        return res.status(401).send({ error: "user-not-found" });
    }
}