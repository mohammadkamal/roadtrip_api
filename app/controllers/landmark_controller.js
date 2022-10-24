let Landmark = require('mongoose').model('Landmark');
let errorGetter = require('../../config/error_getter');
const validateToken = require('../../config/validate_token');

exports.create = async function (req, res) {
    let landmark = new Landmark(req.body);

    landmark.author = validateToken(req);

    landmark.save(function (err) {
        if (err) {
            return res.status(400).send({ error: errorGetter(err) });
        } else {
            return res.status(201).json(landmark);
        }
    });
}

exports.list = function (req, res) {
    Landmark.find()
        .populate('approvemnt author', 'full_name phone_number created')
        .exec(function (err, landmarks) {
            if (err) {
                return res.status(400).send({ error: errorGetter(err) });
            } else {
                return res.status(200).json(landmarks);
            }
        });
}

exports.read = function (req, res) {
    return res.status(200).json(req.landmark);
}

// TODO: Add update for admins && request update for users
// TODO: Add delete for admins && request delete for users

exports.landmarkByID = function (req, res, next, id) {
    Landmark.findById(id).populate('approvemnt author').exec(function (err, landmark) {
        if (err) return next(err);
        if (!landmark) return next(new Error('Failed to load landmark with ID: ' + id));

        req.landmark = landmark;

        next();
    });
}