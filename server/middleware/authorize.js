const jwt = require("jsonwebtoken");
require("dotenv").config()

exports.authorize = (req, res, next) => {
    const token = req.header("auth-token");
    jwt.verify(token, process.env.JWT_SECRET, (error) => {
        if (error) return res.status(403).json({ message: "access forbidden" });
        next();
    });
};
