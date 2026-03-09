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
    endingDate: { type: Date },

    // Faculty Information
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    },
    batchTime: { type: String },
    pcNo: { type: String }, // PC Number
    runningTopic: { type: String },
    extraNote: { type: String },

    // Admission Details
    refNo: { type: String, unique: true },
    status: { type: String, default: 'R' }, // R for Regular

    // Installment Details
    installments: [installmentSchema],

    // Follow-up Information
    followUpDate: { type: Date },
    followUpNote: { type: String }

}, {
    timestamps: true
});

// Pre-save hook to generate refNo
studentSchema.pre('save', async function () {
    if (!this.refNo) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await mongoose.model('Student').countDocuments();
        this.refNo = `${year}${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Student', studentSchema);
