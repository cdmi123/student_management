const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

exports.getAddFee = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findById(studentId).populate('courseId').populate('facultyId');
        const faculties = await Faculty.find();

        if (!student) {
            return res.redirect('/student/list');
        }

        // Generate dynamic Receipt Number (simple YY-XXXX format)
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const count = await Fee.countDocuments();
        const receiptNo = `R${year}${String(count + 1).padStart(4, '0')}`;

        // Fetch installment for current month or fallback to first available
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        
        // 1. Try exact month match
        let targetInstallment = student.installments.find(inst => {
            const instDate = new Date(inst.date);
            return instDate.getMonth() === currentMonth && instDate.getFullYear() === currentYear;
        });

        // 2. Fallback to first installment if no current month match
        if (!targetInstallment && student.installments.length > 0) {
            targetInstallment = student.installments[0];
        }

        const autoAmount = targetInstallment ? targetInstallment.amount : '';

        res.render('fee/addFee', { 
            student, 
            faculties, 
            receiptNo, 
            autoAmount,
            currentDate: date.toISOString().split('T')[0],
            currentPath: '/student/list'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/student/list');
    }
};

exports.postAddFee = async (req, res) => {
    try {
        const { studentId, receiptNo, registrationNo, amount, paymentMode, paymentDetails, facultyId, createdBy } = req.body;

        const newFee = new Fee({
            studentId,
            receiptNo,
            registrationNo,
            amount: Number(amount),
            paymentMode,
            paymentDetails,
            facultyId,
            createdBy
        });

        await newFee.save();

        // Optional: Update student installments or a "totalPaid" field here if needed
        // For now, we just save the fee record as requested

        res.redirect('/student/list');
    } catch (err) {
        console.error(err);
        // Handle error (re-render form or redirect)
        res.redirect('/student/list');
    }
};
