const jwt = require('jsonwebtoken');
const config = require('./config')

module.exports = function (req, res) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).send({ error: "token-required" });
    }

    try {
        const decoded = jwt.decode(token.split(' ')[1], config.sessionSecret);
        if (!decoded) {
            return res.status(401).send({ error: "unauthorized" });
        }

        const now = Math.floor(Date.now() / 1000);

        const preParsed = JSON.stringify(decoded);
        const parsed = JSON.parse(preParsed);

        const expired = parsed.exp;

        if(expired < now){
            return res.status(401).send({ error: "expired-token" });
        }

        return parsed.user_id;

    } catch (err) {
        return res.status(401).send("invalid-token");
    }
}