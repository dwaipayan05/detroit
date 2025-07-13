// routes/repo.js
const express = require('express');
const { addRepository } = require('../controllers/repositoryController');
const { chat } = require('../controllers/chatController');

const router = express.Router();

router.post('/repositories', addRepository);
router.post('/chat', chat);


module.exports = router;
