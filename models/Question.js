require('dotenv').config()
const mongoose = require('mongoose');
const {Schema} = mongoose;

mongoose.connect(process.env.MONGO_URI);

const questionSchema = new Schema({
    domain: {type: String},
    subdomain: {type: String},
    yearOfStudy: {type: Number},
    questions: {type: Array},
})

const QuestionModel = mongoose.model('Question', questionSchema)

module.exports = QuestionModel