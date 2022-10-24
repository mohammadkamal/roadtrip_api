const jsonwebtoken = require('jsonwebtoken');
let config = require('../../config/config');
let Admin = require('mongoose').model('Admin');
let errorGetter = require('../../config/error_getter');

exports.signup = async function (req, res) {
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
                error: errorGetter(err)
            });
        } else {

            return res.status(201).json(admin);
        }
    });
}

exports.signIn = async function (req, res) {
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
                    error: errorGetter(err)
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
                return res.status(400).send({ error: errorGetter(err) });
            } else {
                res.json(admins);
            }
        });

};

exports.adminById = async function (req, res, next, id) {
    Admin.findById(id)
        .exec(function (err, foundAdmin) {
            if (err) {
                return res.status(400).send({ error: errorGetter(err) });
            } else {
                req.admin = foundAdmin;
                next();
            }
        });
};

exports.read = function (req, res) {
    return res.status(200).json(req.admin);
}