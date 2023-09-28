const config = require('./config/db.json');
const mysql = require("promise-mysql");
require('dotenv').config();
const bcrypt = require('bcrypt');

const createProjectManager = async () => {
    let db = await mysql.createConnection(config);
    try {
        let hash = await bcrypt.hash(process.env.PROJECT_MANAGER_PASSWORD, 10);
        await db.query(`CALL insert_manager('project@manager.com','+46701234567','Project Manager','project','${hash}')`);
        hash = null;
    } catch (error) {
        console.log(error);
    }
    db.end();
    return;
}

createProjectManager();
