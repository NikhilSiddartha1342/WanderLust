const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");

// Import models and utilities
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");

// Import routes
const listingRouter = require("../routes/listing.js");
const reviewRouter = require("../routes/review.js");
const userRouter = require("../routes/user.js");

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "../public")));

// Database connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    const dburl = process.env.ATLASDB_URL;
    if (!dburl) {
      throw new Error('ATLASDB_URL environment variable is not set');
    }
    
    await mongoose.connect(dburl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log("Connected to DB successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

// Session configuration
const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Root route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("Error:", err);
  
  let { status = 500, message = "Something went wrong" } = err;
  
  // For API routes, send JSON
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ error: message });
  }
  
  // For web routes, render error page
  res.status(status).render("error.ejs", { err });
});

// Serverless function handler
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};