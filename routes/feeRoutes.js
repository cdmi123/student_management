const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.use(ensureAuthenticated);

router.get('/add/:studentId', feeController.getAddFee);
router.post('/add', feeController.postAddFee);

module.exports = router;
