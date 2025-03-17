const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/typingspeedtest");


const testSchema = mongoose.Schema({
    testDate : Date,
    wpm: Number,
    accuracy: Number
});


const schema = mongoose.Schema({
    username : {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    tests: [{
        type: testSchema
    }]
})

module.exports = mongoose.model("user", schema);