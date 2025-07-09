const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async(req, res) => {
    try {
        let {username, password, email} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        // console.log(registeredUser);

        req.login(registeredUser, (err) => {//passport has inbuilt login method whicg automatically establishes a login session.
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust!!!");
            res.redirect("/listings");
        })
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm =  (req, res) => {
    res.render("users/login.ejs")
}

module.exports.login = async(req, res) => {
    //passport.autenticate() is a middleware which handles authentication
    //we will enter this body only when authentiation is successful
    req.flash("success", "Welcome back to WanderLust!");
    //in case of failure passport will send a failure message


    // res.redirect(req.session.redirectUrl);
    //whenever we are required to login we will come here so we will redirect to the route which sent the login req
    //pasport will delete all session info.SO store in locals
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {//req.logout is already defined function in passport which logouts user using deserialize
        if(err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect('/listings');
    })
}