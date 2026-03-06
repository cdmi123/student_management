const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Protect all course routes
router.use(ensureAuthenticated);

router.get('/add', courseController.getAddCourse);
router.post('/add', courseController.postAddCourse);
router.get('/list', courseController.getCourseList);
router.get('/edit/:id', courseController.getEditCourse);
router.post('/edit/:id', courseController.postEditCourse);
router.post('/delete/:id', courseController.deleteCourse);

// API Route for AJAX course selection
router.get('/api/:id', courseController.getCourseById);

module.exports = router;
