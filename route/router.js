'use strict'
const express = require('express')
const router = express.Router()
const multer = require('multer')
const { selectUsers, login } = require('../dbToJs/databaseConnections.js')
const handleCsv = require('../handle/handlecsv.js')
const { middlewareAuth, updatePassword } = require('../authorization/auth.js')
const {
  handleProjectData,
  getReports,
  getSubmittedReports,
  insertMessage,
  getMessage,
} = require('../handle/handleProjectData')

let serverMessage

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, 'uploads')
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

router.post(
  '/uploadcsv',
  middlewareAuth,
  upload.single('csvFile'),
  async (req, res) => {
    if (req.file) {
      const message = await handleCsv(req.file.path)
      serverMessage = message
    }
    return res.redirect('/uploadcsv')
  },
)

router.get('/createproject', middlewareAuth, async (req, res) => {
  const selectedUsers = await selectUsers()
  return res.render('createproject', {
    userRoutes: req.userRoutes,
    users: selectedUsers,
  })
})

router.post('/createproject', middlewareAuth, async (req, res) => {
  const ok = await handleProjectData(req.body)
  res.status(200).json({ success: ok })
})

router.get('/index', middlewareAuth, (req, res) => {
  res.render('index', {
    userRoutes: req.userRoutes,
    employee_id: req.employee_id,
  })
})

router.get('/userindex', middlewareAuth, (req, res) => {
  res.render('index', {
    userRoutes: req.userRoutes,
    employee_id: req.employee_id,
  })
})

router.get('/uploadcsv', middlewareAuth, (req, res) => {
  const output = serverMessage
  serverMessage = undefined
  res.render('upload', {
    userRoutes: req.userRoutes,
    csvHandleOutput: output,
  })
})

router.get('/managerprojectlist', middlewareAuth, async (req, res) => {
  const resultQuery = await getSubmittedReports()

  res.render('managerProjectList', {
    userRoutes: req.userRoutes,
    reports: resultQuery,
  })
})

router.get('/managerprojectlist/:id', middlewareAuth, async (req, res) => {
  const resultQuery = await getMessage(req.params.id)

  console.log(resultQuery[0])

  res.render('message', {
    userRoutes: req.userRoutes,
    message: resultQuery[0],
  })
})

router.get('/reports', middlewareAuth, async (req, res) => {
  const resultQuery = await getReports(req.employee_id)
  const output = serverMessage
  serverMessage = undefined
  res.render('userReports', {
    userRoutes: req.userRoutes,
    reports: resultQuery,
    message: output,
  })
})

router.get('/login', (req, res) => {
  const output = serverMessage
  serverMessage = undefined
  res.render('login', { loginMessage: output })
})

router.get('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/login')
})

router.post('/login', async (req, res) => {
  try {
    await login(req, res)
  } catch (error) {
    serverMessage = 'Wrong credentials'
    res.clearCookie('token')
    return res.redirect('/login')
  }
})

router.post('/signup/:token?', async (req, res) => {
  serverMessage = await updatePassword(req, res)
  return res.redirect(req.url)
})

router.get('/signup/:token?', (req, res) => {
  const token = req.params.token

  if (!token) {
    return res.redirect('/login')
  }

  const output = serverMessage

  serverMessage = undefined

  res.render('signup', {
    message: output,
  })
})

router.get('/reports/:reportId', middlewareAuth, (req, res) => {
  return res.render('individualReport', {
    userRoutes: req.userRoutes,
  })
})

router.post('/reports/:reportId', async (req, res) => {
  serverMessage = await insertMessage(req.params.reportId, req.body.textInput)
  return res.redirect('/reports')
})

router.use((req, res) => {
  return res.render('notFound')
})

module.exports = router
