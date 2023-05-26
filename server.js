require('dotenv').config()
const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')

// Import route handlers
const authRoutes = require('./routes/authRoutes')
const questionRoutes = require('./routes/questionRoutes')
const responseRoutes = require('./routes/responseRoutes')
const testRoutes = require('./routes/testRoutes')

// Import Redis Session Store
const {redisStore} = require('./sessions/RedisStore');

// Connect to MongoDB
mongoose.connect(`${process.env.MONGO_URI}`)
const db = mongoose.connection
db.once('open', () => console.log('Connected to MongoDB'))
db.on('error', (error) => console.error(error.message))

// Initialize express app
const app = express()

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://adg-recruitments-2023.vercel.app');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Middleware
app.use(express.json())
app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: true, httpOnly: true, sameSite: 'none'} // 24 hours
}));

// Root route
app.get('/', (req,res) => res.send('Server root route'))

// Auth
app.use('/auth', authRoutes)

// Questions
app.use('/questions', questionRoutes)

// Responses
app.use('/responses', responseRoutes)

// Test
app.use('/test', testRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));