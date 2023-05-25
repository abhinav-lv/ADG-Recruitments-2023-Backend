const express = require("express");
const router = express.Router();

const { setQuestions, getQuestions } = require('../controllers/questionControllers')

// To get questions from client side admin portal
router.post('/set', setQuestions)

// To send questions from server to client side
router.post('/get', getQuestions)

module.exports = router