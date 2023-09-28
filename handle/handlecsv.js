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
    let dataArray;

    await readingCsv(fileP).then((res) => {
        dataArray = res;
    }).catch((res) => {
        console.log(res);
        return "Couldn't read file";
    });

    let db = await mysql.createConnection(config);

    let i = 1;

    let arrayCollectingErrors = [];

    const mailgun = new Mailgun(FormData);

    const client = mailgun.client({username:'api', key: process.env.MAILGUN_API_KEY, url:"https://api.mailgun.net"});
    for (const data of dataArray) {
        try {
            const dataArray = [data.email_address, data.mobile_number, data.name, data.employee_id];
            if (dataArray.includes(undefined) || dataArray.includes('')) {
                throw new Error;
            }
            await db.query(`CALL insert_user('${data.email_address}', '${data.mobile_number}', '${data.name}', '${data.employee_id}');`);
            const payload = {
                id: data.employee_id
            };
    
            const token = jwt.sign(payload,process.env.JWT_KEY, {expiresIn: '7d'});
            
            await db.query(`CALL update_token('${token}','${data.employee_id}')`);
    
            const messageData = {
                from: 'ollethabaws@gmail.com',
                to: 'ollethabaws@gmail.com',
                subject: 'Signup',
                html: '<a href="http://localhost:9540/signup/' + token + '">Signup</a>'
            };
    
            //await client.messages.create(process.env.MAILGUN_DOMAIN, messageData);
        } catch (error) {
            arrayCollectingErrors.push(i);
        }
        i++;
    }
    if (arrayCollectingErrors.length > 0) {
        return "Unsuccessful with rows: " + arrayCollectingErrors.join(',');
    }
    return "Successful upload";
};

async function readingCsv(filePath) {
    let array = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data',(data) => {
            array.push(data);
        })
        .on('end',() => {
            resolve(array);
            fs.unlinkSync(filePath);
        })
        .on('error', (error) => {
            reject(error);
        });
    });
    
}



module.exports = handleCsv;