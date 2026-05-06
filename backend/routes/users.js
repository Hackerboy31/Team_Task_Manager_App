const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/', verifyToken, getUsers);

module.exports = router;
