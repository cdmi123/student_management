const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    receiptNo: {
        type: String,
        unique: true,
        required: true
    },
    registrationNo: {
        type: String, // Matches Student's refNo
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI', 'Cheque'],
        required: true
    },
    paymentDetails: {
        type: String
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Fee', feeSchema);
