const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js")


router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup))


router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,
    passport.authenticate("local", {
    failureRedirect : "/login",
    failureFlash : true, 
}), userController.login)

//LOGOUT ROUTE - to logout from application
router.get("/logout", userController.logout)




/*
GET SIGNUP
when new user want to signup
here we are rendring a form hich takes info of user who want to enter our website
router.get("/signup", userController.renderSignupForm);

//POST SIGNUP
//in this post which is generated after submitting form in et req of signup
//here we take info collected by form in get req and save to database

router.post("/signup", wrapAsync(userController.signup))



//GET LOGIN
//this is login route when user want to login he enters this route.Here we take his credentials and send for validation
router.get("/login", userController.renderLoginForm)


//POST LOGIN
//this is post login request here we validate user with the info he has given in the get request
//if user is already available in the databse then we will allow him to enter the website else redirect to signup page

router.post("/login", saveRedirectUrl,//saveredirecturl is local which store the url whihc creates lgin req so after login we will redirect to that req page whihc genrates login
    passport.authenticate("local", {//local is the strategy(email, password)
    failureRedirect : "/login",//to redirect if authentication fails
    failureFlash : true, //to throw popup message wy authenticatin failed
}), userController.login)

*/


module.exports = router;