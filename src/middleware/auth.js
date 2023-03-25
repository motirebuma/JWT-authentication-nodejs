const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

const config = process.env;

const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt || req.body.token || req.query.token || req.headers["x-access-token"];   
    if (!token) {
        // forbidden page - 403
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, config.JWT_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;