const jsonwebtoken = require('jsonwebtoken');
let config = require('../../config/config');
let Admin = require('mongoose').model('Admin');
let validateToken = require('../../config/validate_token');

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
    let admin = new Admin(req.body);

    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
        return res.status(400).send({ error: "missing-parameters" });
    }

    const oldAdmin = await Admin.findOne({ username });

    if (oldAdmin) {
        return res.status(409).send({
            error: "username-already-in-use"
        });
    }

    let token = jsonwebtoken.sign({ user_id: admin.id },
        config.sessionSecret,
        { expiresIn: 3600 * 24 * 10 }
    );

    admin.token = token;

    admin.save(function (err) {
        if (err) {
            return res.status(400).send({
                error: getErrorMessage(err)
            });
        } else {

            return res.status(201).json(admin);
        }
    });
}

exports.signIn = async function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    if (!(username && password)) {
        return res.status(400).send({ error: "missing-parameters" });
    }

    const admin = await Admin.findOne({ username });

    if (admin && admin.authenticate(password)) {
        let token = jsonwebtoken.sign({ user_id: admin.id },
            process.env.NODE_ENV,
            { expiresIn: 3600 * 24 * 10 }
        );

        admin.token = token;
        admin.save(function (err) {
            if (err) {
                return res.status(400).send({
                    error: getErrorMessage(err)
                });
            } else {
                return res.status(200).json(admin);
            }
        });
    }
    else {
        return res.status(400).send({ error: "invalid-credentials" });
    }
}

exports.list = async function (req, res) {
    Admin.find().sort('-created')
        .exec(function (err, admins) {
            if (err) {
                return res.status(400).send({ error: getErrorMessage(err) });
            } else {
                res.json(admins);
            }
        });

};

exports.adminById = async function (req, res, next, id) {
    Admin.findById(id)
        .exec(function (err, foundAdmin) {
            if (err) {
                return res.status(400).send({ error: getErrorMessage(err) });
            } else {
                res.json(foundAdmin);
            }
        });
};

exports.isAuthorized = async function (req, res, next) {
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