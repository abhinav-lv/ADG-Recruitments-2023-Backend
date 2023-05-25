const express = require("express");
const router = express.Router();

const { getResponses } = require('../controllers/responseControllers')

router.post('/send', getResponses)

module.exports = router