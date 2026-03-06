const Course = require('../models/Course');

exports.getAddCourse = (req, res) => {
    res.render('course/addCourse', { currentPath: '/course/add' });
};

exports.postAddCourse = async (req, res) => {
    try {
        const { courseName, duration, content, fees } = req.body;
        const newCourse = new Course({ courseName, duration, content, fees });
        await newCourse.save();
        res.redirect('/course/list');
    } catch (err) {
        console.error(err);
        res.render('course/addCourse', { error: 'Failed to add course', currentPath: '/course/add' });
    }
};

exports.getCourseList = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.render('course/courseList', { courses, currentPath: '/course/list' });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.getEditCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.redirect('/course/list');
        res.render('course/addCourse', { course, isEdit: true, currentPath: '/course/list' });
    } catch (err) {
        console.error(err);
        res.redirect('/course/list');
    }
};

exports.postEditCourse = async (req, res) => {
    try {
        const { courseName, duration, content, fees } = req.body;
        await Course.findByIdAndUpdate(req.params.id, { courseName, duration, content, fees });
        res.redirect('/course/list');
    } catch (err) {
        console.error(err);
        res.redirect('/course/list');
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.redirect('/course/list');
    } catch (err) {
        console.error(err);
        res.redirect('/course/list');
    }
};

// API endpoint for AJAX request
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
