const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize Upload Variable
const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB Limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

// Protect all student routes
router.use(ensureAuthenticated);

router.get('/add', studentController.getAddStudent);
router.post('/add', upload.single('image'), studentController.postAddStudent);
router.get('/list', studentController.getStudentList);
router.get('/installments', studentController.getInstallmentReport);

// Additional routes for edit/delete can be added here if needed

module.exports = router;
