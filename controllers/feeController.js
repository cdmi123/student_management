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

exports.getFeeList = async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate('studentId')
            .populate('facultyId')
            .populate('createdBy')
            .sort({ createdAt: -1 });

        res.render('fee/feeList', {
            fees,
            currentPath: '/fee/list'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/student/list');
    }
};

const { convertNumberToWords } = require('../utils/numberToWords');

exports.getReceipt = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id)
            .populate({
                path: 'studentId',
                populate: { path: 'courseId' } // Populate the nested course inside student
            })
            .populate('facultyId')
            .populate('createdBy');

        if (!fee) {
            return res.redirect('/fee/list');
        }

        const amountInWords = convertNumberToWords(fee.amount);

        res.render('fee/receipt', { fee, amountInWords });
    } catch (err) {
        console.error(err);
        res.redirect('/fee/list');
    }
};

exports.getPaymentReport = async (req, res) => {
    try {
        let { date, month, year } = req.query;
        let query = {};

        // Default to current date if no filters are provided
        if (!date && !month && !year) {
            const now = new Date();
            date = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        }

        // Date-wise filter
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        // Month & Year filter
        else if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
            query.date = { $gte: startOfMonth, $lte: endOfMonth };
        }
        // Year-only filter
        else if (year) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
            query.date = { $gte: startOfYear, $lte: endOfYear };
        }

        const fees = await Fee.find(query)
            .populate('studentId')
            .populate('facultyId')
            .sort({ date: -1 });

        const totalCollection = fees.reduce((sum, fee) => sum + fee.amount, 0);

        res.render('fee/paymentReport', {
            fees,
            totalCollection,
            filters: { date, month, year },
            currentPath: '/fee/report'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/fee/list');
    }
};

exports.getPaymentReportApi = async (req, res) => {
    try {
        let { date, month, year } = req.query;
        let query = {};

        // Default to current date if no filters are provided
        if (!date && !month && !year) {
            const now = new Date();
            date = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        }

        // Date-wise filter
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        // Month & Year filter
        else if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
            query.date = { $gte: startOfMonth, $lte: endOfMonth };
        }
        // Year-only filter
        else if (year) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
            query.date = { $gte: startOfYear, $lte: endOfYear };
        }

        const fees = await Fee.find(query)
            .populate('studentId')
            .populate('facultyId')
            .sort({ date: -1 });

        const totalCollection = fees.reduce((sum, fee) => sum + fee.amount, 0);

        res.json({
            fees,
            totalCollection,
            filters: { date, month, year }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch report data' });
    }
};
