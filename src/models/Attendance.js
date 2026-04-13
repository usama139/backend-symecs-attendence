const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    records: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Present', 'Absent', 'Late'] }
    }]
}, { timestamps: true });

module.exports = AttendanceSchema;
