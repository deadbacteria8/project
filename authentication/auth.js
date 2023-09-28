const jwt = require('jsonwebtoken');
const config = require('../config/db.json');
const mysql = require("promise-mysql");
require('dotenv').config();
const bcrypt = require('bcrypt');

const middlewareAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.userRoutes = decoded.routes;
            if(req.userRoutes === undefined) {
                throw new Error();
            }
            if (!req.userRoutes.includes(req.url)) {
                return res.redirect(req.userRoutes[0]);
            }
            next();
        } catch (err) {
            res.clearCookie('token');
            return res.redirect("/login");
        }
    }
    else {
        res.redirect("/login");
    }
}

const updatePassword = async (req,res) => {
    const body = req.body;
    if (!body.password || !body.password2 || body.password != body.password2) {
        return "Passwords doesn't match";
    }
    let db = await mysql.createConnection(config);
    try {
        let sqlQuery = await db.query(`CALL select_token('${req.params.token}')`);
        const decoded = jwt.verify(sqlQuery[0][0].token, process.env.JWT_KEY);
        try {
            let hash = await bcrypt.hash(body.password, 10);
            await db.query(`CALL update_user_password('${hash}', '${decoded.id}')`);
            hash = null;
            body.password = null;
            body.password2 = null;
        } catch (error) {
            return "Error updating your password";
        }
        return "Successful";
    } catch (error) {
        return "Error, Invalid token";
    }
}

module.exports = { middlewareAuth, updatePassword };