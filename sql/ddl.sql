DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
CREATE TABLE users
(
    `email_address` TEXT NOT NULL,
    `mobile_number` TEXT NOT NULL,
    `name` TEXT NOT NULL,
    `employee_id` VARCHAR(50),
    `password` TEXT DEFAULT NULL,
    `admin` BOOLEAN DEFAULT false NOT NULL,
    `routes` JSON NOT NULL,
    `token` TEXT DEFAULT NULL,
    PRIMARY KEY (`employee_id`)
);

CREATE TABLE projects (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` TEXT NOT NULL
);


CREATE TABLE reports (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `report_date` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `status` VARCHAR(25) DEFAULT 'Pending' NOT NULL,
    FOREIGN KEY (`project_id`) REFERENCES projects(`id`),
    FOREIGN KEY (`user_id`) REFERENCES users(`employee_id`)
);

CREATE TABLE messages (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `report_id` INT NOT NULL,
    `text_input` TEXT NOT NULL,
    `read` BOOLEAN DEFAULT false NOT NULL,
    FOREIGN KEY (`report_id`) REFERENCES reports(`id`)
);

DROP PROCEDURE IF EXISTS insert_messages;
DELIMITER ;;
CREATE PROCEDURE insert_messages(
    input_report_id INT,
    input_text TEXT
)
BEGIN
    INSERT INTO messages (`report_id`,`text_input`)
    VALUES (input_report_id, input_text);

    UPDATE reports
    SET `status` = 'Submitted'
    WHERE `id` = input_report_id;

    SELECT LAST_INSERT_ID() AS newMessageID;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS insert_report;
DELIMITER ;;
CREATE PROCEDURE insert_report(
    input_project_id INT,
    input_report_date VARCHAR(50),
    input_user_id VARCHAR(50)
)
BEGIN
    INSERT INTO reports (`project_id`,`report_date`,`user_id`)
    VALUES (input_project_id, input_report_date, input_user_id);

    SELECT LAST_INSERT_ID() AS newReportID;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS find_user;
DELIMITER ;;
CREATE PROCEDURE find_user(
    id VARCHAR(50)
    )
BEGIN
    SELECT `employee_id`, `routes`, `password` FROM users WHERE `employee_id` = id;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS insert_user;
DELIMITER ;;
CREATE PROCEDURE insert_user(
    input_email_address TEXT,
    input_mobile TEXT,
    input_name TEXT,
    input_employee_id VARCHAR(50),
    input_object JSON
)
BEGIN
    DECLARE pk_count INT;
    SELECT COUNT(*) INTO pk_count
    FROM users
    WHERE `employee_id` = input_employee_id;
    IF pk_count = 0 THEN 
        INSERT INTO users (`email_address`, `mobile_number`, `name`, `employee_id`,`routes`)
        VALUES (input_email_address, input_mobile, input_name, input_employee_id, input_object);
    ELSE
        UPDATE users
        SET
        `email_address` = input_email_address,
        `mobile_number` = input_mobile,
        `name` = input_name
        WHERE employee_id = input_employee_id;
    END IF;
END ;;
DELIMITER ;



DROP PROCEDURE IF EXISTS update_token;
DELIMITER ;;
CREATE PROCEDURE update_token(
    input_token TEXT,
    input_id VARCHAR(50)
    )
BEGIN
    UPDATE users
    SET
    token = input_token
    WHERE employee_id = input_id;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS select_token;
DELIMITER ;;
CREATE PROCEDURE select_token(
    input_token TEXT
    )
BEGIN
    SELECT `token` FROM users WHERE `token` = input_token;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS update_user_password;
DELIMITER ;;
CREATE PROCEDURE update_user_password(
    input_password TEXT,
    input_id VARCHAR(50)
    )
BEGIN
    UPDATE users
    SET
    `token` = NULL,
    `password` = input_password
    WHERE `employee_id` = input_id;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS insert_manager;
DELIMITER ;;
CREATE PROCEDURE insert_manager(
    input_email_address TEXT,
    input_mobile TEXT,
    input_name TEXT,
    input_employee_id VARCHAR(50),
    input_password TEXT,
    input_object JSON
)
BEGIN
    INSERT INTO users (`email_address`, `mobile_number`, `name`, `employee_id`, `password`,`admin`,`routes`)
    VALUES (input_email_address, input_mobile, input_name, input_employee_id, input_password, true, input_object);
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS select_users;
DELIMITER ;;
CREATE PROCEDURE select_users(
    input_a BOOLEAN
    )
BEGIN
    SELECT * FROM users WHERE `admin`= input_a;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS insert_project;
DELIMITER ;;
CREATE PROCEDURE insert_project(
    IN project_title TEXT
    )
BEGIN
    INSERT INTO projects (`title`) VALUES (project_title);

    SELECT LAST_INSERT_ID() AS newProjectID;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS select_project;
DELIMITER ;;
CREATE PROCEDURE select_project()
BEGIN
    SELECT * FROM projects;
END ;;
DELIMITER ;


DROP PROCEDURE IF EXISTS select_reports;
DELIMITER ;;
CREATE PROCEDURE select_reports(
    input_employee VARCHAR(50)
)
BEGIN
    SELECT r.*, p.title AS `title`
    FROM reports r
    LEFT JOIN projects p ON r.`project_id` = p.`id`
    WHERE r.`user_id` = input_employee
    ORDER BY r.`id` DESC;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS select_routes;
DELIMITER ;;
CREATE PROCEDURE select_routes(
    input_employee VARCHAR(50)
)
BEGIN
    SELECT `routes`
    FROM users
    WHERE `employee_id` = input_employee;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS update_routes;
DELIMITER ;;
CREATE PROCEDURE update_routes(
    input_employee VARCHAR(50),
    input_route JSON
)
BEGIN
    UPDATE users
    SET `routes` = input_route
    WHERE `employee_id` = input_employee;
END ;;
DELIMITER ;


DROP PROCEDURE IF EXISTS select_submitted_reports;
DELIMITER ;;
CREATE PROCEDURE select_submitted_reports()
BEGIN
    SELECT r.*, m.`text_input` AS `input`, m.`id` AS `m_id` ,p.title AS `title`
    FROM reports r
    LEFT JOIN messages m ON r.`id` = m.`report_id`
    LEFT JOIN projects p ON r.`project_id` = p.`id`
    WHERE r.`status` = 'Submitted'
    ORDER BY r.`id` ASC;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS select_message;
DELIMITER ;;
CREATE PROCEDURE select_message(
    input_id INT
)
BEGIN
    SELECT r.*, m.`text_input` AS `input`, m.`id` AS `m_id` ,p.title AS `title`
    FROM reports r
    LEFT JOIN messages m ON r.`id` = m.`report_id`
    LEFT JOIN projects p ON r.`project_id` = p.`id`
    WHERE  m.`id` = input_id;
END ;;
DELIMITER ;
