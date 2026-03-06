const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const studentSchema = new mongoose.Schema({
    // Student Information
    surname: { type: String, required: true },
    studentName: { type: String, required: true },
    fatherName: { type: String, required: true },
    studentContact: { type: String, required: true },
    parentsContact: { type: String },
    address: { type: String },
    dob: { type: Date },
    qualification: { type: String },
    referenceType: {
        type: String,
        enum: ['Internet', 'Student', 'Staff', 'Seminar', 'Others'],
        default: 'Others'
    },
    referenceName: { type: String },
    image: { type: String }, // Filename

    // Course & Faculty Information
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    courseDuration: { type: String },
    dailyTime: {
        type: String,
        enum: ['1H', '2H', '3H', '4H', '6H']
    },
    courseContent: { type: String },
    totalFees: { type: Number, required: true },
    joiningDate: { type: Date, required: true },

    // Installment Details
    installments: [installmentSchema]

}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
