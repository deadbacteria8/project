const config = require('../config/db.json')
const mysql = require('promise-mysql')

const handleProjectData = async (data) => {
  /* data is retrieved from the createproject route where the user can decide if
  they want to use customized deadlines or if they want to use frequences. The data is different because dates are collected differently
  and the user can choose between different weekdays as due dates
  */
  const db = await mysql.createConnection(config)
  try {
    if (!data.customized) {
      data.dates = notCustomizedData(data)
    } else {
      data.dates = customizedData(data)
    }
    if (!data.title) {
      throw new Error()
    }
    const sqlQuery = await db.query(`CALL insert_project('${data.title}');`)
    const newProjectID = sqlQuery[0][0].newProjectID
    if (data.employees_id.length < 1) {
      throw new Error()
    }
    for (const employee of data.employees_id) {
      const sqlQuery2 = await db.query(`CALL select_routes('${employee}');`)
      let routesFromQuery = sqlQuery2[0][0].routes
      routesFromQuery = JSON.parse(routesFromQuery)
      const routeInObject = routesFromQuery.routes.find(
        (route) => route.path === '/reports',
      )
      for (const report of data.dates) {
        const reportString = report.toLocaleString()
        const sqlQuery = await db.query(
          `CALL insert_report('${newProjectID}', '${reportString}', '${employee}');`,
        )
        const newReportID = sqlQuery[0][0].newReportID
        routeInObject.parameters.push(newReportID)
      }
      await db.query(
        `CALL update_routes('${employee}','${JSON.stringify(
          routesFromQuery,
        )}')`,
      )
    }
    return 'successful'
  } catch (error) {
    return 'unsuccessful'
  } finally {
    db.end()
  }
}
function customizedData(data) {
  // collecting the dates from the data object that is customized with choosen dates
  const dateObjects = data.dateSelected[0].map(
    (dateString) => new Date(dateString),
  )
  // sorting the dates in ascending order
  dateObjects.sort((a, b) => a - b)

  return dateObjects
}

function notCustomizedData(data) {
  const startDate = fixTime(data.dateRange[0], data.hour)
  const last = fixTime(data.dateRange[1], data.hour)
  const returnArray = []
  const differentFreq = {
    daily: 1,
    weekly: 7,
    fortnightly: 14,
    monthly: false, // frequency can vary depending on month
  }
  // data.frequency can be daily,weekly,fortnightly or monthly which we use as a key to get the frequency value from differentFreq
  const frequency = differentFreq[data.frequency]
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  // in this loop we go backwards with the last date to begin with, this loop will continue while the last date is bigger or equal to startdate
  while (true) {
    if (last < startDate) {
      break
    }
    const selectedDayOfWeek = days.indexOf(data.dayOfWeek)
    let value = 0
    if (selectedDayOfWeek !== -1) {
      const currentDate = last.getDay()
      // we want to create reports with the correct date, so we find the day difference. if the currentDate is not on the correct day, we will adjust that.
      const dayDifference = currentDate - selectedDayOfWeek
      if (dayDifference !== 0) {
        if (dayDifference < 0) {
          value = 7 + dayDifference
        } else {
          value = Math.abs(dayDifference)
        }
      }
    }
    // We check if the frequency is daily and if the day is saturday or sunday, we dont want to send daily reports on weekends.
    if (
      (last.getDay() === 6 && frequency === 1) ||
      (last.getDay() === 0 && frequency === 1)
    ) {
      // we adjust the last date depending on the currentdate
      const daysToAdjust = last.getDay() === 6 ? 1 : 2
      last.setDate(last.getDate() - daysToAdjust)
    } else {
      last.setDate(last.getDate() - value)
      returnArray.push(new Date(last))
      if (!frequency) {
        last.setMonth(last.getMonth() - 1)
      } else {
        last.setDate(last.getDate() - frequency)
      }
    }
  }
  // returning date array
  return returnArray
}

function fixTime(timeObject, hourString) {
  // making the timeobject have the time that the user input. the user input is in 00:00 format
  timeObject = new Date(timeObject)
  const [hour, minute] = hourString.split(':').map(Number)
  timeObject.setHours(hour, minute, 0, 0)
  return timeObject
}
// Get reports from the database
async function getReports(input) {
  const db = await mysql.createConnection(config)
  const sqlQuery = await db.query(`CALL select_reports('${input}');`)
  db.end()
  return sqlQuery
}
// get submitted reports
async function getSubmittedReports() {
  const db = await mysql.createConnection(config)
  const sqlQuery = await db.query(`CALL select_submitted_reports();`)
  db.end()
  return sqlQuery
}
// input is the message-id
async function getMessage(input) {
  const db = await mysql.createConnection(config)
  const sqlQuery = await db.query(`CALL select_message('${input}');`)
  db.end()
  return sqlQuery
}

// id is report id and text is the text input
async function insertMessage(id, text) {
  const db = await mysql.createConnection(config)
  let message = 'Successful'
  try {
    const messageQuery = await db.query('CALL insert_messages(?,?)', [id, text])
    const newMessageID = messageQuery[0][0].newMessageID
    const sqlQuery = await db.query(`CALL select_routes('project');`)
    let routesFromQuery = sqlQuery[0][0].routes
    routesFromQuery = JSON.parse(routesFromQuery)
    const routeInObject = routesFromQuery.routes.find(
      (route) => route.path === '/managerprojectlist',
    )
    routeInObject.parameters.push(newMessageID)
    // updating route parameters for the projectmanager
    await db.query(
      `CALL update_routes('project','${JSON.stringify(routesFromQuery)}')`,
    )
  } catch (error) {
    console.log(error)
    message = 'Unsuccessful'
  }
  db.end()
  return message
}

module.exports = {
  handleProjectData,
  getReports,
  getSubmittedReports,
  insertMessage,
  getMessage,
}
