const Student = require('../models/Student');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const fs = require('fs');
const path = require('path');

exports.getAddStudent = async (req, res) => {
    try {
        const courses = await Course.find();
        const faculties = await Faculty.find();
        res.render('student/addStudent', { courses, faculties, currentPath: '/student/add' });
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
            courseId, courseDuration, dailyTime, courseContent, totalFees, joiningDate, endingDate,
            facultyId, batchTime, pcNo, runningTopic, extraNote
        } = req.body;

        // Parse installments from body
        let installments = [];
        const amounts = req.body['instAmount[]'];
        const dates = req.body['instDate[]'];

        if (amounts) {
            const amountArr = Array.isArray(amounts) ? amounts : [amounts];
            const dateArr = Array.isArray(dates) ? dates : [dates];

            for (let i = 0; i < amountArr.length; i++) {
                if (amountArr[i] && dateArr[i]) {
                    installments.push({
                        amount: Number(amountArr[i]),
                        date: new Date(dateArr[i])
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
            courseId, courseDuration, dailyTime, courseContent, totalFees: Number(totalFees), joiningDate, endingDate,
            facultyId, batchTime, pcNo, runningTopic, extraNote,
            installments
        });

        await newStudent.save();
        res.redirect('/student/list');

    } catch (err) {
        console.error(err);
        const courses = await Course.find();
        const faculties = await Faculty.find();
        res.render('student/addStudent', { courses, faculties, error: 'Failed to add student. ' + err.message, currentPath: '/student/add' });
    }
};

exports.getStudentList = async (req, res) => {
    try {
        const students = await Student.find().populate('courseId').populate('facultyId').sort({ createdAt: -1 });
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
