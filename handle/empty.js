"use strict";
const config = require('../config/db.json');
const mysql = require("promise-mysql");
const jwt = require('jsonwebtoken');
const csv = require('csv-parser');
const fs = require('fs');
require('dotenv').config();
const FormData = require('form-data');
const Mailgun = require('mailgun.js');

const handleCsv = async (fileP) => {
    return await readingCsv(fileP);
};

async function readingCsv(filePath) {
    let message = "Successful upload";
    let i = 1;
    let hasError = false;
    let arrayCollectingErrors = [];
    const mailgun = new Mailgun(FormData);

    const client = mailgun.client({username:'api', key: process.env.MAILGUN_API_KEY, url:"https://apdssdi.mailgun.net"});

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
            try {
                let db = await mysql.createConnection(config);
                await db.query(`CALL insert_user('${data.email_address}', '${data.mobile_number}', 
                '${data.name}', '${data.employee_id}');`);
                const payload = {
                    id: data.employee_id
                };

                const token = jwt.sign(payload,'projectSecretKey', {expiresIn: '7d'});

                await db.query(`CALL update_token('${token}','${data.employee_id}')`);

                const messageData = {
                    from: 'ollethabaws@gmail.com',
                    to: 'ollethabaws@gmail.com',
                    subject: 'Signup',
                    text: token
                };

                await client.messages.create(process.env.MAILGUN_DOMAIN, messageData);
            } catch (error) {
                hasError = true;
                arrayCollectingErrors.push(i);
            }
            i += 1;
            console.log("nej");
        })
        .on('end',() => {
            console.log("hej");
            if (hasError) {
                message = "Unsuccessful with rows: " + arrayCollectingErrors.join(',');
            }
            resolve(message);
            fs.unlinkSync(filePath);
        })
        .on('error', (error) => {
            reject(error);
        });
    });
    
}

module.exports = handleCsv;