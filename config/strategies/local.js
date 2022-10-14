const passport = require("passport");
let LocalStrategy = require("passport-local").Strategy,
    Admin = require("mongoose").model("Admin");

module.exports = function () {
    passport.use(new LocalStrategy(function (username, password, done) {
        Admin.findOne({
            username: username
        },
            function (err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false, {
                        error: 'unkown-user'
                    });
                }

                if (!user.authenticate(password)) {
                    return done(null, false, {
                        error: 'invalid-password'
                    });
                }

                return done(null, user);
            }
        );
    }));
};