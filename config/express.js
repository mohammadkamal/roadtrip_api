const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const compression = require('compression');
const methodOverride = require('method-override');
const session = require('express-session');
const config = require('./config.js');

module.exports = function () {
    let app = express();

    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compression());
    }

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    require('../app/routes/user_routes.js')(app);
    require('../app/routes/admin_routes.js')(app);
    require('../app/routes/landmark_routes.js')(app);

    return app;

}