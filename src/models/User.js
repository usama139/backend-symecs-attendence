const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Teacher', 'Student'], required: true },
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    assignedClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    fatherName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
