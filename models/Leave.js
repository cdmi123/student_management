const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);
