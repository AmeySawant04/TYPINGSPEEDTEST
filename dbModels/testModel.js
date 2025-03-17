const mongoose = require("mongoose");

const schema = mongoose.Schema({
    testDate : Date,
    wpm: Number,
    acc: Number
});

module.exports = mongoose.model("test", schema);