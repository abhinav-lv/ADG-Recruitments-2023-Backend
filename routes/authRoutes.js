const express = require("express");
const router = express.Router();

const { authenticateUser, authorizeUser, logUserOut } = require('../controllers/authControllers')

router.post('/authenticate', authenticateUser)

router.get('/authorize', authorizeUser)

router.get('/logout', logUserOut)

module.exports = router