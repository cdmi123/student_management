const Student = require('../models/Student');
const Course = require('../models/Course');

exports.getDashboard = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalCourses = await Course.countDocuments();

        let totalFees = 0;
        let collectedFees = 0;
        let pendingFees = 0;

        const students = await Student.find({}, 'totalFees installments');

        students.forEach(student => {
            totalFees += student.totalFees || 0;

            let paidByStudent = 0;
            if (student.installments && student.installments.length > 0) {
                student.installments.forEach(inst => {
                    paidByStudent += inst.amount;
                });
            }

            collectedFees += paidByStudent;
        });

        pendingFees = totalFees - collectedFees;

        res.render('dashboard', {
            totalStudents,
            totalCourses,
            totalFees,
            collectedFees,
            pendingFees,
            currentPath: '/'
        });
    } catch (err) {
        console.error(err);
        res.render('dashboard', {
            totalStudents: 0,
            totalCourses: 0,
            totalFees: 0,
            collectedFees: 0,
            pendingFees: 0,
            currentPath: '/',
            error: 'Failed to load dashboard data'
        });
    }
};
