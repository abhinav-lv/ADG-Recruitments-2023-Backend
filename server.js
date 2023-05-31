require('dotenv').config()
const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const cors = require('cors')

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

const corsOptions = {
    origin: 'https://adg-recruitments-2023.vercel.app',
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ["set-cookie"],
    allowedHeaders: ["set-cookie","origin","content-type","accept"]
}

app.use(cors(corsOptions))

// Middleware
app.use(express.json())
app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: true, maxAge: 2*60*60*1000, httpOnly: true, path:'/', sameSite: 'none',} // 2 hours
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