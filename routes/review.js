const express = require("express");
const router = express.Router({mergeParams : true});
//id parent nunchi child velinapudu value marakuna vundadaniki
//manam review/:id/ munde define chsam kada id ah page varake pai=ni chesthadi ikaad true rayakapothe
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const { reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

router.post("/", isLoggedIn, validateReview,  wrapAsync(reviewController.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;