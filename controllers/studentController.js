const Student = require('../models/Student');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Fee = require('../models/Fee');
const Leave = require('../models/Leave');
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
        const amounts = req.body['instAmount[]'] || req.body.instAmount;
        const dates = req.body['instDate[]'] || req.body.instDate;

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
        const faculties = await Faculty.find().sort({ name: 1 });
        res.render('student/studentList', { students, faculties, currentPath: '/student/list' });
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

exports.getStudentView = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('courseId')
            .populate('facultyId');

        if (!student) {
            return res.redirect('/student/list');
        }

        const fees = await Fee.find({ studentId: student._id }).populate('createdBy').sort({ createdAt: 1 });
        const leaves = await Leave.find({ studentId: student._id }).populate('facultyId').sort({ startDate: -1 });
        const faculties = await Faculty.find().sort({ name: 1 });

        res.render('student/viewStudent', {
            student,
            fees,
            leaves,
            faculties,
            currentPath: '/student/list'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/student/list');
    }
};

exports.postAddLeave = async (req, res) => {
    try {
        const { dateRange, note, facultyId } = req.body;
        const studentId = req.params.id;

        // Parse dateRange: "DD/MM/YYYY - DD/MM/YYYY"
        const dates = dateRange.split(' - ');
        if (dates.length !== 2) {
            throw new Error('Invalid date range format');
        }

        const [startDay, startMonth, startYear] = dates[0].split('/');
        const [endDay, endMonth, endYear] = dates[1].split('/');

        const startDate = new Date(`${startYear}-${startMonth}-${startDay}`);
        const endDate = new Date(`${endYear}-${endMonth}-${endDay}`);

        const leave = new Leave({
            studentId,
            startDate,
            endDate,
            note,
            facultyId
        });

        await leave.save();
        res.redirect(`/student/view/${studentId}`);
    } catch (err) {
        console.error('Leave Error:', err);
        res.redirect('back');
    }
};

exports.getDueFees = async (req, res) => {
    try {
        const students = await Student.find()
            .populate('courseId')
            .populate('facultyId');

        const now = new Date();
        const dueStudentsList = [];

        // Determine which students have pending installments
        for (let student of students) {
            // First we need to know the total they have paid so far
            const fees = await Fee.find({ studentId: student._id });
            const totalPaid = fees.reduce((sum, fee) => sum + fee.amount, 0);

            if (student.installments && student.installments.length > 0) {
                let accumPaid = totalPaid;
                const overdueInstallments = [];
                let currentMonthDue = 0;
                let prevMonthDue = 0;

                for (let inst of student.installments) {
                    if (accumPaid >= inst.amount) {
                        accumPaid -= inst.amount;
                    } else {
                        // This installment is entirely or partially unpaid
                        const remainingToPay = inst.amount - accumPaid;
                        accumPaid = 0; // consumed all paid amount

                        const instDate = new Date(inst.date);

                        // Check if it's past the due date (meaning it is due)
                        if (instDate <= now) {
                            overdueInstallments.push({ ...inst.toObject(), pendingAmount: remainingToPay });

                            if (instDate.getMonth() === now.getMonth() && instDate.getFullYear() === now.getFullYear()) {
                                currentMonthDue += remainingToPay;
                            } else {
                                prevMonthDue += remainingToPay;
                            }
                        }
                    }
                }

                if (overdueInstallments.length > 0) {
                    dueStudentsList.push({
                        student,
                        totalPaid,
                        currentMonthDue,
                        prevMonthDue,
                        totalDue: currentMonthDue + prevMonthDue,
                        overdueInstallments,
                        followUpDate: student.followUpDate, // pass for verification
                        followUpNote: student.followUpNote
                    });
                }
            }
        }

        let grandTotalDue = 0;
        let grandPrevMonthDue = 0;
        let grandCurrentMonthDue = 0;

        dueStudentsList.forEach(item => {
            grandTotalDue += item.totalDue;
            grandPrevMonthDue += item.prevMonthDue;
            grandCurrentMonthDue += item.currentMonthDue;
        });

        res.render('student/dueList', {
            dueStudents: dueStudentsList,
            grandTotalDue,
            grandPrevMonthDue,
            grandCurrentMonthDue,
            currentPath: '/student/due'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/student/list');
    }
};

exports.getEditStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findById(studentId).populate('courseId').populate('facultyId');

        if (!student) {
            return res.redirect('/student/list');
        }

        const courses = await Course.find();
        const faculties = await Faculty.find();
        const fees = await Fee.find({ studentId: studentId });
        const totalPaid = fees.reduce((sum, fee) => sum + fee.amount, 0);

        res.render('student/editStudent', {
            student,
            courses,
            faculties,
            totalPaid,
            currentPath: '/student/list'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/student/list');
    }
};

exports.postEditStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Use the exact same structured data mapping logic from postAddStudent for safety
        const {
            surname, studentName, fatherName, studentContact, parentsContact,
            address, dob, qualification, referenceType, referenceName,
            courseId, courseDuration, dailyTime, courseContent, totalFees,
            joiningDate, endingDate, facultyId, batchTime, pcNo, runningTopic, extraNote, status
        } = req.body;

        // Construct installments array robustly taking into account multiple installments
        let installmentsArray = [];

        const amounts = req.body['instAmount[]'] || req.body.instAmount;
        const dates = req.body['instDate[]'] || req.body.instDate;

        if (amounts) {
            const amountArr = Array.isArray(amounts) ? amounts : [amounts];
            const dateArr = Array.isArray(dates) ? dates : [dates];

            for (let i = 0; i < amountArr.length; i++) {
                if (amountArr[i] && dateArr[i]) {
                    installmentsArray.push({
                        amount: Number(amountArr[i]),
                        date: new Date(dateArr[i])
                    });
                }
            }
        }

        // Ensure installments are sorted by date
        installmentsArray.sort((a, b) => a.date - b.date);

        const updatedData = {
            surname,
            studentName,
            fatherName,
            studentContact,
            parentsContact,
            address,
            dob: dob ? new Date(dob) : null,
            qualification,
            courseId: courseId || undefined,
            courseDuration,
            dailyTime,
            courseContent,
            totalFees: Number(totalFees),
            joiningDate: joiningDate ? new Date(joiningDate) : null,
            endingDate: endingDate ? new Date(endingDate) : null,
            facultyId: facultyId || null,
            batchTime: batchTime || '',
            pcNo: pcNo || '',
            runningTopic: runningTopic || '',
            extraNote: extraNote || '',
            status: status || 'R',
            referenceType,
            referenceName,
            installments: installmentsArray
        };

        // If a new image was uploaded, process it
        if (req.file) {
            updatedData.image = req.file.filename;
        }

        const result = await Student.findByIdAndUpdate(studentId, updatedData, { new: true, runValidators: true });

        if (!result) {
            throw new Error('Student not found for updating.');
        }

        res.redirect('/student/view/' + studentId);

    } catch (err) {
        console.error('Update Error:', err);
        const courses = await Course.find();
        const faculties = await Faculty.find();
        const student = await Student.findById(req.params.id);
        res.render('student/editStudent', {
            student,
            courses,
            faculties,
            error: 'Failed to update student: ' + err.message,
            currentPath: '/student/list'
        });
    }
};

exports.postAddFollowUp = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { followUpDate, followUpNote } = req.body;

        await Student.findByIdAndUpdate(studentId, {
            followUpDate: followUpDate ? new Date(followUpDate) : null,
            followUpNote: followUpNote || ''
        });

        res.redirect('/student/due');
    } catch (err) {
        console.error('Follow-up Error:', err);
        res.redirect('/student/due');
    }
};
