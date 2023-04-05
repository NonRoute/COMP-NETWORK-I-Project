const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const ngrok = require('ngrok')
const nodemon = require('nodemon')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

ngrok.connect({ authtoken: process.env.NGROK_TOKEN, addr: process.env.PORT || 3000 }).then((url) => {
	console.log(`ngrok tunnel opened at: ${url}`)
	console.log('Set this as REACT_APP_SERVER_URL in client .env and restart client')
})

const app = express()
app.use(cors())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

module.exports = app
