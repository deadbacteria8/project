'use strict'
const config = require('../config/db.json')
const mysql = require('promise-mysql')
const jwt = require('jsonwebtoken')
const csv = require('csv-parser')
const fs = require('fs')
require('dotenv').config()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'deadbacteria8@outlook.com',
    pass: 'nodemailer123',
  },
})

const handleCsv = async (fileP) => {
  let dataArray
  // readingCsv is looping through the csv file and appending the data to an array, the array is then returned.
  await readingCsv(fileP)
    .then((res) => {
      dataArray = res
    })
    .catch((res) => {
      console.log(res)
      return "Couldn't read file"
    })

  const db = await mysql.createConnection(config)

  let i = 1 // used to display which rows from the csv file that trigger errors.

  const arrayCollectingErrors = []

  // looping through the dataArray. The data array contains data from the csv file
  for (const data of dataArray) {
    try {
      const dataArray = [
        data.email_address,
        data.mobile_number,
        data.name,
        data.employee_id,
      ]
      if (dataArray.includes(undefined) || dataArray.includes('')) {
        throw new Error()
      }
      // creating a default route object that will be stored in the database for the current user in the loop
      const routeObject = {
        routes: [
          { path: '/userindex', name: 'Home', parameters: [] },
          { path: '/reports', name: 'Reports', parameters: [] },
        ],
      }
      await db.query(
        `CALL insert_user('${data.email_address}', '${data.mobile_number}', '${
          data.name
        }', '${data.employee_id}','${JSON.stringify(routeObject)}');`,
      )
      const payload = {
        id: data.employee_id,
      }

      const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '7d' })

      await db.query(`CALL update_token('${token}','${data.employee_id}')`)

      // Email data
      const messageData = {
        from: 'deadbacteria8@outlook.com',
        to: data.email_address,
        subject: 'Signup',
        html:
          '<h1>Signup for project-pulse</h1><br><a href="http://localhost:1338/signup/' +
          token +
          '">Signup</a><p>employee-id: ' +
          data.employee_id +
          '</p>',
      }

      await transporter.sendMail(messageData)
    } catch (error) {
      console.log(error)
      // appending the row that has an error
      arrayCollectingErrors.push(i)
    }
    i++
  }
  // if arrayCollecting errors is not empty
  if (arrayCollectingErrors.length > 0) {
    return 'Unsuccessful with rows: ' + arrayCollectingErrors.join(',')
  }
  db.end()
  return 'Successful upload'
}

async function readingCsv(filePath) {
  const array = []
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        array.push(data)
      })
      .on('end', () => {
        resolve(array)
        fs.unlinkSync(filePath)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}
module.exports = handleCsv
