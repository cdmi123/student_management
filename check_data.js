const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/Student');

async function checkStudent() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_management_system');
    const students = await Student.find();
    console.log(`Found ${students.length} students`);
    students.forEach(s => {
        console.log(`Student: ${s.studentName}, RefNo: ${s.refNo}, TotalFees: ${s.totalFees}, Installments: ${s.installments.length}`);
        console.log('Installment Dates:', s.installments.map(i => i.date));
    });
    process.exit();
}

checkStudent();
