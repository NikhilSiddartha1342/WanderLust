if(process.env.NODE_ENV != "production") {
    require('dotenv').config()
}
// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
//ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//parsing data from get/post request
app.use(express.urlencoded({extended : true}));
//overriding 
//reqired modules for patch, put
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
//ejs mate for styling
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
//for using static files(css, js)
app.use(express.static(path.join(__dirname, "/public")));
//for using error handling class files written in utils

const ExpressError = require("./utils/ExpressError.js");
//exporting schema through JOI paxkage(schmea(reviewSchema, listingSchema))

//exporting models mongodb schemas(listing, review(models))

//express routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//session
const session = require("express-session");
//flash
const flash = require("connect-flash");
//authenticate(passport package which has inbuilt authentication capabilities)
const passport = require("passport")
const LocalStrategy = require("passport-local");//local is a strategy which authenticates based on username and password
const User = require("./models/user.js");//this is where user is defined means what are the login credentials required for any user


//mongostore for final database internet connection
const MongoStore = require("connect-mongo");



/*
multer for reading file uploads
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
*/

const dburl = process.env.ATLASDB_URL;
main().then(() => {
    console.log("Connected to DB successfully");
}).catch((err) => console.log(err));
//database connection
async function main() {
    mongoose.connect(dburl);
}


const store = MongoStore.create({
    mongoUrl : dburl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24*60*60,//once loggged in it will be available for  1day after 1 day it will automatically logged out of your device
})

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
})

const sessonOptions = {
    store,//info regarding mongStore
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000,//1 week millisec, this cookie will work upto next seven days
        maxAge : 7*24*60*60*1000,
        httpOnly : true,//security purposes(cross scripting attacks)
    }
}






app.use(session(sessonOptions));
app.use(flash());
//flash should be written before routes because they work on routes and below session

//To implement passport we require session(user in single will be same eventhough he is in different page of same brouser)
app.use(passport.initialize());//initalize passport
app.use(passport.session());//initializing passport for that session so should be written below to session
passport.use(new LocalStrategy(User.authenticate()));//localstrategy is authentication startegy which authenticates based on username, password and then calling user which is schema and authenticate() to authenicate

passport.serializeUser(User.serializeUser());//to store all information of a user in a session
passport.deserializeUser(User.deserializeUser());//to delete all session information after its use



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

//storing demouser and authenticating it in database
// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "delta-student",
//     })
//     let registeredUser = await User.register(fakeUser, "helloWorld");
//     res.send(registeredUser);
// })



app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

/*
basic api
app.get("/", (req, res) => {
    res.send("root route is working");
})
*/



/*
//this is server side error handling
//we are creating joi middleware which will validate form when submtted and throw error when it finds a error
//incldue this middleware when we require errorhandling and validating of form
const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}
*/

/*
//DELETE ROUTE
//when clicked delete button from show.ejs a route is created which gets the id of listing which we need to delete
//we will delete the listing with the id we get
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))



//UPDATE ROUTE
//generated when form is submitedby edit route
//this form contains the date which is the updated data which we should store to database
app.put("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let listing = req.body.listing;
    //... is deconstructor which converts a parameter into individual values req.body is javascript object which contains all parameter which go to new updated values

    //anything int the below two lines work

    // await Listing.findByIdAndUpdate(id, {...req.body.listing});
    await Listing.findByIdAndUpdate(id, listing);

    res.redirect(`/listings/${id}`);
}))




//EDIT ROUTE
//generataed when we open a listing at last we have an edit option when clicked this route will be generated
//this is an get request in this we create a form to take new information which we should update into database 
//we take info from form and send another  put request which contains this updated info and updates thedata
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}))



//CREATE ROUTE
//this is generated when form is submitted in new.ejs when we want to add new user into our database
//this is a post request where we get all info in type of body here we should add that info into database
app.post("/listings", wrapAsync(async (req, res, next) => {
    if (!req.body.listing.image) {
        req.body.listing.image = "https://source.unsplash.com/1600x900/?house";
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));


app.post("/listings", wrapAsync(async (req, res, next) => {
    if(!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    let data = req.body.listing;

    // Convert string to image object with 'url'
    data.image = {
        url: data.image,
        filename: data.filename // you can skip or populate later
    };

    //evaluating schema through joi
    // let result = listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error) {
    //     throw new ExpressError(404, result.error);
    // }

    const newListing = new Listing(data);
    await newListing.save();
    res.redirect("/listings"); 

}));




//NEW ROUTE
//this is generated when create new route button was clicked when displaying all routes by index route
//this is a get request when activated a form should appear which should collect info about new listing and create another request which will insert this data into database
app.get("/listings/new", wrapAsync((req, res) => {
    res.render("listings/new.ejs");
}))

//SHOW ROUTE
// (This is generated when clicked on link generated ny index route)
//this request is a get request which is generated with id the place which we want to see
//we fetch the place based on id generated from index route req
app.get('/listings/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}))

//INDEX ROUTE
// (display all listings)
app.get("/listings", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}))
*/



/*
//REVIEWS
//Post route
//This is genarated when you submit review form in show.ejs
//This request is post req which contains the info of review which we should add
//here we add a review based on id of listing to that listing
app.post("/listings/:id/reviews", validateReview,  wrapAsync(async(req, res) => {
    //errorhandling - wrapsync
    //wherever we write async we should write wrapasync it handles basic error handling
    //validateReview is a middleware which validates data collected from form
    let listing = await Listing.findById(req.params.id);
    let newreview = new Review(req.body.review);

    listing.reviews.push(newreview)
    await newreview.save();
    await listing.save();

    console.log("New review saved");
    res.redirect(`/listings/${listing._id}`)
}))



// DELETEreview ROUTE
// every review is associated with adelete button when clicked this route is generated
// we have to remove that review from reviews array and from that listing reviews
// we will remove from listing using findByIdAndDelete and remove from review array by using pull which delets things
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/listings/${id}`);
}))
    */


/*
app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing({
        title : 'My New Villa',
        description : "By the beach",
        price : 1200,
        location : "Calangute, Goa",
        country : 'India',
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("Successful testing");
})


we will create a route which will accept any request to service missing requests
this route will be executed only when any route doesnt matches
/ 404 handler for all unmatched routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});
Centralized error handler middleware
*/


app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err); // delegate to default Express error handler
    }

    let { status = 500, message = "Something went wrong" } = err;
    res.status(status).render("error.ejs", { err });
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
});

// Export the Express API for Vercel
module.exports = app;
