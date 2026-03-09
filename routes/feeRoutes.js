const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.use(ensureAuthenticated);

router.get('/add/:studentId', feeController.getAddFee);
router.post('/add', feeController.postAddFee);
router.get('/list', feeController.getFeeList);
router.get('/report', feeController.getPaymentReport);
router.get('/api/report', feeController.getPaymentReportApi);
router.get('/receipt/:id', feeController.getReceipt);

module.exports = router;
