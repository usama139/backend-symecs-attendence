const express = require('express');
const router = express.Router();
const { registerDIT } = require('../controllers/registrationController');

// @route   POST /api/registration/dit
// @desc    Register for DIT Batch 36
// @access  Public
router.post('/dit', registerDIT);

module.exports = router;
