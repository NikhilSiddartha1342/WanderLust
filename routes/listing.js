const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const { storage } = require("../cloudConfig.js")
//const upload = multer({ dest: 'uploads/' })autmatically create uploads folder if not present
const upload = multer({ storage })//now multer will store to cloud

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//router.route helps us to match routes with same path and rmove naming convetion problems
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
      isLoggedIn, 
      upload.single('listing[image]'), 
      validateListing, 
      wrapAsync(listingController.createListing)
    );

    // .post( upload.single('listing[image]'), (req, res) => {
    //     res.send(req.file)
        //req.file contains path with which we can see the image
    // })
    //this will take some to upload because first it should parse the image then store in cludinary

//new id kanna mundu rayali endhuku ante new ni id la tesukoni error isatdi
// NEW route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))


// EDIT route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));


// INDEX route
// router.get("/", wrapAsync(listingController.index));



// SHOW route
// router.get("/:id", wrapAsync(listingController.showListing));

// CREATE route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));


// UPDATE route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// DELETE route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;