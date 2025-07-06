require('dotenv').config();
require('express-async-errors');
const User = require('./models/User');
const session = require('express-session');

// Extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

const express = require('express');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const app = express();

// Connect to DB and auth middleware
const connectDB = require('./db/connect');
const authenticationMiddleware = require('./middleware/authentication');

// Routers
const authRouter = require('./routes/auth');
const cakesRouter = require('./routes/cakes');

// Security & parsing middleware — IMPORTANT: order matters!
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));
app.use(express.json());
app.use(cors());
app.use(xss());
app.use(helmet());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(csurf({ cookie: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'someSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

const authentication = (req, res, next) => {
  console.log('Session:', req.session);
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).send('Unauthorized: Please log in to access this resource.');
};

// Inject CSRF token into res.locals for use in templates/forms
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Content-Type middleware
app.use((req, res, next) => {
  if (req.path === "/multiply") {
    res.set("Content-Type", "application/json");
  } else {
    res.set("Content-Type", "text/html");
  }
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send('<html><body>Click this link to <a href="/session/logon">logon</a></body></html>');
});

app.get("/session/register", (req, res) => {
  const token = res.locals.csrfToken;
  res.send(
    `<form method="POST" action="/session/register">
       <input type="hidden" name="_csrf" value="${token}">
       Enter your name: <input name="name" />
       <!-- other form fields -->
       <button type="submit">Register</button>
     </form>`
  );
});

app.post('/session/register', async (req, res, next) => {
  try {
    const { name, email, password, password1, _csrf } = req.body;

    // Basic validation
    if (!name || !email || !password || !password1) {
      return res.status(400).send('Missing required fields');
    }
    if (password !== password1) {
      return res.status(400).send('Passwords do not match');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already registered');
    }

    
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Respond with a success page or redirect
    res.status(200).send('Cakes List');
  } catch (err) {
    next(err);
  }
});

app.get("/session/logon", (req, res) => {
  res.send(`
    <form method="POST" action="/session/logon">
      <input type="hidden" name="_csrf" value="${res.locals.csrfToken}" />
      Email: <input name="email" />
      Password: <input name="password" type="password" />
      <button type="submit">Logon</button>
    </form>
  `);
});


app.post('/session/logon', async (req, res, next) => {
  console.log('POST /session/logon called with body:', req.body);
  try {
    const { email, password, _csrf } = req.body;

    if (!email || !password) {
      return res.status(400).send('Missing email or password');
    }

    // Find user
    const user = await User.findOne({ email });
    console.log('Found user:', user);
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }


    // Save user info in session
    req.session.userId = user._id;
    req.session.userEmail = user.email;
    console.log('Setting session userId:', user._id);


    // Respond with success or redirect
    res.status(200).send('Logged in successfully');
  } catch (err) {
    next(err);
  }
});

app.get('/jobs', authentication, (req, res) => {
  res.send('<table>' + '<tr></tr>'.repeat(20) + '</table>');
});


app.get("/multiply", (req, res) => {
  let result = req.query.first * req.query.second;
  if (isNaN(result)) {
    result = "NaN";
  } else if (result == null) {
    result = "null";
  }
  res.json({ result });
});

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/cakes', authenticationMiddleware, cakesRouter);

// Middleware for handling 404 and errors
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(notFoundMiddleware);

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).send('Form tampered with');
  } else {
    next(err);
  }
});

app.use(errorHandlerMiddleware);

// Start server
const port = process.env.PORT || 3000;
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV === "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}

const start = async () => {
  try {
    await connectDB(mongoURL);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();

module.exports = { app };
