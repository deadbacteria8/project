DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    `email_address` TEXT,
    `mobile_number` TEXT,
    `name` TEXT,
    `employee_id` VARCHAR(50),
    `password` TEXT DEFAULT NULL,
    `admin` BOOLEAN DEFAULT false,
    `routes` JSON DEFAULT '["/userindex"]',
    `token` TEXT DEFAULT NULL,
    PRIMARY KEY (`employee_id`)
);

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
    input_employee_id VARCHAR(50)
)
BEGIN
    DECLARE pk_count INT;
    SELECT COUNT(*) INTO pk_count
    FROM users
    WHERE `employee_id` = input_employee_id;
    IF pk_count = 0 THEN 
        INSERT INTO users (`email_address`, `mobile_number`, `name`, `employee_id`)
        VALUES (input_email_address, input_mobile, input_name, input_employee_id);
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
    input_password TEXT
)
BEGIN
    INSERT INTO users (`email_address`, `mobile_number`, `name`, `employee_id`, `password`,`admin`,`routes`)
    VALUES (input_email_address, input_mobile, input_name, input_employee_id, input_password, true, '["/index","/uploadcsv","/createproject"]');
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