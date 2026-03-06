const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// All faculty routes should be authenticated
router.use(ensureAuthenticated);

router.get('/add', facultyController.getAddFaculty);
router.post('/add', facultyController.postAddFaculty);
router.get('/list', facultyController.getFacultyList);

module.exports = router;
