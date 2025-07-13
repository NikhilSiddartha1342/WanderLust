const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;

if (!mapToken) {
    console.warn("MAP_TOKEN environment variable is not set. Map functionality will be disabled.");
}

const geoCodingClient = mapToken ? mbxGeocoding({ accessToken : mapToken}) : null;


module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path : "reviews",
        populate : {
            path : "author",//here we are nesting.Author inside review
        },
    }).populate("owner");
    // console.log("Listing Image URL:", listing.image);
    if(!listing) {
        req.flash("error", "Listing you requested , Does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    // console.log("Request Body:", req.body.listing);
    
    let geometry = { type: "Point", coordinates: [0, 0] }; // Default coordinates
    
    if (geoCodingClient) {
        try {
            let response = await geoCodingClient
                .forwardGeocode({
                    query : req.body.listing.location,
                    limit : 1,//default : 5
                })
                .send();
            
            if (response.body.features && response.body.features.length > 0) {
                geometry = response.body.features[0].geometry;
            }
        } catch (error) {
            console.warn("Geocoding failed, using default coordinates:", error.message);
        }
    }


    let url = req.file.path;
    let filename = req.file.filename;

    // console.log(url, " ", filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = geometry;
    // passport stores user information in req.user. we are using it for defining owner of a listing
    await newListing.save();

    req.flash("success", "New listing created!!!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
     if(!listing) {
        req.flash("error", "Listing you requested , Does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_250")
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", deletedListing);
    req.flash("success", "Listing Deleted!!")
    res.redirect("/listings");
}