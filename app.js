'use strict'
const express = require('express')
const app = express()
const router = require('./route/router.js')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
// app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.use(router)

app.listen(1337, () => {
  console.log('Server started')
})
