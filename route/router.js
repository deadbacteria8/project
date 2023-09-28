"use strict";
const express = require("express");
const router  = express.Router();
const multer = require('multer');
const { selectUsers, login } = require("../dbToJs/databaseConnections.js");
const handleCsv = require("../handle/handlecsv.js");
const { middlewareAuth, updatePassword } = require("../authentication/auth.js");
const handleProjectData = require("../handle/handleProjectData");
//const flatpickr = require('flatpickr');

let serverMessage = undefined;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, 'uploads');
        }
        },
        filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post("/uploadcsv",middlewareAuth,upload.single('csvFile'), async (req, res) => {
    if (req.file) {
        const message = await handleCsv(req.file.path);
        serverMessage = message;
    }
    return res.redirect('/uploadcsv');
});

router.get("/createproject",middlewareAuth, async (req, res) => {
    const selectedUsers = await selectUsers();
    return res.render("createproject", { userRoutes: req.userRoutes, users: selectedUsers });
});

router.post("/createproject",middlewareAuth, async (req, res) => {
    handleProjectData(req.body);
    return res.redirect('/createproject');
});

router.get("/index",middlewareAuth, (req, res) => {
    res.render("index", { userRoutes: req.userRoutes });
});

router.get("/userindex",middlewareAuth, (req, res) => {
    res.render("userindex", { userRoutes: req.userRoutes });
});

router.get("/uploadcsv", middlewareAuth, (req, res) => {
    const output = serverMessage;
    serverMessage = undefined;
    res.render("upload", {
        userRoutes: req.userRoutes,
        csvHandleOutput: output,
    });
});


router.get("/login", (req, res) => {
    const output = serverMessage;
    serverMessage = undefined;
    res.render("login", { loginMessage:output });
});


router.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});


router.post("/login", async (req, res) => {
    try {
        await login(req, res);
    } catch (error) {
        serverMessage = 'Wrong credentials';
        res.clearCookie('token');
        return res.redirect("/login");
    }
});

router.post("/signup/:token?", async (req, res) => {
    serverMessage = await updatePassword(req, res);
    return res.redirect(req.url);
});

router.get("/signup/:token?", (req, res) => {
    const token = req.params.token;

    if (!token) {
        return res.redirect('/login');
    }

    const output = serverMessage;

    serverMessage = undefined;

    res.render("signup", {
        message: output
    });
});

router.use(middlewareAuth, (req, res) => {
    return res.redirect(req.userRoutes[0]);
});




module.exports = router;