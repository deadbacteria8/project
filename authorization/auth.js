const jwt = require('jsonwebtoken')
const config = require('../config/db.json')
const mysql = require('promise-mysql')
require('dotenv').config()
const bcrypt = require('bcrypt')

const middlewareAuth = (req, res, next) => {
  const token = req.cookies.token
  let forExtraParam = true // if there is an extra param this might change to false if the param doesnt exist in the user routes
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY)
      req.userRoutes = decoded.routes
      req.employee_id = decoded.id
      if (req.userRoutes === undefined) {
        throw new Error()
      }
      const urlParts = req.url.split('/') // splitting parameters
      const firstParameter = '/' + urlParts[1] // '/' + part to match whats in the json object
      const routeExists = req.userRoutes.some(
        (route) => route.path === firstParameter,
      )
      if (urlParts.length >= 3) {
        // Capture the additional parameter
        req.params.additionalParam = urlParts[2]
        const routeObject = req.userRoutes.find(
          (route) => route.path === firstParameter,
        ) // find extra param
        forExtraParam = routeObject.parameters.includes(parseInt(urlParts[2])) // check if the parameter exist for the user.
      }
      if (!routeExists || !forExtraParam) {
        return res.redirect(req.userRoutes[0].path)
      }
      next()
    } catch (err) {
      res.clearCookie('token')
      return res.redirect('/login')
    }
  } else {
    res.redirect('/login')
  }
}
// updating password
const updatePassword = async (req, res) => {
  const body = req.body
  if (!body.password || !body.password2 || body.password !== body.password2) {
    return "Passwords doesn't match"
  }
  // checks if passwords match or if there is any
  const db = await mysql.createConnection(config)
  try {
    // trying to find the token in the database that user has in the parameter
    const sqlQuery = await db.query(`CALL select_token('${req.params.token}')`)
    const decoded = jwt.verify(sqlQuery[0][0].token, process.env.JWT_KEY)
    let hash = await bcrypt.hash(body.password, 10)
    await db.query(`CALL update_user_password('${hash}', '${decoded.id}')`)
    hash = null
    body.password = null
    body.password2 = null
    return 'Successful'
  } catch (error) {
    return 'Error, Invalid token'
  } finally {
    db.end()
  }
}

module.exports = { middlewareAuth, updatePassword }
