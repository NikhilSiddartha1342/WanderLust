const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        // type: String,
        // default: "https://source.unsplash.com/random/800x600/?travel,nature",
        // set: (v) => (v === "" ? "https://source.unsplash.com/random/800x600/?travel,nature" : v),
        url : String, 
        filename : String,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    geometry : {
        type : {
            type : String,
            enum : ['Point'],
            required : true
        },
        coordinates : {
            type : [Number], 
            required : true
        }
    },
    // category : {
    //     type : String,
    //     enum : ["Rooms", "Iconic Cities"]
    // }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;