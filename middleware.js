const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        //when we want to add a new listing we have to login when we login it will show root page.SO to save the redirected url we save that in tthe session info so we can access it in all sessions of that req
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of the Listing.")
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of the Review.")
        return res.redirect(`/listings/${id}`);
    }
    next();
}