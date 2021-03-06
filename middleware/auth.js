const User = require("../models/user");

let auth = (req, res, next) => {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({
            error: true,
            isAuth: false,
            message: "You are already Logged out."
        });
        req.token = token;
        req.user = user;
        next();
    })
    
}
module.exports = {auth};