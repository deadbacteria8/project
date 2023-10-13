const config = require('./config/db.json')
const mysql = require('promise-mysql')
require('dotenv').config()
const bcrypt = require('bcrypt')

const createProjectManager = async () => {
  const db = await mysql.createConnection(config)
  try {
    let hash = await bcrypt.hash(process.env.PROJECT_MANAGER_PASSWORD, 10)
    const routeObject = {
      routes: [
        { path: '/index', name: 'Home', parameters: [] },
        { path: '/uploadcsv', name: 'Upload CSV', parameters: [] },
        { path: '/createproject', name: 'Create Project', parameters: [] },
        {
          path: '/managerprojectlist',
          name: 'Submitted Reports',
          parameters: [],
        },
      ],
    }
    await db.query(
      `CALL insert_manager('project@manager.com','+46701234567','Project Manager','project','${hash}','${JSON.stringify(
        routeObject,
      )}')`,
    )
    hash = null
  } catch (error) {
    console.log(error)
  } finally {
    db.end()
  }
}

createProjectManager()
