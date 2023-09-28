"use strict";
const config = require('../config/db.json');
const mysql = require("promise-mysql");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');


const login = async (req, res) => {
    let db = await mysql.createConnection(config);
    const body = req.body;
    let sqlQuery = await db.query(`CALL find_user('${body.username}');`);
    const row = sqlQuery[0][0];
    const result = await bcrypt.compare(body.password, row.password);
    if (!result) {
        throw new Error;
    }
    const parsedRoutes = JSON.parse(row.routes);
    const payload = {
        routes: parsedRoutes,
        id: row.employee_id
    };
    const token = jwt.sign(payload,process.env.JWT_KEY, {expiresIn: '1h'});
    res.cookie("token", token, {
        httpOnly: true
    });
    return res.redirect(parsedRoutes[0]);
}

const selectUsers = async () => {
    let db = await mysql.createConnection(config);
    let sqlQuery = await db.query(`CALL select_users(false);`);
    return sqlQuery;
}

module.exports = { login,selectUsers };