const jsonwebtoken = require('jsonwebtoken');
const validateToken = require('../../config/validate_token');
let config = require('../../config/config');
let User = require('mongoose').model('User'),
    Admin = require('mongoose').model('Admin');

var getErrorMessage = function (err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'username-already-in-use';
                break;
            default:
                message = err.message;
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }

    return message;
};

exports.signup = async function (req, res, next) {
    let user = new User(req.body);

    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;

    if (!email || !username || !password) {
        return res.status(400).send({ error: "missing-parameters" });
    }

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
                error: getErrorMessage(err)
            });
        } else {
            return res.status(201).json(user);
        }
    });
}

exports.signIn = async function (req, res, next) {
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
                    error: getErrorMessage(err)
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
    const userId = validateToken(req, res);

    let admin = await Admin.findOne({
        userId
    });

    if (admin) {
        if (admin.token === req.headers.authorization.split(' ')[1]) {
            User.find().sort('-created')
                .exec(function (err, users) {
                    if (err) {
                        return res.status(400).send({ error: getErrorMessage(err) });
                    } else {
                        res.json(users);
                    }
                });
        }
        else {
            return res.status(401).send({ error: "expired-token" });
        }
    }
    else {
        return res.status(401).send({ error: "admin-not-found" });
    }
};

exports.userById = async function (req, res, next, id) {
    const userId = validateToken(req, res);

    let admin = await Admin.findOne({
        userId
    });

    if (admin) {
        if (admin.token === req.headers.authorization.split(' ')[1]) {
            User.findById(id)
                .exec(function (err, user) {
                    if (err) {
                        return res.status(400).send({ error: getErrorMessage(err) });
                    } else {
                        res.json(user);
                    }
                });
        }
        else {
            return res.status(401).send({ error: "expired-token" });
        }
    }
    else {
        return res.status(401).send({ error: "admin-not-found" });
    }
};