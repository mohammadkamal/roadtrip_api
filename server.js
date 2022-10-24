process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require("./config/express");
const mongoose = require("./config/mongoose");

let db = mongoose();
let app = express(db);

app.listen(6000);
module.exports = app;

console.log('Alive at http://localhost:6000/');