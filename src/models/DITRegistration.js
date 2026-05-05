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
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('DITRegistration', ditRegistrationSchema);
