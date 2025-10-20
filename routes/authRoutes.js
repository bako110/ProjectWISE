const express = require('express');
const { register } = require('../controllers/auth.js');

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

module.exports = router; // module.exports au lieu de export default
