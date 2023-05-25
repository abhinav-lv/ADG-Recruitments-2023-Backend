const express = require("express");
const router = express.Router();

const {startTest,endTest} = require('../controllers/testControllers')

router.get('/start', startTest)

router.get('/end', endTest)

module.exports = router