const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
}));

// Setup Global variables for views
app.use((req, res, next) => {
    res.locals.admin = req.session.admin || null;
    next();
});

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/student', require('./routes/studentRoutes'));
app.use('/course', require('./routes/courseRoutes'));

const dashboardController = require('./controllers/dashboardController');
const { ensureAuthenticated } = require('./middleware/authMiddleware');

// Basic Dashboard Route for now
app.get('/', ensureAuthenticated, dashboardController.getDashboard);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
