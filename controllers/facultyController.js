const Faculty = require('../models/Faculty');

// @desc    Show add faculty form
// @route   GET /faculty/add
exports.getAddFaculty = (req, res) => {
    res.render('faculty/addFaculty', {
        title: 'Add Faculty',
        error: null,
        success: null
    });
};

// @desc    Process add faculty
// @route   POST /faculty/add
exports.postAddFaculty = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Basic validation
        if (!name || !email || !password) {
            return res.render('faculty/addFaculty', {
                title: 'Add Faculty',
                error: 'All fields are required',
                success: null
            });
        }

        // Check if faculty already exists
        const existingFaculty = await Faculty.findOne({ email });
        if (existingFaculty) {
            return res.render('faculty/addFaculty', {
                title: 'Add Faculty',
                error: 'Faculty with this email already exists',
                success: null
            });
        }

        const newFaculty = new Faculty({
            name,
            email,
            password // Note: In a real app, hash this password
        });

        await newFaculty.save();

        res.render('faculty/addFaculty', {
            title: 'Add Faculty',
            error: null,
            success: 'Faculty added successfully!'
        });
    } catch (err) {
        console.error(err);
        res.render('faculty/addFaculty', {
            title: 'Add Faculty',
            error: 'Server Error',
            success: null
        });
    }
};

// @desc    Show faculty list
// @route   GET /faculty/list
exports.getFacultyList = async (req, res) => {
    try {
        const faculties = await Faculty.find().sort({ createdAt: -1 });
        res.render('faculty/viewFaculty', {
            title: 'Faculty List',
            faculties
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
