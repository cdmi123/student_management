const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        const student = await Student.findById('69abca284f8ff378c3aaf313');
        console.log("Student details:", JSON.stringify(student, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
