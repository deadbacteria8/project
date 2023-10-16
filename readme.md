Application requires Mariadb(11.1.2-MariaDB) and Node.js(v18.12.0)

Configure your database connection in /config/db.json database team should be used.

Go to the sql directory and initiate mariadb. Execute gathered.sql with command `source gathered.sql`.

Go to the root of the directory and execute command `npm install` to install all dependencies needed for the application.

In the root of the directory, execute command `node createprojectmanager.js` to create the account for the project manager. If you dont change the credentials, username is project and password is manager.

To succesfully upload a csv, use the same format and column names as displayed in format.csv file. The columns does not need to be in the same order as they are displayed in the format.csv file but the columns need to exist. Created users will receive an email from deadbacteria8@outlook.com. If you want, you can change the configured email sender in handle/handlecsv.js .