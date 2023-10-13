'use strict'
const config = require('../config/db.json')
const mysql = require('promise-mysql')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcrypt')

// login function
const login = async (req, res) => {
  const db = await mysql.createConnection(config)
  const body = req.body
  const sqlQuery = await db.query(`CALL find_user('${body.username}');`)
  const row = sqlQuery[0][0]
  const result = await bcrypt.compare(body.password, row.password)
  if (!result) {
    // error is caught in the router
    db.end()
    throw new Error()
  }
  const parsedRoutes = JSON.parse(row.routes)
  const payload = {
    routes: parsedRoutes.routes,
    id: row.employee_id,
  }
  // saving the routes and employee id to
  const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' })
  res.cookie('token', token, {
    httpOnly: true,
  })
  db.end()
  return res.redirect(parsedRoutes.routes[0].path)
}

// selecting users
const selectUsers = async () => {
  const db = await mysql.createConnection(config)
  const sqlQuery = await db.query(`CALL select_users(false);`)
  db.end()
  return sqlQuery
}

module.exports = { login, selectUsers }
