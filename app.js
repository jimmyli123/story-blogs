const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')
const methodOverride = require('method-override')



// Load config
dotenv.config({ path: './config/config.env'})

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

// Method override
app.use(methodOverride('_method'))

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Handlebars Helpers - moment
const {formatDate, truncate, stripTags, editIcon, select} = require('./helpers/hbs')

// Handlebars
app.engine('.hbs', exphbs(
    {helpers: {formatDate, stripTags, truncate, editIcon, select}, 
    defaultLayout: 'main', 
    extname: '.hbs'}))
app.set('view engine', '.hbs')

// Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection}) // stores our session so we don't have to re-login
  }))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})


// Static folder
app.use(express.static("public"))

// Routers
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(PORT, 
    console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`)
)