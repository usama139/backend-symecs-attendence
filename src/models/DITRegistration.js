const mongoose = require('mongoose');

const ditRegistrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    fatherName: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    batch: {
        type: String,
        default: '36',
    },
    course: {
        type: String,
        default: 'DIT (Diploma in Information Technology) - 1 Year',
    },
    email: {
        type: String,
        default: '',
    },
    dob: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('DITRegistration', ditRegistrationSchema);
