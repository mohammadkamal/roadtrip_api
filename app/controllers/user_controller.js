const jsonwebtoken = require('jsonwebtoken');
const validateToken = require('../../config/validate_token');
let config = require('../../config/config');
let User = require('mongoose').model('User');
let errorGetter = require('../../config/error_getter');

exports.signup = async function (req, res) {
    let user = new User(req.body);
    let email = req.body.email;
    const oldUser = await User.findOne({ email });

    if (oldUser) {
        return res.status(409).send({
            error: "email-already-in-use"
        });
    }

    user.provider = 'local';

    let token = jsonwebtoken.sign({ user_id: user.id },
        config.sessionSecret,
        { expiresIn: 3600 * 24 * 10 }
    );

    user.token = token;

    user.save(function (err) {
        if (err) {
            return res.status(400).send({
                error: errorGetter(err)
            });
        } else {
            return res.status(201).json(user);
        }
    });
}

exports.signIn = async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if (!(email && password)) {
        return res.status(400).send({ error: "missing-parameters" });
    }

    const user = await User.findOne({ email });

    if (user && user.authenticate(password)) {
        let token = jsonwebtoken.sign({ user_id: user.id },
            process.env.NODE_ENV,
            {}
        );

        user.token = token;

        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    error: errorGetter(err)
                });
            } else {
                return res.status(200).json(user);
            }
        });

    }
    else {
        return res.status(400).send({ error: "invalid-credentials" });
    }
}

exports.list = async function (req, res) {
    User.find().sort('-created')
        .exec(function (err, users) {
            if (err) {
                return res.status(400).send({ error: errorGetter(err) });
            } else {
                return res.status(200).json(users);
            }
        });
};

exports.userById = async function (req, res, next, id) {
    User.findById(id)
        .exec(function (err, user) {
            if (err) {
                return res.status(400).send({ error: errorGetter(err) });
            } else {
                req.user = user;
                next();
            }
        });
};

exports.read = function (req, res) {
    return res.status(200).json(req.user);
}

exports.isUserAuthorized = async function (req, res, next) {
    const userId = validateToken(req, res);
    var user = req.user;

    if (userId === user.id) {
        next();
    } else {
        return res.status(401).send({ "error": "unauthorized" });
    }
}

exports.delete = async function (req, res) {
    var user = req.user;

    user.remove(function (err) {
        if (err) {
            return res.status(400).send({ error: errorGetter(err) });
        } else {
            return res.status(200).json(user);
        }
    });
}
