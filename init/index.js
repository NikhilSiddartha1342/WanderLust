const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");//two dots for selecting another folder

main().then(() => {
    console.log("Connected to DB successfully");
}).catch((err) => console.log(err));

async function main() {
    mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async() => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj, owner : '6863fc20ecf31d4cd350e69a',
    }))
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
}

initDB();