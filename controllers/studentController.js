const Student = require('../models/Student');
const Course = require('../models/Course');
const fs = require('fs');
const path = require('path');

exports.getAddStudent = async (req, res) => {
    try {
        const courses = await Course.find();
        res.render('student/addStudent', { courses, currentPath: '/student/add' });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.postAddStudent = async (req, res) => {
    try {
        const {
            surname, studentName, fatherName, studentContact, parentsContact,
            address, dob, qualification, referenceType, referenceName,
            courseId, courseDuration, dailyTime, courseContent, totalFees, joiningDate
        } = req.body;

        // Parse installments from body
        let installments = [];
        if (req.body['installments[amount][]']) {
            const amounts = Array.isArray(req.body['installments[amount][]']) ? req.body['installments[amount][]'] : [req.body['installments[amount][]']];
            const dates = Array.isArray(req.body['installments[date][]']) ? req.body['installments[date][]'] : [req.body['installments[date][]']];

            for (let i = 0; i < amounts.length; i++) {
                if (amounts[i] && dates[i]) {
                    installments.push({
                        amount: Number(amounts[i]),
                        date: new Date(dates[i])
                    });
                }
            }
        }

        // Ensure installments are sorted by date
        installments.sort((a, b) => a.date - b.date);

        const newStudent = new Student({
            surname, studentName, fatherName, studentContact, parentsContact,
            address, dob, qualification, referenceType, referenceName,
            image: req.file ? req.file.filename : null,
            courseId, courseDuration, dailyTime, courseContent, totalFees: Number(totalFees), joiningDate,
            installments
        });

        await newStudent.save();
        res.redirect('/student/list');

    } catch (err) {
        console.error(err);
        const courses = await Course.find();
        res.render('student/addStudent', { courses, error: 'Failed to add student. ' + err.message, currentPath: '/student/add' });
    }
};

exports.getStudentList = async (req, res) => {
    try {
        const students = await Student.find().populate('courseId').sort({ createdAt: -1 });
        res.render('student/studentList', { students, currentPath: '/student/list' });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.getInstallmentReport = async (req, res) => {
    try {
        // Find all students that have installments
        const students = await Student.find({ "installments.0": { "$exists": true } }).populate('courseId').sort({ createdAt: -1 });
        res.render('student/installmentReport', { students, currentPath: '/student/installments' });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};
